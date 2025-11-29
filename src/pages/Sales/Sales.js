import React, { useState } from 'react';
import './Sales.css';

const Sales = ({ sales, products, onAddSale, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    quantity: 1,
    sale_price: '',
    platform: 'Webshop',
    cost_price: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
    if (!selectedProduct) {
      alert('Kérjük válasszon terméket!');
      return;
    }

    const saleData = {
      ...formData,
      product_id: parseInt(formData.product_id),
      quantity: parseInt(formData.quantity),
      sale_price: parseInt(formData.sale_price),
      cost_price: parseInt(formData.cost_price) || selectedProduct.purchase_price,
      sale_date: new Date(formData.sale_date).toISOString()
    };

    const success = await onAddSale(saleData);
    
    if (success) {
      setFormData({
        product_id: '',
        sale_date: new Date().toISOString().split('T')[0],
        quantity: 1,
        sale_price: '',
        platform: 'Webshop',
        cost_price: ''
      });
      setShowForm(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Ha termék változik, automatikusan feltöltjük a beszerzési árat
    if (name === 'product_id' && value) {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          cost_price: selectedProduct.purchase_price,
          sale_price: Math.round(selectedProduct.purchase_price * 1.3) // 30% profit
        }));
      }
    }
  };

  const calculateProfit = (sale) => {
    return (sale.sale_price * sale.quantity) - (sale.cost_price * sale.quantity);
  };

  const calculateProfitPercentage = (sale) => {
    const revenue = sale.sale_price * sale.quantity;
    const cost = sale.cost_price * sale.quantity;
    return revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner">Adatok betöltése...</div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1 className="page-title">Eladások Kezelése</h1>
        <p className="page-subtitle">Új eladások rögzítése és előzmények</p>
      </div>

      <div className="sales-controls">
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Mégse' : 'Új Eladás'}
        </button>
      </div>

      {showForm && (
        <div className="sales-form-card">
          <h3 className="form-title">Új Eladás Rögzítése</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Termék</label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Válasszon terméket</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.model} ({product.stock_quantity} db raktáron)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Eladás dátuma</label>
                <input
                  type="date"
                  name="sale_date"
                  value={formData.sale_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mennyiség</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Eladási ár (Ft)</label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Beszerzési ár (Ft)</label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="Webshop">Webshop</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Egyéb">Egyéb</option>
                </select>
              </div>
            </div>
            
            {formData.sale_price && formData.cost_price && (
              <div className="profit-preview">
                <div className="preview-item">
                  <span>Bevétel:</span>
                  <span>{(formData.sale_price * formData.quantity).toLocaleString()} Ft</span>
                </div>
                <div className="preview-item">
                  <span>Költség:</span>
                  <span>{(formData.cost_price * formData.quantity).toLocaleString()} Ft</span>
                </div>
                <div className="preview-item profit">
                  <span>Profit:</span>
                  <span>{((formData.sale_price * formData.quantity) - (formData.cost_price * formData.quantity)).toLocaleString()} Ft</span>
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Eladás Rögzítése
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sales-history">
        <h3 className="section-title">Eladási Előzmények</h3>
        
        {sales.length === 0 ? (
          <div className="empty-state">
            <p>Még nincsenek rögzített eladások.</p>
          </div>
        ) : (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Termék</th>
                  <th>Mennyiség</th>
                  <th>Eladási ár</th>
                  <th>Platform</th>
                  <th>Profit</th>
                  <th>Hatékonyság</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => {
                  const profit = calculateProfit(sale);
                  const profitPercentage = calculateProfitPercentage(sale);
                  const product = products.find(p => p.id === sale.product_id);
                  
                  return (
                    <tr key={sale.id}>
                      <td>{new Date(sale.sale_date).toLocaleDateString('hu-HU')}</td>
                      <td>{product ? `${product.name} - ${product.model}` : 'Ismeretlen termék'}</td>
                      <td>{sale.quantity} db</td>
                      <td>{(sale.sale_price * sale.quantity).toLocaleString()} Ft</td>
                      <td>
                        <span className={`platform-badge platform-${sale.platform.toLowerCase()}`}>
                          {sale.platform}
                        </span>
                      </td>
                      <td className={profit >= 0 ? 'text-success' : 'text-danger'}>
                        {profit.toLocaleString()} Ft
                      </td>
                      <td>
                        <span className={profitPercentage >= 20 ? 'text-success' : profitPercentage >= 10 ? 'text-warning' : 'text-danger'}>
                          {profitPercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;