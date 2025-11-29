import React from 'react';
import './Header.css';

const Header = ({ currentPage, onPageChange, user, onLogout }) => {
  const handleLogoutClick = () => {
    if (window.confirm('Biztosan ki szeretnél jelentkezni?')) {
      onLogout();
    }
  };

  return (
    <header className="sales-header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <h1 className="sales-title">AirPods Sales System</h1>
          </div>
          
          <nav className="header-nav">
            <button 
              className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => onPageChange('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-btn ${currentPage === 'inventory' ? 'active' : ''}`}
              onClick={() => onPageChange('inventory')}
            >
              📦 Készlet
            </button>
            <button 
              className={`nav-btn ${currentPage === 'sales' ? 'active' : ''}`}
              onClick={() => onPageChange('sales')}
            >
              🛒 Eladások
            </button>
            <button 
              className={`nav-btn ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => onPageChange('reports')}
            >
              📈 Jelentések
            </button>
          </nav>

          <div className="header-user">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <button 
                className="logout-btn"
                onClick={handleLogoutClick}
                title="Kijelentkezés"
              >
                🚪 Kijelentkezés
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;