import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import Sales from './pages/Sales/Sales';
import Reports from './pages/Reports/Reports';
import { supabase } from './services/database';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Termékek betöltése
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Eladások betöltése
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (salesError) throw salesError;
      setSales(salesData || []);

    } catch (error) {
      console.error('Hiba az adatok betöltésekor:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSale = async (saleData) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert([saleData])
        .select();

      if (error) throw error;

      setSales(prev => [data[0], ...prev]);
      return true;
    } catch (error) {
      console.error('Hiba az eladás hozzáadásakor:', error);
      return false;
    }
  };

  const addProduct = async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;

      setProducts(prev => [data[0], ...prev]);
      return true;
    } catch (error) {
      console.error('Hiba a termék hozzáadásakor:', error);
      return false;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard sales={sales} products={products} loading={loading} />;
      case 'sales':
        return <Sales sales={sales} products={products} onAddSale={addSale} loading={loading} />;
      case 'reports':
        return <Reports sales={sales} products={products} loading={loading} />;
      default:
        return <Dashboard sales={sales} products={products} loading={loading} />;
    }
  };

  return (
    <div className="App">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        <div className="container">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;