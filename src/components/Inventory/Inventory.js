import React, { useState } from 'react';
import './Inventory.css';

const Inventory = ({ products, onAddProduct }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    purchase_price: '',
    stock_quantity: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      purchase_price: parseInt(formData.purchase_price),
      stock_quantity: parseInt(formData.stock_quantity),
      created_at: new Date().toISOString()
    };

    const success = await onAddProduct(productData);
    
    if (success) {
      setFormData({
        name: '',
        model: '',
        purchase_price: '',
        stock_quantity: ''
      });
      setShowForm(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.purchase_price * product.stock_quantity);
  }, 0);

  const lowStockProducts = products.filter(product => product.stock_quantity < 5);

  return (
    <div className="inventory-section">
      <div className="section-header">
        <h2 className="section-title">Készlet Kezelés</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Mégse' : 'Új Termék'}
        </button>
      </div>

      {showForm && (
        <div className="inventory-form-card">
          <h3 className="form-title">Új Termék Hozzáadása</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Termék neve</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Modell</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Beszerzési ár (Ft)</label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Készlet mennyiség</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Termék Hozzáadása
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-stats">
        <div className="stat-card">
          <h4 className="stat-title">Összes Termék</h4>
          <p className="stat-value">{products.length}</p>
        </div>
        
        <div className="stat-card">
          <h4 className="stat-title">Készlet Érték</h4>
          <p className="stat-value">{totalInventoryValue.toLocaleString()} Ft</p>
        </div>
        
        <div className="stat-card warning">
          <h4 className="stat-title">Alacsony Készlet</h4>
          <p className="stat-value">{lowStockProducts.length}</p>
        </div>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h4 className="product-name">{product.name}</h4>
            <p className="product-model">{product.model}</p>
            <div className="product-details">
              <div className="product-detail">
                <span className="detail-label">Beszerzési ár:</span>
                <span className="detail-value">{product.purchase_price.toLocaleString()} Ft</span>
              </div>
              <div className="product-detail">
                <span className="detail-label">Készlet:</span>
                <span className={`detail-value ${product.stock_quantity < 5 ? 'text-danger' : product.stock_quantity < 10 ? 'text-warning' : 'text-success'}`}>
                  {product.stock_quantity} db
                </span>
              </div>
              <div className="product-detail">
                <span className="detail-label">Érték:</span>
                <span className="detail-value">{(product.purchase_price * product.stock_quantity).toLocaleString()} Ft</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;