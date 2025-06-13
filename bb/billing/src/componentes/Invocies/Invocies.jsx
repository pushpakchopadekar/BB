import React, { useState } from 'react';
import { 
  FileText, Search, ChevronDown, ChevronUp, Printer, Download, 
  Filter, Calendar, User, DollarSign
} from 'lucide-react';
import '../Invocies/Invocies.css';

const InvoicePanel = () => {
  // Sample invoice data
  const initialInvoices = [
    { id: 1001, customer: 'Rajesh Kumar', amount: 12500, date: '2023-05-15', items: 3 },
    { id: 1002, customer: 'Priya Sharma', amount: 8450, date: '2023-05-18', items: 2 },
    { id: 1003, customer: 'Amit Patel', amount: 15600, date: '2023-05-10', items: 4 },
    { id: 1004, customer: 'Neha Gupta', amount: 9200, date: '2023-05-22', items: 1 },
    { id: 1005, customer: 'Vikram Singh', amount: 13400, date: '2023-05-05', items: 2 },
    { id: 1006, customer: 'Rajesh Kumar', amount: 7600, date: '2023-05-25', items: 1 },
    { id: 1007, customer: 'Sonia Verma', amount: 11200, date: '2023-05-12', items: 3 },
    { id: 1008, customer: 'Amit Patel', amount: 6800, date: '2023-05-20', items: 2 },
  ];

  const [invoices, setInvoices] = useState(initialInvoices);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedInvoices = [...invoices].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setInvoices(sortedInvoices);
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    return (
      invoice.id.toString().includes(searchTerm) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Export to PDF function
  const handleExportPDF = () => {
    // Implement PDF export functionality here
    console.log('Exporting to PDF...');
  };

  // Export to Excel function
  const handleExportExcel = () => {
    // Implement Excel export functionality here
    console.log('Exporting to Excel...');
  };

  return (
    <div className="invoice-panel">
      <div className="panel-header">
        <h2>Invoices</h2>
        <div className="header-actions">
          <button className="btn-primary">
            <Printer size={18} /> Print
          </button>
          <div className="export-dropdown">
            <button className="btn-secondary">
              <Download size={18} /> Export
            </button>
            <div className="export-options">
              <button onClick={handleExportPDF}>PDF</button>
              <button onClick={handleExportExcel}>Excel</button>
            </div>
          </div>
        </div>
      </div>

      <div className="invoice-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Calendar size={16} />
            <select>
              <option>All Dates</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>
                <div className="th-content">
                  Invoice # {getSortIndicator('id')}
                </div>
              </th>
              <th onClick={() => requestSort('customer')}>
                <div className="th-content">
                  Customer {getSortIndicator('customer')}
                </div>
              </th>
              <th onClick={() => requestSort('date')}>
                <div className="th-content">
                  Date {getSortIndicator('date')}
                </div>
              </th>
              <th onClick={() => requestSort('amount')}>
                <div className="th-content">
                  Amount {getSortIndicator('amount')}
                </div>
              </th>
              <th onClick={() => requestSort('items')}>
                <div className="th-content">
                  Items {getSortIndicator('items')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>#{invoice.id}</td>
                <td>
                  <div className="customer-cell">
                    <User size={16} />
                    {invoice.customer}
                  </div>
                </td>
                <td>{new Date(invoice.date).toLocaleDateString('en-IN')}</td>
                <td>
                  <div className="amount-cell">
                    <DollarSign size={16} />
                    ₹{invoice.amount.toLocaleString('en-IN')}
                  </div>
                </td>
                <td>{invoice.items}</td>
                <td>
                  <button className="action-btn view">View</button>
                  <button className="action-btn print">
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="no-results">
          <FileText size={48} />
          <p>No invoices found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePanel;