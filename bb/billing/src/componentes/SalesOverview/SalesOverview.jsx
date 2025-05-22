import React, { useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import { FaFilter, FaCalendarAlt, FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa';
import './SalesOverview.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// Sample data for all time ranges
const salesData = {
  weekly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    Gold: [40, 30, 50, 60],
    Silver: [30, 25, 40, 50],
    Imitation: [30, 20, 25, 30]
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    Gold: [4000, 3000, 5000, 2000, 6000, 4500, 5500],
    Silver: [3000, 2500, 4000, 1500, 5000, 3500, 4500],
    Imitation: [3000, 2000, 2500, 1500, 3000, 2000, 2500]
  },
  yearly: {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    Gold: [25000, 30000, 35000, 40000, 45000],
    Silver: [20000, 25000, 30000, 35000, 40000],
    Imitation: [15000, 18000, 20000, 22000, 25000]
  }
};

const SalesOverview = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const currentData = salesData[timeRange];

  // Calculate totals for pie chart
  const totals = {
    Gold: currentData.Gold.reduce((a, b) => a + b, 0),
    Silver: currentData.Silver.reduce((a, b) => a + b, 0),
    Imitation: currentData.Imitation.reduce((a, b) => a + b, 0)
  };

  // Common dataset configuration for bar/line charts with 3D effects
  const datasets = [
    {
      label: 'Gold',
      data: currentData.Gold,
      backgroundColor: 'rgba(255, 215, 0, 0.7)',
      borderColor: 'rgba(255, 215, 0, 1)',
      borderWidth: 2,
      tension: 0.4,
      borderRadius: chartType === 'bar' ? 10 : 0, // 3D effect for bars
      borderSkipped: false,
      barThickness: 30
    },
    {
      label: 'Silver',
      data: currentData.Silver,
      backgroundColor: 'rgba(192, 192, 192, 0.7)',
      borderColor: 'rgba(192, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.4,
      borderRadius: chartType === 'bar' ? 10 : 0,
      borderSkipped: false,
      barThickness: 30
    },
    {
      label: 'Imitation',
      data: currentData.Imitation,
      backgroundColor: 'rgba(205, 127, 50, 0.7)',
      borderColor: 'rgba(205, 127, 50, 1)',
      borderWidth: 2,
      tension: 0.4,
      borderRadius: chartType === 'bar' ? 10 : 0,
      borderSkipped: false,
      barThickness: 30
    }
  ];

  // Pie chart data with 3D effect
  const pieData = {
    labels: ['Gold', 'Silver', 'Imitation'],
    datasets: [{
      data: [totals.Gold, totals.Silver, totals.Imitation],
      backgroundColor: [
        'rgba(255, 215, 0, 0.7)',
        'rgba(192, 192, 192, 0.7)',
        'rgba(205, 127, 50, 0.7)'
      ],
      borderColor: [
        'rgba(255, 215, 0, 1)',
        'rgba(192, 192, 192, 1)',
        'rgba(205, 127, 50, 1)'
      ],
      borderWidth: 1,
      rotation: -45, // 3D rotation effect
      circumference: 250, // Donut effect
      spacing: 5 // Spacing between segments
    }]
  };

  // Chart data for bar/line
  const chartData = {
    labels: currentData.labels,
    datasets: datasets
  };

  // Chart options for bar/line with 3D effects
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Jewellery Sales - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.raw.toLocaleString()}${timeRange === 'weekly' ? 'K' : ''}`;
          }
        },
        displayColors: true,
        usePointStyle: true,
        boxPadding: 6,
        bodySpacing: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: timeRange === 'weekly' ? 'Sales (in thousands)' : 'Sales (₹)',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            return timeRange === 'weekly' ? `${value}K` : `₹${value.toLocaleString()}`;
          }
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        hoverBorderWidth: 3,
        hoverBorderColor: 'rgba(0, 0, 0, 0.3)'
      },
      line: {
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      point: {
        radius: 5,
        hoverRadius: 8,
        backgroundColor: 'white',
        borderWidth: 2
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  // Pie chart options with 3D effects
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Sales Distribution - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ₹${context.raw.toLocaleString()} (${percentage}%)`;
          }
        },
        displayColors: true,
        usePointStyle: true
      }
    },
    cutout: '65%', // Donut effect
    rotation: -45, // Start angle
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return (
    <div className="sales-overview">
      <div className="filter-controls">
        <div className="time-range-selector">
          <button 
            className="filter-button"
            onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <FaFilter className="filter-icon" />
            <span>Time Range</span>
            <FaCalendarAlt className="calendar-icon" />
          </button>
          
          {showTimeRangeDropdown && (
            <div className="time-range-dropdown">
              <button 
                className={timeRange === 'weekly' ? 'active' : ''}
                onClick={() => {
                  setTimeRange('weekly');
                  setShowTimeRangeDropdown(false);
                }}
              >
                Weekly
              </button>
              <button 
                className={timeRange === 'monthly' ? 'active' : ''}
                onClick={() => {
                  setTimeRange('monthly');
                  setShowTimeRangeDropdown(false);
                }}
              >
                Monthly
              </button>
              <button 
                className={timeRange === 'yearly' ? 'active' : ''}
                onClick={() => {
                  setTimeRange('yearly');
                  setShowTimeRangeDropdown(false);
                }}
              >
                Yearly
              </button>
            </div>
          )}
        </div>

        <div className="chart-type-selector">
          <button 
            className={chartType === 'bar' ? 'active' : ''}
            onClick={() => setChartType('bar')}
          >
            <FaChartBar className="chart-icon" />
            <span>Bar</span>
          </button>
          <button 
            className={chartType === 'line' ? 'active' : ''}
            onClick={() => setChartType('line')}
          >
            <FaChartLine className="chart-icon" />
            <span>Line</span>
          </button>
          <button 
            className={chartType === 'pie' ? 'active' : ''}
            onClick={() => setChartType('pie')}
          >
            <FaChartPie className="chart-icon" />
            <span>Pie</span>
          </button>
        </div>
      </div>

      <div className="chart-container1">
        {chartType === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Pie data={pieData} options={pieOptions} />
        )}
      </div>

      <div className="summary-stats">
        <div className="stat-card gold">
          <h3>Total Gold Sales</h3>
          <p>
            {timeRange === 'weekly' ? '₹' : ''}
            {totals.Gold.toLocaleString()}
            {timeRange === 'weekly' ? 'K' : ''}
          </p>
        </div>
        <div className="stat-card silver">
          <h3>Total Silver Sales</h3>
          <p>
            {timeRange === 'weekly' ? '₹' : ''}
            {totals.Silver.toLocaleString()}
            {timeRange === 'weekly' ? 'K' : ''}
          </p>
        </div>
        <div className="stat-card imitation">
          <h3>Total Imitation Sales</h3>
          <p>
            {timeRange === 'weekly' ? '₹' : ''}
            {totals.Imitation.toLocaleString()}
            {timeRange === 'weekly' ? 'K' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;