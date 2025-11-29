import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Sales from './pages/Sales/Sales';
import Reports from './pages/Reports/Reports';
import { supabase, testConnection, getProducts, getSales, addProduct, addSale, updateProductStock } from './services/database';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Ellenőrizzük, hogy van-e aktív session
  useEffect(() => {
    checkAuth();
    checkConnectionAndFetchData();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const checkConnectionAndFetchData = async () => {
    try {
      setLoading(true);
      setConnectionStatus('testing');
      
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');

      if (isConnected && isAuthenticated) {
        await fetchData();
      }
    } catch (error) {
      console.error('App initialization error:', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const productsResult = await getProducts();
      if (productsResult.success) {
        setProducts(productsResult.data);
      }

      const salesResult = await getSales();
      if (salesResult.success) {
        setSales(salesResult.data);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    checkConnectionAndFetchData();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUser(null);
      setSales([]);
      setProducts([]);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddSale = async (saleData) => {
    console.log('App: Eladás hozzáadása kezdete', saleData);
    const result = await addSale(saleData);
    
    if (result.success) {
      setSales(prev => [result.data, ...prev]);
      
      // AUTOMATIKUS KÉSZLETCSÖKKENTÉS
      const product = products.find(p => p.id === parseInt(saleData.product_id));
      if (product) {
        const newStock = product.stock_quantity - parseInt(saleData.quantity);
        await updateProductStock(product.id, newStock);
        await fetchData();
      }
      
      return true;
    } else {
      console.error('Eladás hozzáadása sikertelen:', result.error);
      alert(`Hiba az eladás hozzáadásakor: ${result.error}`);
      return false;
    }
  };

  const handleAddProduct = async (productData) => {
    console.log('App: Termék hozzáadása kezdete', productData);
    const result = await addProduct(productData);
    
    if (result.success) {
      setProducts(prev => [result.data, ...prev]);
      return true;
    } else {
      console.error('Termék hozzáadása sikertelen:', result.error);
      alert(`Hiba a termék hozzáadásakor: ${result.error}`);
      return false;
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    console.log('App: Készlet frissítése', productId, newQuantity);
    const result = await updateProductStock(productId, newQuantity);
    
    if (result.success) {
      await fetchData();
      return true;
    } else {
      console.error('Készlet frissítése sikertelen:', result.error);
      alert(`Hiba a készlet frissítésekor: ${result.error}`);
      return false;
    }
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    if (loading) {
      return (
        <div className="loading-spinner">
          <div className="spinner">Adatok betöltése...</div>
        </div>
      );
    }

    if (connectionStatus === 'error') {
      return (
        <div className="error-message">
          <h3>❌ Adatbázis kapcsolati hiba</h3>
          <p>Nem sikerült csatlakozni az adatbázishoz.</p>
          <button onClick={checkConnectionAndFetchData} className="btn btn-primary">
            Újracsatlakozás
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard sales={sales} products={products} loading={loading} />;
      case 'inventory':
        return <Inventory 
          products={products} 
          onAddProduct={handleAddProduct}
          onUpdateStock={handleUpdateStock}
          loading={loading} 
        />;
      case 'sales':
        return <Sales 
          sales={sales} 
          products={products} 
          onAddSale={handleAddSale} 
          loading={loading} 
        />;
      case 'reports':
        return <Reports sales={sales} products={products} loading={loading} />;
      default:
        return <Dashboard sales={sales} products={products} loading={loading} />;
    }
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <Header 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
      )}
      <main className={`main-content ${!isAuthenticated ? 'login-background' : ''}`}>
        <div className="container">
          {isAuthenticated && connectionStatus === 'connected' && (
            <div className="success-message" style={{marginBottom: '20px', padding: '10px'}}>
              ✅ Sikeresen csatlakozva az adatbázishoz
            </div>
          )}
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;