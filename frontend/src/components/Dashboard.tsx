import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Product, DailyConsumption, Unit } from '../types';

interface DashboardProps {
    products: Product[];
    startDate: string;
    endDate: string;
}

export function Dashboard({ products, startDate, endDate }: DashboardProps) {
    const [consumptions, setConsumptions] = useState<DailyConsumption[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const unitMap = new Map(units.map((u) => [u.id, u]));

    // Charger les consommations et les unités depuis l'API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [consumptionResponse, unitResponse] = await Promise.all([
                    axios.get('http://localhost:5000/consumption', {
                        params: { start_date: startDate, end_date: endDate },
                    }),
                    axios.get('http://localhost:5000/units'),
                ]);
                setConsumptions(consumptionResponse.data);
                setUnits(unitResponse.data);
            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des données.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    // Regrouper les produits par unité
    const productsByUnit = products.reduce((acc: { [key: number]: Product[] }, product) => {
        const unitId = product.unit_id;
        if (!acc[unitId]) acc[unitId] = [];
        acc[unitId].push(product);
        return acc;
    }, {});

    // Préparer les données pour les graphiques
    const dailyConsumptionsByUnit = Object.keys(productsByUnit).reduce(
        (acc: { [key: number]: { [key: string]: DailyConsumption } }, unitId) => {
            acc[unitId] = consumptions
                .filter((c) => productsByUnit[unitId].some((p) => p.id === c.product_type_id))
                .reduce((unitAcc: { [key: string]: DailyConsumption }, curr) => {
                    if (!unitAcc[curr.date]) {
                        unitAcc[curr.date] = {
                            date: curr.date,
                            total: 0,
                            products: {},
                        };
                    }

                    unitAcc[curr.date].total += curr.quantity;
                    unitAcc[curr.date].products[curr.product_type_id] =
                        (unitAcc[curr.date].products[curr.product_type_id] || 0) + curr.quantity;

                    return unitAcc;
                }, {});
            return acc;
        },
        {}
    );

    return (
        <div className="space-y-6">
            {isLoading && <p>Chargement des données...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {Object.entries(productsByUnit).map(([unitId, unitProducts]) => {
                const unitName = unitMap.get(Number(unitId))?.name || 'Autre';
                const unitChartData = Object.values(dailyConsumptionsByUnit[unitId] || {}).map((day) => ({
                    date: format(new Date(day.date), 'dd MMM', { locale: fr }),
                    ...day.products,
                }));

                return (
                    <div key={unitId} className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Consommation ({unitName})
                        </h2>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unitChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    {unitProducts.map((product, index) => (
                                        <Bar
                                            key={product.id}
                                            dataKey={product.id}
                                            name={product.name}
                                            fill={`hsl(${index * (360 / unitProducts.length)}, 70%, 50%)`}
                                            stackId="consumption"
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
