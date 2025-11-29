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

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validáció
    const errors = {};
    if (!formData.product_id) errors.product_id = 'Válassz terméket';
    if (!formData.quantity || formData.quantity < 1) errors.quantity = 'Érvényes mennyiséget adj meg';
    if (!formData.sale_price || formData.sale_price < 1) errors.sale_price = 'Érvényes eladási árat adj meg';
    if (!formData.cost_price || formData.cost_price < 1) errors.cost_price = 'Érvényes költséget adj meg';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
    if (!selectedProduct) {
      alert('Kérjük válasszon terméket!');
      return;
    }

    // KÉSZLET ELLENŐRZÉS
    if (parseInt(formData.quantity) > selectedProduct.stock_quantity) {
      alert(`❌ Nincs elég készlet! Csak ${selectedProduct.stock_quantity} db elérhető.`);
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

    console.log('Sales: Eladás küldése', saleData);
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
      setFormErrors({});
      setShowForm(false);
      alert('✅ Eladás sikeresen rögzítve!');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

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

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} - ${product.model}` : 'Ismeretlen termék';
  };

  const getStockForProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.stock_quantity : 0;
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
          {showForm ? '✕ Bezárás' : '➕ Új Eladás'}
        </button>
      </div>

      {showForm && (
        <div className="sales-form-card">
          <h3 className="form-title">Új Eladás Rögzítése</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Termék*</label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className={`form-input ${formErrors.product_id ? 'error' : ''}`}
                  required
                >
                  <option value="">Válassz terméket</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.model} ({product.stock_quantity} db raktáron)
                    </option>
                  ))}
                </select>
                {formErrors.product_id && <span className="error-text">{formErrors.product_id}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Eladás dátuma*</label>
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
                <label className="form-label">Mennyiség (db)*</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`form-input ${formErrors.quantity ? 'error' : ''}`}
                  min="1"
                  max={formData.product_id ? getStockForProduct(parseInt(formData.product_id)) : 1}
                  required
                />
                {formData.product_id && (
                  <small className="stock-info">
                    Elérhető készlet: {getStockForProduct(parseInt(formData.product_id))} db
                  </small>
                )}
                {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Eladási ár (Ft/db)*</label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  className={`form-input ${formErrors.sale_price ? 'error' : ''}`}
                  min="1"
                  required
                />
                {formErrors.sale_price && <span className="error-text">{formErrors.sale_price}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Beszerzési ár (Ft/db)*</label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  className={`form-input ${formErrors.cost_price ? 'error' : ''}`}
                  min="1"
                  required
                />
                {formErrors.cost_price && <span className="error-text">{formErrors.cost_price}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Platform*</label>
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
                  <option value="Marketplace">Marketplace</option>
                  <option value="Egyéb">Egyéb</option>
                </select>
              </div>
            </div>
            
            {formData.sale_price && formData.cost_price && formData.quantity && (
              <div className="profit-preview">
                <h4>Összegzés:</h4>
                <div className="preview-item">
                  <span>Összes bevétel:</span>
                  <span>{(formData.sale_price * formData.quantity).toLocaleString()} Ft</span>
                </div>
                <div className="preview-item">
                  <span>Összes költség:</span>
                  <span>{(formData.cost_price * formData.quantity).toLocaleString()} Ft</span>
                </div>
                <div className="preview-item profit">
                  <span>Teljes profit:</span>
                  <span>{((formData.sale_price * formData.quantity) - (formData.cost_price * formData.quantity)).toLocaleString()} Ft</span>
                </div>
                <div className="preview-item">
                  <span>Profit százalék:</span>
                  <span className="text-success">
                    {formData.sale_price > 0 ? 
                      (((formData.sale_price - formData.cost_price) / formData.cost_price) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                setFormErrors({});
              }}>
                Mégse
              </button>
              <button type="submit" className="btn btn-success">
                ✅ Eladás Rögzítése
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
            <p>Kattints az "Új Eladás" gombra az első eladás rögzítéséhez!</p>
          </div>
        ) : (
          <div className="sales-table-container">
            <div className="table-info">
              <span>Összesen: {sales.length} eladás</span>
              <span>
                Összes bevétel: {sales.reduce((total, sale) => total + (sale.sale_price * sale.quantity), 0).toLocaleString()} Ft
              </span>
            </div>
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
                  
                  return (
                    <tr key={sale.id}>
                      <td>{new Date(sale.sale_date).toLocaleDateString('hu-HU')}</td>
                      <td>{getProductName(sale.product_id)}</td>
                      <td>{sale.quantity} db</td>
                      <td>{(sale.sale_price * sale.quantity).toLocaleString()} Ft</td>
                      <td>
                        <span className={`platform-badge platform-${sale.platform.toLowerCase()}`}>
                          {sale.platform}
                        </span>
                      </td>
                      <td className={profit >= 0 ? 'text-success' : 'text-danger'}>
                        <strong>{profit.toLocaleString()} Ft</strong>
                      </td>
                      <td>
                        <span className={profitPercentage >= 20 ? 'text-success' : profitPercentage >= 10 ? 'text-warning' : 'text-danger'}>
                          <strong>{profitPercentage.toFixed(1)}%</strong>
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