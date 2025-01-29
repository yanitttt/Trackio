import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Save, PlusCircle } from 'lucide-react';
import type { DailyConsumption, Product } from '../types';

export function ConsumptionCRUD() {
    const [consumptions, setConsumptions] = useState<DailyConsumption[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editedConsumption, setEditedConsumption] = useState<Partial<DailyConsumption>>({});
    const [newConsumption, setNewConsumption] = useState<Partial<DailyConsumption>>({
        product_type_id: '',
        date: '',
        quantity: 0,
        note: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Charger les consommations depuis l'API
    useEffect(() => {
        const fetchConsumptions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get<DailyConsumption[]>('http://localhost:5000/consumption');
                setConsumptions(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des consommations :', error);
                setError('Impossible de charger les consommations.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await axios.get<Product[]>('http://localhost:5000/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des produits :', error);
                setError('Impossible de charger les produits.');
            }
        };

        fetchConsumptions();
        fetchProducts();
    }, []);

    // Ajouter une nouvelle consommation
    const handleAddConsumption = async () => {
        if (!newConsumption.product_type_id || !newConsumption.date || !newConsumption.quantity) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            const response = await axios.post<DailyConsumption>('http://localhost:5000/consumption', newConsumption);
            setConsumptions((prev) => [...prev, response.data]);
            setNewConsumption({ product_type_id: '', date: '', quantity: 0, note: '' });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la consommation :', error);
        }
    };

    // Supprimer une consommation
    const handleDeleteConsumption = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/consumption/${id}`);
            setConsumptions((prev) => prev.filter((consumption) => consumption.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression de la consommation :', error);
        }
    };

    // Modifier une consommation
    const handleEditConsumption = async () => {
        if (isEditing === null) return;

        try {
            await axios.put<DailyConsumption>(`http://localhost:5000/consumption/${isEditing}`, editedConsumption);
            setConsumptions((prev) =>
                prev.map((consumption) =>
                    consumption.id === isEditing ? { ...consumption, ...editedConsumption } : consumption
                )
            );
            setIsEditing(null);
            setEditedConsumption({});
        } catch (error) {
            console.error('Erreur lors de la modification de la consommation :', error);
        }
    };

    return (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">Gestion des Consommations</h2>

            {/* Formulaire d'ajout */}
            <div className="flex gap-4 items-end">
                <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                        Produit
                    </label>
                    <select
                        id="product"
                        value={newConsumption.product_type_id}
                        onChange={(e) =>
                            setNewConsumption({ ...newConsumption, product_type_id: Number(e.target.value) })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Sélectionner un produit</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={newConsumption.date}
                        onChange={(e) => setNewConsumption({ ...newConsumption, date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantité
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        value={newConsumption.quantity}
                        onChange={(e) =>
                            setNewConsumption({ ...newConsumption, quantity: Number(e.target.value) })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                        Note
                    </label>
                    <input
                        type="text"
                        id="note"
                        value={newConsumption.note || ''}
                        onChange={(e) => setNewConsumption({ ...newConsumption, note: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={handleAddConsumption}
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    <PlusCircle className="h-5 w-5 inline" /> Ajouter
                </button>
            </div>

            {/* Liste des consommations */}
            <ul className="divide-y divide-gray-200">
                {consumptions.map((consumption) => (
                    <li key={consumption.id} className="py-4 flex justify-between items-center">
                        {isEditing === consumption.id ? (
                            <div className="flex gap-4">
                                <select
                                    value={editedConsumption.product_type_id || ''}
                                    onChange={(e) =>
                                        setEditedConsumption({
                                            ...editedConsumption,
                                            product_type_id: Number(e.target.value),
                                        })
                                    }
                                    className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={editedConsumption.date || ''}
                                    onChange={(e) => setEditedConsumption({ ...editedConsumption, date: e.target.value })}
                                    className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    value={editedConsumption.quantity || ''}
                                    onChange={(e) =>
                                        setEditedConsumption({
                                            ...editedConsumption,
                                            quantity: Number(e.target.value),
                                        })
                                    }
                                    className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={editedConsumption.note || ''}
                                    onChange={(e) => setEditedConsumption({ ...editedConsumption, note: e.target.value })}
                                    className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleEditConsumption}
                                    className="text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    <Save className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {products.find((p) => p.id === consumption.product_type_id)?.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{consumption.date}</p>
                                    <p className="text-sm text-gray-500">Quantité : {consumption.quantity}</p>
                                    <p className="text-sm text-gray-500">Note : {consumption.note || 'Aucune'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(consumption.id);
                                            setEditedConsumption(consumption);
                                        }}
                                        className="text-white bg-yellow-500 px-3 py-2 rounded-md hover:bg-yellow-600"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteConsumption(consumption.id)}
                                        className="text-white bg-red-600 px-3 py-2 rounded-md hover:bg-red-700"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
