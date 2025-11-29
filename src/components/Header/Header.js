import React from 'react';
import './Header.css';

const Header = ({ currentPage, onPageChange }) => {
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
              Dashboard
            </button>
            <button 
              className={`nav-btn ${currentPage === 'sales' ? 'active' : ''}`}
              onClick={() => onPageChange('sales')}
            >
              Eladások
            </button>
            <button 
              className={`nav-btn ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => onPageChange('reports')}
            >
              Jelentések
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;