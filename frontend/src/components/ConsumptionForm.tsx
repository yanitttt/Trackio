import React, { useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import type { Product } from '../types';

interface ConsumptionFormProps {
  products: Product[];
  onSuccess: () => void; // Appelé après une soumission réussie
}

export function ConsumptionForm({ products, onSuccess }: ConsumptionFormProps) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Requête POST vers l'API Flask
      await axios.post('http://localhost:5000/consumption', {
        product_type_id: productId,
        quantity: Number(quantity),
        date,
        note: note.trim() || null,
      });

      // Réinitialiser le formulaire et informer le parent
      setProductId('');
      setQuantity('');
      setNote('');
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la consommation :', err);
      setError('Impossible d\'enregistrer la consommation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Enregistrer une consommation</h2>

        {error && <p className="text-red-500">{error}</p>}
        {isLoading && <p className="text-blue-500">Enregistrement en cours...</p>}

        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
            Produit
          </label>
          <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
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
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantité
          </label>
          <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">
            Note (optionnel)
          </label>
          <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={2}
          />
        </div>

        <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isLoading}
        >
          <Save className="h-5 w-5 mr-2" />
          Enregistrer
        </button>
      </form>
  );
}
