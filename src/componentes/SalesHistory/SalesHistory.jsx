import React, { useState, useEffect } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './SalesHistory.css';

const SalesHistory = () => {
  // Sample sales data with unique IDs
  const [salesData, setSalesData] = useState([
    {
      id: 'INV-0012',
      date: '2023-05-15',
      customer: 'Rahul Jain',
      phone: '9876543210',
      totalAmount: 45000,
      paymentMode: 'UPI',
      status: 'Paid',
      items: [
        { 
          id: 1,
          name: 'Gold Chain 22K', 
          weight: 8.5, 
          rate: 5830, 
          makingCharge: 12, 
          gst: 3, 
          quantity: 1 
        },
        { 
          id: 2,
          name: 'Gold Ring 18K', 
          weight: 3.2, 
          rate: 4750, 
          makingCharge: 500, 
          gst: 3, 
          quantity: 1 
        }
      ]
    },
    {
      id: 'INV-0011',
      date: '2023-05-14',
      customer: 'Priya Sharma',
      phone: '8765432109',
      totalAmount: 38000,
      paymentMode: 'Card',
      status: 'Paid',
      items: [
        { 
          id: 3,
          name: 'Silver Bracelet', 
          weight: 25, 
          rate: 72.5, 
          makingCharge: 10, 
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
    statusFilter: 'All'
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debugging effect
  useEffect(() => {
    console.log('SalesHistory mounted');
    return () => console.log('SalesHistory unmounted');
  }, []);

  // Filter sales data
  const filteredData = salesData.filter(sale => {
    const date = new Date(sale.date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    
    return (
      (!startDate || date >= startDate) &&
      (!endDate || date <= endDate) &&
      (filters.searchTerm === '' || 
       sale.customer.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
       sale.id.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
      (filters.statusFilter === 'All' || sale.status === filters.statusFilter)
    );
  });

  // Prepare data for CSV export
  const csvData = filteredData.map(sale => ({
    'Invoice No': sale.id,
    'Date': sale.date,
    'Customer Name': sale.customer,
    'Phone': sale.phone,
    'Total Amount': sale.totalAmount,
    'Payment Mode': sale.paymentMode,
    'Status': sale.status
  }));

  // Table columns
  const columns = React.useMemo(
    () => [
      {
        Header: 'Invoice No',
        accessor: 'id',
        Cell: ({ value }) => (
          <button 
            className="invoice-link"
            onClick={() => handleViewInvoice(value)}
          >
            {value}
          </button>
        )
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
      },
      {
        Header: 'Customer Name',
        accessor: 'customer'
      },
      {
        Header: 'Total Amount (₹)',
        accessor: 'totalAmount',
        Cell: ({ value }) => value.toLocaleString('en-IN')
      },
      {
        Header: 'Payment Mode',
        accessor: 'paymentMode'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`status-badge ${value.toLowerCase()}`}>
            {value === 'Paid' ? '✅ Paid' : '⏳ Pending'}
          </span>
        )
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
        )
      }
    ],
    []
  );

  // React Table instance
  const tableInstance = useTable(
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
    state: { pageIndex, pageSize }
  } = tableInstance;

  // View invoice details
  const handleViewInvoice = (invoiceId) => {
    const invoice = salesData.find(sale => sale.id === invoiceId);
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  // Export single invoice as PDF
  const exportSinglePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Add business info
    doc.setFontSize(18);
    doc.text('Jewellery Billing System', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('123 Business Street, City - 560001', 105, 22, { align: 'center' });
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
    
    // Add items table
    doc.autoTable({
      startY: 80,
      head: [['Item', 'Weight (g)', 'Rate', 'Making', 'GST %', 'Qty', 'Amount']],
      body: invoice.items.map(item => [
        item.name,
        item.weight.toFixed(2),
        `₹${item.rate.toFixed(2)}`,
        item.makingCharge + (typeof item.makingCharge === 'number' ? '₹' : '%'),
        `${item.gst}%`,
        item.quantity,
        `₹${(item.weight * item.rate * item.quantity).toFixed(2)}`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }
    });
    
    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${invoice.totalAmount.toLocaleString()}`, 20, finalY);
    doc.text(`Payment Mode: ${invoice.paymentMode}`, 20, finalY + 7);
    doc.text(`Status: ${invoice.status}`, 20, finalY + 14);
    
    // Save the PDF
    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  // Export all filtered data as PDF
  const exportAllPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales History Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`From: ${filters.startDate || 'Beginning'} To: ${filters.endDate || 'Today'}`, 105, 22, { align: 'center' });
    
    // Add table
    doc.autoTable({
      startY: 30,
      head: [['Invoice No', 'Date', 'Customer', 'Amount (₹)', 'Payment', 'Status']],
      body: filteredData.map(sale => [
        sale.id,
        new Date(sale.date).toLocaleDateString(),
        sale.customer,
        sale.totalAmount.toLocaleString(),
        sale.paymentMode,
        sale.status
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }
    });
    
    // Save the PDF
    doc.save('Sales_History.pdf');
  };

  // Print invoice
  const printInvoice = () => {
    const input = document.getElementById('invoice-to-print');
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<img src="${imgData}" onload="window.print();window.close()" />`);
      printWindow.document.close();
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      ))}
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
                    <h2>Jewellery Billing System</h2>
                    <p>123 Business Street, City - 560001</p>
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
                        <td>{item.weight.toFixed(2)}</td>
                        <td>₹{item.rate.toFixed(2)}</td>
                        <td>{item.makingCharge}{typeof item.makingCharge === 'number' ? '₹' : '%'}</td>
                        <td>{item.gst}%</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.weight * item.rate * item.quantity).toFixed(2)}</td>
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