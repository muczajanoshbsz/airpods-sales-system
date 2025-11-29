import React, { useState } from 'react';
import './Inventory.css';

const Inventory = ({ products, onAddProduct, onUpdateStock, loading }) => {
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showStockUpdateForm, setShowStockUpdateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdateQuantity, setStockUpdateQuantity] = useState('');
  
  const [newProductData, setNewProductData] = useState({
    name: '',
    model: '',
    purchase_price: '',
    stock_quantity: ''
  });

  // Új termék hozzáadása
  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    
    const success = await onAddProduct(newProductData);
    
    if (success) {
      setNewProductData({
        name: '',
        model: '',
        purchase_price: '',
        stock_quantity: ''
      });
      setShowNewProductForm(false);
    }
  };

  // Készlet frissítése
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !stockUpdateQuantity) return;
    
    const success = await onUpdateStock(selectedProduct.id, parseInt(stockUpdateQuantity));
    
    if (success) {
      setSelectedProduct(null);
      setStockUpdateQuantity('');
      setShowStockUpdateForm(false);
    }
  };

  // Készlet növelése gyorsművelettel
  const handleQuickStockUpdate = async (product, amount) => {
    const newQuantity = product.stock_quantity + amount;
    const success = await onUpdateStock(product.id, newQuantity);
    
    if (!success) {
      alert('Hiba a készlet frissítésekor!');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner">Adatok betöltése...</div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">Készlet Kezelés</h1>
        <p className="page-subtitle">Termékek és készlet menedzsment</p>
      </div>

      {/* Gyors műveletek gombok */}
      <div className="inventory-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewProductForm(true)}
        >
          ➕ Új Terméktípus
        </button>
        <button 
          className="btn btn-success"
          onClick={() => setShowStockUpdateForm(true)}
        >
          📦 Készlet Módosítás
        </button>
      </div>

      {/* Statisztikák */}
      <div className="inventory-stats">
        <div className="stat-card">
          <h3 className="stat-title">Összes Terméktípus</h3>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Összes Készlet</h3>
          <p className="stat-value">
            {products.reduce((total, product) => total + product.stock_quantity, 0)} db
          </p>
        </div>
        <div className="stat-card warning">
          <h3 className="stat-title">Alacsony Készlet</h3>
          <p className="stat-value">
            {products.filter(product => product.stock_quantity < 5).length}
          </p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Készlet Érték</h3>
          <p className="stat-value">
            {products.reduce((total, product) => total + (product.purchase_price * product.stock_quantity), 0).toLocaleString()} Ft
          </p>
        </div>
      </div>

      {/* Új termék űrlap */}
      {showNewProductForm && (
        <div className="form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Új Terméktípus Hozzáadása</h3>
              <button 
                className="close-btn"
                onClick={() => setShowNewProductForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddNewProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Termék neve*</label>
                  <input
                    type="text"
                    value={newProductData.name}
                    onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
                    className="form-input"
                    placeholder="Pl.: AirPods Pro 2"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Modell*</label>
                  <input
                    type="text"
                    value={newProductData.model}
                    onChange={(e) => setNewProductData({...newProductData, model: e.target.value})}
                    className="form-input"
                    placeholder="Pl.: AirPods Pro 2"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Beszerzési ár (Ft)*</label>
                  <input
                    type="number"
                    value={newProductData.purchase_price}
                    onChange={(e) => setNewProductData({...newProductData, purchase_price: e.target.value})}
                    className="form-input"
                    placeholder="45000"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Kezdeti készlet (db)*</label>
                  <input
                    type="number"
                    value={newProductData.stock_quantity}
                    onChange={(e) => setNewProductData({...newProductData, stock_quantity: e.target.value})}
                    className="form-input"
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewProductForm(false)}>
                  Mégse
                </button>
                <button type="submit" className="btn btn-success">
                  Termék Hozzáadása
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Készlet módosítás űrlap */}
      {showStockUpdateForm && (
        <div className="form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Készlet Módosítása</h3>
              <button 
                className="close-btn"
                onClick={() => setShowStockUpdateForm(false)}
              >
                ✕
              </button>
            </div>
            
            {!selectedProduct ? (
              <div className="product-selection">
                <h4>Válassz terméket:</h4>
                <div className="product-list">
                  {products.map(product => (
                    <div 
                      key={product.id} 
                      className="product-select-item"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <span className="product-name">{product.name} - {product.model}</span>
                      <span className="product-stock">Jelenleg: {product.stock_quantity} db</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateStock}>
                <div className="selected-product-info">
                  <h4>Kiválasztott termék:</h4>
                  <p><strong>{selectedProduct.name} - {selectedProduct.model}</strong></p>
                  <p>Jelenlegi készlet: <strong>{selectedProduct.stock_quantity} db</strong></p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Új készlet mennyiség (db)*</label>
                  <input
                    type="number"
                    value={stockUpdateQuantity}
                    onChange={(e) => setStockUpdateQuantity(e.target.value)}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <small>Add meg a termék új összes készletét (nem a hozzáadandó mennyiséget!)</small>
                </div>
                
                <div className="quick-actions">
                  <button type="button" className="btn btn-outline" onClick={() => handleQuickStockUpdate(selectedProduct, 1)}>
                    +1 db
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => handleQuickStockUpdate(selectedProduct, 5)}>
                    +5 db
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => handleQuickStockUpdate(selectedProduct, 10)}>
                    +10 db
                  </button>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setSelectedProduct(null);
                    setStockUpdateQuantity('');
                  }}>
                    Vissza
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Készlet Frissítése
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Termék lista */}
      <div className="products-section">
        <h3 className="section-title">Termékek és Készlet</h3>
        
        {products.length === 0 ? (
          <div className="empty-state">
            <p>Még nincsenek termékek. Adj hozzá újat!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h4 className="product-name">{product.name}</h4>
                  <span className={`stock-badge ${product.stock_quantity < 3 ? 'danger' : product.stock_quantity < 10 ? 'warning' : 'success'}`}>
                    {product.stock_quantity} db
                  </span>
                </div>
                <p className="product-model">{product.model}</p>
                
                <div className="product-details">
                  <div className="product-detail">
                    <span className="detail-label">Beszerzési ár:</span>
                    <span className="detail-value">{product.purchase_price.toLocaleString()} Ft</span>
                  </div>
                  <div className="product-detail">
                    <span className="detail-label">Készlet érték:</span>
                    <span className="detail-value">{(product.purchase_price * product.stock_quantity).toLocaleString()} Ft</span>
                  </div>
                </div>
                
                <div className="product-actions">
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleQuickStockUpdate(product, 1)}
                    title="+1 db hozzáadása"
                  >
                    +1
                  </button>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleQuickStockUpdate(product, 5)}
                    title="+5 db hozzáadása"
                  >
                    +5
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setSelectedProduct(product);
                      setStockUpdateQuantity(product.stock_quantity.toString());
                      setShowStockUpdateForm(true);
                    }}
                    title="Készlet módosítása"
                  >
                    Szerkesztés
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;