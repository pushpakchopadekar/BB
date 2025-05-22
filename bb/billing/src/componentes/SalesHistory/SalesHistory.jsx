import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './SalesHistory.css';

// Toast function
const showToast = (message, type = 'success') => {
  const colors = {
    success: 'linear-gradient(to right, #00b09b, #96c93d)',
    error: 'linear-gradient(to right, #ff416c, #ff4b2b)',
    info: 'linear-gradient(to right, #4b6cb7, #182848)',
    warning: 'linear-gradient(to right, #f46b45, #eea849)'
  };

  const toast = new window.Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: colors[type] || colors.success,
      color: "white",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
    }
  });
  toast.showToast();
};

const SalesHistory = () => {
  // Dummy data with various categories
  const [salesData] = useState([
    {
      id: 'INV-1001',
      date: '2023-06-15',
      customer: 'Rahul Sharma',
      phone: '9876543210',
      totalAmount: 78500,
      paymentMode: 'UPI',
      status: 'Paid',
      category: 'Gold',
      items: [
        { 
          id: 1,
          name: 'Gold Necklace 22K', 
          weight: 12.5, 
          rate: 5830, 
          makingCharge: 15, 
          gst: 3, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-1002',
      date: '2023-06-14',
      customer: 'Priya Patel',
      phone: '8765432109',
      totalAmount: 12500,
      paymentMode: 'Card',
      status: 'Paid',
      category: 'Silver',
      items: [
        { 
          id: 2,
          name: 'Silver Bracelet', 
          weight: 28, 
          rate: 72.5, 
          makingCharge: 10, 
          gst: 0, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-1003',
      date: '2023-06-13',
      customer: 'Amit Singh',
      phone: '7654321098',
      totalAmount: 3500,
      paymentMode: 'Cash',
      status: 'Pending',
      category: 'Imitations',
      items: [
        { 
          id: 3,
          name: 'Imitation Pearl Set', 
          weight: 0, 
          rate: 3500, 
          makingCharge: 0, 
          gst: 18, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-1004',
      date: '2023-06-12',
      customer: 'Neha Gupta',
      phone: '6543210987',
      totalAmount: 45200,
      paymentMode: 'UPI',
      status: 'Paid',
      category: 'Gold',
      items: [
        { 
          id: 4,
          name: 'Gold Bangles 18K', 
          weight: 8.2, 
          rate: 4750, 
          makingCharge: 500, 
          gst: 3, 
          quantity: 2 
        }
      ]
    },
    {
      id: 'INV-1005',
      date: '2023-06-11',
      customer: 'Vikram Joshi',
      phone: '5432109876',
      totalAmount: 8500,
      paymentMode: 'Card',
      status: 'Paid',
      category: 'Silver',
      items: [
        { 
          id: 5,
          name: 'Silver Chain', 
          weight: 15, 
          rate: 72.5, 
          makingCharge: 12, 
          gst: 0, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-1006',
      date: '2023-06-10',
      customer: 'Ananya Reddy',
      phone: '4321098765',
      totalAmount: 2800,
      paymentMode: 'Cash',
      status: 'Paid',
      category: 'Imitations',
      items: [
        { 
          id: 6,
          name: 'Fashion Ring', 
          weight: 0, 
          rate: 2800, 
          makingCharge: 0, 
          gst: 18, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-1007',
      date: '2023-06-09',
      customer: 'Rajesh Kumar',
      phone: '3210987654',
      totalAmount: 62500,
      paymentMode: 'UPI',
      status: 'Paid',
      category: 'Gold',
      items: [
        { 
          id: 7,
          name: 'Gold Earrings 22K', 
          weight: 5.5, 
          rate: 5830, 
          makingCharge: 800, 
          gst: 3, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-1008',
      date: '2023-06-08',
      customer: 'Sneha Iyer',
      phone: '2109876543',
      totalAmount: 9500,
      paymentMode: 'Card',
      status: 'Pending',
      category: 'Silver',
      items: [
        { 
          id: 8,
          name: 'Silver Anklet', 
          weight: 22, 
          rate: 72.5, 
          makingCharge: 8, 
          gst: 0, 
          quantity: 1 
        }
      ]
    }
  ]);

  // State for filters and modal
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: '',
    statusFilter: 'All',
    categoryFilter: 'All'
  });

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Toastify
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
    script.onload = () => {
      setIsLoading(false);
      showToast('Sales history loaded successfully!', 'success');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Filter data with useMemo
  const filteredData = useMemo(() => {
    return salesData.filter(sale => {
      const date = new Date(sale.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      
      return (
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate) &&
        (filters.searchTerm === '' || 
         sale.customer.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
         sale.id.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
        (filters.statusFilter === 'All' || sale.status === filters.statusFilter) &&
        (filters.categoryFilter === 'All' || sale.category === filters.categoryFilter)
      );
    });
  }, [salesData, filters]);

  // CSV Data
  const csvData = useMemo(() => {
    return filteredData.map(sale => ({
      'Invoice No': sale.id,
      'Date': sale.date,
      'Customer Name': sale.customer,
      'Phone': sale.phone,
      'Category': sale.category,
      'Total Amount': sale.totalAmount,
      'Payment Mode': sale.paymentMode,
      'Status': sale.status
    }));
  }, [filteredData]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        Header: 'Invoice No',
        accessor: 'id',
        Cell: ({ row }) => (
          <button 
            className="invoice-link"
            onClick={() => handleViewInvoice(row.original.id)}
          >
            {row.original.id}
          </button>
        ),
        sortType: 'basic'
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN'),
        sortType: (a, b) => {
          return new Date(a.original.date) - new Date(b.original.date);
        }
      },
      {
        Header: 'Customer Name',
        accessor: 'customer',
        sortType: 'alphanumeric'
      },
      {
        Header: 'Category',
        accessor: 'category',
        sortType: 'basic'
      },
      {
        Header: 'Total Amount (₹)',
        accessor: 'totalAmount',
        Cell: ({ value }) => value.toLocaleString('en-IN'),
        sortType: 'basic'
      },
      {
        Header: 'Payment Mode',
        accessor: 'paymentMode',
        sortType: 'basic'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`status-badge ${value.toLowerCase()}`}>
            {value === 'Paid' ? '✅ Paid' : '⏳ Pending'}
          </span>
        ),
        sortType: 'basic'
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div className="action-buttons">
            <button 
              className="view-btn"
              onClick={() => handleViewInvoice(row.original.id)}
              title="View Invoice"
            >
              🔍
            </button>
            <button 
              className="pdf-btn"
              onClick={() => exportSinglePDF(row.original)}
              title="Download PDF"
            >
              📄
            </button>
          </div>
        ),
        disableSortBy: true
      }
    ],
    []
  );

  // Table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy }
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { 
        pageIndex: 0, 
        pageSize: 10,
        sortBy: [{ id: 'date', desc: true }]
      }
    },
    useSortBy,
    usePagination
  );

  // Handlers with useCallback
  const handleViewInvoice = useCallback((invoiceId) => {
    const invoice = salesData.find(sale => sale.id === invoiceId);
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
    showToast(`Invoice ${invoiceId} details opened`, 'info');
  }, [salesData]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setFilters(prev => ({
      ...prev,
      categoryFilter: category
    }));
  }, []);

  // Export single invoice as PDF
  const exportSinglePDF = useCallback((invoice) => {
    const doc = new jsPDF();
    
    // Add business info
    doc.setFontSize(18);
    doc.text('Mere Jewellery', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('123 Jewellery Street, Mumbai - 400001', 105, 22, { align: 'center' });
    doc.text('GSTIN: GSTIN123456789', 105, 29, { align: 'center' });
    
    // Add invoice header
    doc.setFontSize(16);
    doc.text(`INVOICE: ${invoice.id}`, 105, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 105, 47, { align: 'center' });
    
    // Add customer info
    doc.setFontSize(12);
    doc.text(`Customer: ${invoice.customer}`, 20, 60);
    doc.text(`Phone: ${invoice.phone}`, 20, 67);
    doc.text(`Category: ${invoice.category}`, 20, 74);
    
    // Add items table
    doc.autoTable({
      startY: 85,
      head: [['Item', 'Weight (g)', 'Rate', 'Making', 'GST %', 'Qty', 'Amount']],
      body: invoice.items.map(item => [
        item.name,
        item.weight > 0 ? item.weight.toFixed(2) : 'N/A',
        `₹${item.rate.toFixed(2)}`,
        item.makingCharge > 0 ? (item.makingCharge + (typeof item.makingCharge === 'number' ? '₹' : '%')) : 'N/A',
        `${item.gst}%`,
        item.quantity,
        `₹${(item.rate * item.quantity).toFixed(2)}`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [212, 175, 55] } // Gold color
    });
    
    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${invoice.totalAmount.toLocaleString()}`, 20, finalY);
    doc.text(`Payment Mode: ${invoice.paymentMode}`, 20, finalY + 7);
    doc.text(`Status: ${invoice.status}`, 20, finalY + 14);
    
    // Save the PDF
    doc.save(`Invoice_${invoice.id}.pdf`);
    showToast(`PDF for ${invoice.id} downloaded`, 'success');
  }, []);

  // Export all filtered data as PDF
  const exportAllPDF = useCallback(() => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales History Report - Mere Jewellery', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`From: ${filters.startDate || 'Beginning'} To: ${filters.endDate || 'Today'}`, 105, 22, { align: 'center' });
    doc.text(`Category: ${filters.categoryFilter === 'All' ? 'All Categories' : filters.categoryFilter}`, 105, 29, { align: 'center' });
    
    // Add table
    doc.autoTable({
      startY: 40,
      head: [['Invoice No', 'Date', 'Customer', 'Category', 'Amount (₹)', 'Payment', 'Status']],
      body: filteredData.map(sale => [
        sale.id,
        new Date(sale.date).toLocaleDateString(),
        sale.customer,
        sale.category,
        sale.totalAmount.toLocaleString(),
        sale.paymentMode,
        sale.status
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [212, 175, 55] } // Gold color
    });
    
    // Save the PDF
    doc.save('Sales_History.pdf');
    showToast('All sales exported to PDF', 'success');
  }, [filteredData, filters]);

  // Print invoice
  const printInvoice = useCallback(() => {
    const input = document.getElementById('invoice-to-print');
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<img src="${imgData}" onload="window.print();window.close()" />`);
      printWindow.document.close();
    });
    showToast('Invoice sent to printer', 'info');
  }, []);

  if (isLoading) {
    return <div className="loading-container">Loading sales data...</div>;
  }

  return (
    <div className="sales-history">
      {/* Header Section */}
      <div className="sales-history-header">
        <h1>Sales History</h1>
        
        <div className="action-buttons">
          <button 
            className="export-btn"
            onClick={exportAllPDF}
            disabled={filteredData.length === 0}
          >
            📤 Export All (PDF)
          </button>
          
          <CSVLink 
            data={csvData} 
            filename="Sales_History.csv"
            className="export-btn"
            disabled={filteredData.length === 0}
          >
            📊 Export All (Excel)
          </CSVLink>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="filters-section">
        <div className="date-filters">
          <div className="form-group">
            <label>From Date</label>
            <input 
              type="date" 
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="form-group">
            <label>To Date</label>
            <input 
              type="date" 
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              min={filters.startDate}
            />
          </div>
        </div>
        
        <div className="search-filter">
          <input
            type="text"
            name="searchTerm"
            placeholder="Search by customer or invoice no"
            value={filters.searchTerm}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="status-filter">
          <select
            name="statusFilter"
            value={filters.statusFilter}
            onChange={handleFilterChange}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button 
          className={`tab-btn ${filters.categoryFilter === 'All' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('All')}
        >
          All
        </button>
        <button 
          className={`tab-btn ${filters.categoryFilter === 'Gold' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('Gold')}
        >
          Gold
        </button>
        <button 
          className={`tab-btn ${filters.categoryFilter === 'Silver' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('Silver')}
        >
          Silver
        </button>
        <button 
          className={`tab-btn ${filters.categoryFilter === 'Imitations' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('Imitations')}
        >
          Imitations
        </button>
      </div>
      
      {/* Sales Table */}
      <div className="sales-table-container">
        {filteredData.length === 0 ? (
          <div className="no-results">
            No sales records found matching your criteria
          </div>
        ) : (
          <>
            <table {...getTableProps()} className="sales-table">
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        <div className="header-content">
                          {column.render('Header')}
                          <span className="sort-icon">
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                              : ''}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} key={`row-${i}`}>
                      {row.cells.map((cell, j) => {
                        return (
                          <td {...cell.getCellProps()} key={`cell-${i}-${j}`}>
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {'<<'}
              </button>{' '}
              <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                {'<'}
              </button>{' '}
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                {'>'}
              </button>{' '}
              <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'>>'}
              </button>{' '}
              <span>
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>{' '}
              </span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 40, 50].map(size => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      
      {/* Invoice Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div className="invoice-modal">
            <div className="modal-header">
              <h2>Invoice Details</h2>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-content">
              <div id="invoice-to-print" className="invoice-preview">
                <div className="invoice-header">
                  <div className="business-info">
                    <h2>Mere Jewellery</h2>
                    <p>123 Jewellery Street, Mumbai - 400001</p>
                    <p>GSTIN: GSTIN123456789</p>
                  </div>
                  
                  <div className="invoice-meta">
                    <h3>INVOICE: {selectedInvoice.id}</h3>
                    <p>Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="customer-info">
                  <h4>Customer Details</h4>
                  <p>Name: {selectedInvoice.customer}</p>
                  <p>Phone: {selectedInvoice.phone}</p>
                  <p>Category: {selectedInvoice.category}</p>
                </div>
                
                <table className="invoice-items">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Weight (g)</th>
                      <th>Rate</th>
                      <th>Making</th>
                      <th>GST %</th>
                      <th>Qty</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.weight > 0 ? item.weight.toFixed(2) : 'N/A'}</td>
                        <td>₹{item.rate.toFixed(2)}</td>
                        <td>{item.makingCharge > 0 ? (item.makingCharge + (typeof item.makingCharge === 'number' ? '₹' : '%')) : 'N/A'}</td>
                        <td>{item.gst}%</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.rate * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="invoice-totals">
                  <div className="total-row">
                    <span>Total Amount:</span>
                    <span>₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span>Payment Mode:</span>
                    <span>{selectedInvoice.paymentMode}</span>
                  </div>
                  <div className="total-row">
                    <span>Status:</span>
                    <span className={`status-badge ${selectedInvoice.status.toLowerCase()}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="print-btn"
                  onClick={printInvoice}
                >
                  🖨️ Print Invoice
                </button>
                <button 
                  className="pdf-btn"
                  onClick={() => exportSinglePDF(selectedInvoice)}
                >
                  📄 Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;