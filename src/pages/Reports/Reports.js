import React, { useState } from 'react';
import './Reports.css';

const Reports = ({ sales, products, loading }) => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Szűrt eladások dátum szerint
  const filteredSales = sales.filter(sale => {
    if (!dateRange.start && !dateRange.end) return true;
    
    const saleDate = new Date(sale.sale_date);
    const startDate = dateRange.start ? new Date(dateRange.start) : new Date('2000-01-01');
    const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
    
    return saleDate >= startDate && saleDate <= endDate;
  });

  // Összesített statisztikák
  const totalRevenue = filteredSales.reduce((total, sale) => total + (sale.sale_price * sale.quantity), 0);
  const totalCost = filteredSales.reduce((total, sale) => total + (sale.cost_price * sale.quantity), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalUnits = filteredSales.reduce((total, sale) => total + sale.quantity, 0);

  // Platformonkénti eladások
  const platformStats = filteredSales.reduce((stats, sale) => {
    if (!stats[sale.platform]) {
      stats[sale.platform] = {
        revenue: 0,
        units: 0,
        profit: 0
      };
    }
    stats[sale.platform].revenue += sale.sale_price * sale.quantity;
    stats[sale.platform].units += sale.quantity;
    stats[sale.platform].profit += (sale.sale_price * sale.quantity) - (sale.cost_price * sale.quantity);
    return stats;
  }, {});

  // Termékenkénti eladások
  const productStats = filteredSales.reduce((stats, sale) => {
    const product = products.find(p => p.id === sale.product_id);
    const productName = product ? `${product.name} - ${product.model}` : 'Ismeretlen termék';
    
    if (!stats[productName]) {
      stats[productName] = {
        revenue: 0,
        units: 0,
        profit: 0
      };
    }
    stats[productName].revenue += sale.sale_price * sale.quantity;
    stats[productName].units += sale.quantity;
    stats[productName].profit += (sale.sale_price * sale.quantity) - (sale.cost_price * sale.quantity);
    return stats;
  }, {});

  // Export CSV funkció
  const exportToCSV = () => {
    const headers = ['Dátum', 'Termék', 'Mennyiség', 'Eladási ár', 'Költség', 'Profit', 'Platform'];
    const csvData = filteredSales.map(sale => {
      const product = products.find(p => p.id === sale.product_id);
      const productName = product ? `${product.name} - ${product.model}` : 'Ismeretlen termék';
      const profit = (sale.sale_price * sale.quantity) - (sale.cost_price * sale.quantity);
      
      return [
        new Date(sale.sale_date).toLocaleDateString('hu-HU'),
        productName,
        sale.quantity,
        sale.sale_price * sale.quantity,
        sale.cost_price * sale.quantity,
        profit,
        sale.platform
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airpods_eladasok_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner">Adatok betöltése...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Részletes Jelentések</h1>
        <p className="page-subtitle">Átfogó elemzések és exportálási lehetőségek</p>
      </div>

      <div className="reports-controls">
        <div className="date-filters">
          <div className="form-group">
            <label className="form-label">Kezdő dátum</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Záró dátum</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="form-input"
            />
          </div>
        </div>
        
        <button className="btn btn-primary" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      <div className="reports-overview">
        <div className="overview-grid">
          <div className="overview-card">
            <h3 className="overview-title">Összes Bevétel</h3>
            <p className="overview-value">{totalRevenue.toLocaleString()} Ft</p>
            <p className="overview-subtitle">{filteredSales.length} eladás</p>
          </div>
          
          <div className="overview-card">
            <h3 className="overview-title">Összes Profit</h3>
            <p className="overview-value">{totalProfit.toLocaleString()} Ft</p>
            <p className="overview-subtitle">{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% hatékonyság</p>
          </div>
          
          <div className="overview-card">
            <h3 className="overview-title">Eladott Mennyiség</h3>
            <p className="overview-value">{totalUnits} db</p>
            <p className="overview-subtitle">{products.length} különböző termék</p>
          </div>
        </div>
      </div>

      <div className="reports-details">
        <div className="report-section">
          <h3 className="section-title">Platformonkénti Megoszlás</h3>
          <div className="platform-stats">
            {Object.entries(platformStats).map(([platform, stats]) => (
              <div key={platform} className="platform-stat-card">
                <h4 className="platform-name">{platform}</h4>
                <div className="platform-details">
                  <div className="platform-detail">
                    <span>Bevétel:</span>
                    <span>{stats.revenue.toLocaleString()} Ft</span>
                  </div>
                  <div className="platform-detail">
                    <span>Eladott db:</span>
                    <span>{stats.units} db</span>
                  </div>
                  <div className="platform-detail">
                    <span>Profit:</span>
                    <span className={stats.profit >= 0 ? 'text-success' : 'text-danger'}>
                      {stats.profit.toLocaleString()} Ft
                    </span>
                  </div>
                  <div className="platform-detail">
                    <span>Hatékonyság:</span>
                    <span className={stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 >= 20 ? 'text-success' : 'text-warning' : 'text-danger'}>
                      {stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h3 className="section-title">Termékenkénti Teljesítmény</h3>
          <div className="product-stats">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Termék</th>
                  <th>Eladott db</th>
                  <th>Bevétel</th>
                  <th>Profit</th>
                  <th>Hatékonyság</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(productStats)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)
                  .map(([product, stats]) => (
                    <tr key={product}>
                      <td>{product}</td>
                      <td>{stats.units} db</td>
                      <td>{stats.revenue.toLocaleString()} Ft</td>
                      <td className={stats.profit >= 0 ? 'text-success' : 'text-danger'}>
                        {stats.profit.toLocaleString()} Ft
                      </td>
                      <td className={stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 >= 20 ? 'text-success' : 'text-warning' : 'text-danger'}>
                        {stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-section">
          <h3 className="section-title">Részletes Eladási Lista</h3>
          <div className="detailed-sales">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Termék</th>
                  <th>Mennyiség</th>
                  <th>Egységár</th>
                  <th>Bevétel</th>
                  <th>Költség</th>
                  <th>Profit</th>
                  <th>Platform</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => {
                  const product = products.find(p => p.id === sale.product_id);
                  const revenue = sale.sale_price * sale.quantity;
                  const cost = sale.cost_price * sale.quantity;
                  const profit = revenue - cost;
                  
                  return (
                    <tr key={sale.id}>
                      <td>{new Date(sale.sale_date).toLocaleDateString('hu-HU')}</td>
                      <td>{product ? `${product.name} - ${product.model}` : 'Ismeretlen termék'}</td>
                      <td>{sale.quantity} db</td>
                      <td>{sale.sale_price.toLocaleString()} Ft</td>
                      <td>{revenue.toLocaleString()} Ft</td>
                      <td>{cost.toLocaleString()} Ft</td>
                      <td className={profit >= 0 ? 'text-success' : 'text-danger'}>
                        {profit.toLocaleString()} Ft
                      </td>
                      <td>{sale.platform}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;