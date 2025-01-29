import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { LayoutDashboard, Edit3, BarChart3 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProductCRUD } from './components/ProductCRUD';
import { ConsumptionCRUD } from './components/ConsumptionCRUD';
import type { Product } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'manage-products' | 'manage-consumptions'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
        setError('Impossible de charger les produits.');
      }
    };

    fetchProducts();
  }, []);

  return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Suivi de Consommation</h1>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-4 mb-8">
            <button
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Tableau de bord
            </button>

            <button
                onClick={() => setActiveTab('manage-products')}
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'manage-products'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Edit3 className="h-5 w-5 mr-2" />
              Gérer les produits
            </button>

            <button
                onClick={() => setActiveTab('manage-consumptions')}
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'manage-consumptions'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Gérer les consommations
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isLoading && <p className="text-blue-500 mb-4">Chargement en cours...</p>}

          {activeTab === 'dashboard' && (
              <Dashboard products={products} startDate={startDate} endDate={endDate} />
          )}

          {activeTab === 'manage-products' && <ProductCRUD />}

          {activeTab === 'manage-consumptions' && <ConsumptionCRUD products={products} />}
        </main>
      </div>
  );
}

export default App;
