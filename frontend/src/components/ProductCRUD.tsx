import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Save } from 'lucide-react';
import type { Product, Unit } from '../types';

export function ProductCRUD() {
    const [products, setProducts] = useState<Product[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editedProduct, setEditedProduct] = useState<Omit<Product, 'id'>>({ name: '', description: '', unit_id: 0 });
    const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', description: '', unit_id: 0 });

    // Charger les produits et unités depuis l'API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productResponse, unitResponse] = await Promise.all([
                    axios.get<Product[]>('http://localhost:5000/products'),
                    axios.get<Unit[]>('http://localhost:5000/units'),
                ]);
                setProducts(productResponse.data);
                setUnits(unitResponse.data);
            } catch (error) {
                console.error('Erreur lors du chargement des données :', error);
            }
        };

        fetchData();
    }, []);

    // Ajouter un nouveau produit
    const handleAddProduct = async () => {
        if (!newProduct.name.trim() || newProduct.unit_id === 0) return;

        try {
            const response = await axios.post<Product>('http://localhost:5000/products', newProduct);
            setProducts((prev) => [...prev, response.data]);
            setNewProduct({ name: '', description: '', unit_id: 0 });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit :', error);
        }
    };

    // Supprimer un produit
    const handleDeleteProduct = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5000/products/${id}`);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression du produit :', error);
        }
    };

    // Modifier un produit
    const handleEditProduct = async () => {
        if (isEditing !== null) {
            try {
                await axios.put<Product>(`http://localhost:5000/products/${isEditing}`, editedProduct);
                setProducts((prev) =>
                    prev.map((product) =>
                        product.id === isEditing ? { ...product, ...editedProduct } : product
                    )
                );
                setIsEditing(null);
                setEditedProduct({ name: '', description: '', unit_id: 0 });
            } catch (error) {
                console.error('Erreur lors de la modification du produit :', error);
            }
        }
    };

    return (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">Gestion des Produits</h2>

            {/* Formulaire d'ajout */}
            <div className="flex gap-4 items-end">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nom
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <input
                        type="text"
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                        Unité
                    </label>
                    <select
                        id="unit"
                        value={newProduct.unit_id}
                        onChange={(e) => setNewProduct({ ...newProduct, unit_id: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value={0}>Sélectionner une unité</option>
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.abbreviation})
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    Ajouter
                </button>
            </div>

            {/* Liste des produits */}
            <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                    <li key={product.id} className="py-4 flex justify-between items-center">
                        {isEditing === product.id ? (
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={editedProduct.name}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={editedProduct.description}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <select
                                    value={editedProduct.unit_id}
                                    onChange={(e) =>
                                        setEditedProduct({ ...editedProduct, unit_id: Number(e.target.value) })
                                    }
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value={0}>Sélectionner une unité</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name} ({unit.abbreviation})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleEditProduct}
                                    className="text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    <Save className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg font-medium">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Unité : {units.find((unit) => unit.id === product.unit_id)?.name}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(product.id);
                                            setEditedProduct({
                                                name: product.name,
                                                description: product.description,
                                                unit_id: product.unit_id,
                                            });
                                        }}
                                        className="text-white bg-yellow-500 px-3 py-2 rounded-md hover:bg-yellow-600"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
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
