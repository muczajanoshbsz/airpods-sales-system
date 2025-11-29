import React from 'react';
import './Stats.css';

const Stats = ({ sales, products }) => {
  // Összes bevétel
  const totalRevenue = sales.reduce((total, sale) => {
    return total + (sale.sale_price * sale.quantity);
  }, 0);

  // Összes költség
  const totalCost = sales.reduce((total, sale) => {
    return total + (sale.cost_price * sale.quantity);
  }, 0);

  // Összes profit
  const totalProfit = totalRevenue - totalCost;

  // Profit százalék
  const profitPercentage = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  // Összes eladott mennyiség
  const totalSold = sales.reduce((total, sale) => total + sale.quantity, 0);

  // Átlagos eladási ár
  const averageSalePrice = totalSold > 0 ? totalRevenue / totalSold : 0;

  // Legnépszerűbb platform
  const platformStats = sales.reduce((stats, sale) => {
    if (!stats[sale.platform]) {
      stats[sale.platform] = 0;
    }
    stats[sale.platform] += sale.quantity;
    return stats;
  }, {});

  const mostPopularPlatform = Object.keys(platformStats).length > 0 
    ? Object.keys(platformStats).reduce((a, b) => platformStats[a] > platformStats[b] ? a : b)
    : 'Nincs adat';

  return (
    <div className="stats-section">
      <h2 className="section-title">Áttekintő Statisztikák</h2>
      
      <div className="stats-grid">
        <div className="stat-item revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3 className="stat-label">Összes Bevétel</h3>
            <p className="stat-number">{totalRevenue.toLocaleString()} Ft</p>
          </div>
        </div>

        <div className="stat-item profit">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3 className="stat-label">Összes Profit</h3>
            <p className="stat-number">{totalProfit.toLocaleString()} Ft</p>
            <p className="stat-percentage">{profitPercentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-item sold">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3 className="stat-label">Eladott Termékek</h3>
            <p className="stat-number">{totalSold} db</p>
          </div>
        </div>

        <div className="stat-item average">
          <div className="stat-icon">⚖️</div>
          <div className="stat-info">
            <h3 className="stat-label">Átlagos Eladási Ár</h3>
            <p className="stat-number">{averageSalePrice.toLocaleString()} Ft</p>
          </div>
        </div>

        <div className="stat-item platform">
          <div className="stat-icon">🌐</div>
          <div className="stat-info">
            <h3 className="stat-label">Legnépszerűbb Platform</h3>
            <p className="stat-number">{mostPopularPlatform}</p>
          </div>
        </div>

        <div className="stat-item cost">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <h3 className="stat-label">Összes Költség</h3>
            <p className="stat-number">{totalCost.toLocaleString()} Ft</p>
          </div>
        </div>
      </div>

      <div className="profit-breakdown">
        <h3 className="breakdown-title">Profit Megoszlás</h3>
        <div className="breakdown-bars">
          <div className="breakdown-item">
            <span className="breakdown-label">Bevétel</span>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill revenue-fill" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <span className="breakdown-value">{totalRevenue.toLocaleString()} Ft</span>
          </div>
          
          <div className="breakdown-item">
            <span className="breakdown-label">Költség</span>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill cost-fill" 
                style={{ width: `${totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="breakdown-value">{totalCost.toLocaleString()} Ft</span>
          </div>
          
          <div className="breakdown-item">
            <span className="breakdown-label">Profit</span>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill profit-fill" 
                style={{ width: `${profitPercentage}%` }}
              ></div>
            </div>
            <span className="breakdown-value">{totalProfit.toLocaleString()} Ft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;