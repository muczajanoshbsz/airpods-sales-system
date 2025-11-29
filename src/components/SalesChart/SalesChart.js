import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './SalesChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SalesChart = ({ sales, products }) => {
  // Havonta összesített bevételek
  const getMonthlyRevenue = () => {
    const monthlyData = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.sale_date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += sale.sale_price * sale.quantity;
    });
    
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(label => monthlyData[label]);
    
    return { labels, data };
  };

  // Platformonkénti eladások
  const getSalesByPlatform = () => {
    const platformData = {};
    
    sales.forEach(sale => {
      if (!platformData[sale.platform]) {
        platformData[sale.platform] = 0;
      }
      platformData[sale.platform] += sale.quantity;
    });
    
    const labels = Object.keys(platformData);
    const data = labels.map(label => platformData[label]);
    
    return { labels, data };
  };

  const monthlyRevenue = getMonthlyRevenue();
  const platformSales = getSalesByPlatform();

  const revenueChartData = {
    labels: monthlyRevenue.labels,
    datasets: [
      {
        label: 'Havi Bevétel (Ft)',
        data: monthlyRevenue.data,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const platformChartData = {
    labels: platformSales.labels,
    datasets: [
      {
        data: platformSales.data,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(72, 187, 120, 0.8)',
          'rgba(237, 137, 54, 0.8)',
          'rgba(245, 101, 101, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(72, 187, 120, 1)',
          'rgba(237, 137, 54, 1)',
          'rgba(245, 101, 101, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3 className="chart-title">Havi Bevétel</h3>
        <div className="chart-wrapper">
          <Bar data={revenueChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="chart-card">
        <h3 className="chart-title">Eladások Források Szerint</h3>
        <div className="chart-wrapper">
          <Doughnut data={platformChartData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default SalesChart;