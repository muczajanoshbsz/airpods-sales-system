import React from 'react';
import './Dashboard.css';
import Stats from '../../components/Stats/Stats';
import SalesChart from '../../components/SalesChart/SalesChart';
import Inventory from '../../components/Inventory/Inventory';

const Dashboard = ({ sales, products, loading }) => {
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner">Adatok betöltése...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">AirPods eladások áttekintése és elemzése</p>
      </div>

      <Stats sales={sales} products={products} />
      
      <SalesChart sales={sales} products={products} />
      
      <Inventory products={products} onAddProduct={() => {}} />
    </div>
  );
};

export default Dashboard;