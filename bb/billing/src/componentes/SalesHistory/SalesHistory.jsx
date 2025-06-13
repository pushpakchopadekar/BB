import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { database } from '../../firebase';
import { ref, onValue, off } from 'firebase/database';
import './SalesHistory.css';

const SalesHistory = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessages, setToastMessages] = useState([]);

  const showToast = (message, type = 'success') => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToastMessages(prev => [...prev, newToast]);
    setTimeout(() => {
      setToastMessages(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 3000);
  };

  useEffect(() => {
    const salesRef = ref(database, 'sales');
    
    const fetchSalesData = () => {
      onValue(salesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const salesArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            date: data[key].date || new Date().toISOString().split('T')[0],
            customer: data[key].customer?.name || 'Anonymous Customer',
            phone: data[key].customer?.phone || 'N/A',
            totalAmount: data[key].summary?.finalTotal || 0,
            items: data[key].items || []
          }));
          
          setSalesData(salesArray);
          showToast('Sales data loaded successfully!', 'success');
        } else {
          setSalesData([]);
          showToast('No sales data found', 'info');
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching sales data:', error);
        showToast('Failed to load sales data', 'error');
        setLoading(false);
      });
    };

    fetchSalesData();
    return () => off(salesRef);
  }, []);

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
         sale.id.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    });
  }, [salesData, filters]);

  const csvData = useMemo(() => {
    return filteredData.map(sale => ({
      'Invoice No': sale.id,
      'Date': sale.date,
      'Customer Name': sale.customer,
      'Phone': sale.phone,
      'Total Amount': sale.totalAmount
    }));
  }, [filteredData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Invoice No',
        accessor: 'id',
        Cell: ({ value }) => value.slice(-4), // Show only last 4 digits
        sortType: 'basic'
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN'),
        sortType: (a, b) => new Date(a.original.date) - new Date(b.original.date)
      },
      {
        Header: 'Customer Name',
        accessor: 'customer',
        sortType: 'alphanumeric'
      },
      {
        Header: 'Total Amount (₹)',
        accessor: 'totalAmount',
        Cell: ({ value }) => value.toLocaleString('en-IN'),
        sortType: 'basic'
      },
      {
        Header: 'Invoice',
        accessor: 'invoice',
        Cell: ({ row }) => (
          <button 
            className="invoice-btn"
            onClick={() => handleViewInvoice(row.original)}
            title="View Invoice"
          >
            📄 Invoice
          </button>
        ),
        disableSortBy: true
      }
    ],
    []
  );

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
    state: { pageIndex, pageSize, sortBy }
  } = tableInstance;

  const handleViewInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
    showToast(`Invoice ${invoice.id.slice(-4)} details opened`, 'info');
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const exportSinglePDF = useCallback((invoice) => {
    try {
      const doc = new jsPDF();
      
      // Add business info
      doc.setFontSize(18);
      doc.text('Mere Jewellery', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('123 Jewellery Street, Mumbai - 400001', 105, 22, { align: 'center' });
      doc.text('GSTIN: GSTIN123456789', 105, 29, { align: 'center' });
      
      // Add invoice header
      doc.setFontSize(16);
      doc.text(`INVOICE: ${invoice.id.slice(-4)}`, 105, 40, { align: 'center' });
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
          item.productName || item.name || 'Unnamed Product',
          item.weight > 0 ? item.weight.toFixed(2) : 'N/A',
          `₹${item.currentRate?.toFixed(2) || item.rate?.toFixed(2) || '0.00'}`,
          item.makingCharge > 0 ? (item.makingCharge + (typeof item.makingCharge === 'number' ? '₹' : '%')) : 'N/A',
          `${item.gst || 0}%`,
          item.quantity || 1,
          `₹${(item.totalPrice || (item.quantity * (item.currentRate || item.rate || 0))).toFixed(2)}`
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [212, 175, 55] }
      });
      
      // Add totals
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Amount: ₹${invoice.totalAmount?.toLocaleString() || '0'}`, 20, finalY);
      
      // Save the PDF
      doc.save(`Invoice_${invoice.id.slice(-4)}.pdf`);
      showToast(`PDF for ${invoice.id.slice(-4)} downloaded`, 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF', 'error');
    }
  }, []);

  const exportAllPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Sales History Report - Mere Jewellery', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`From: ${filters.startDate || 'Beginning'} To: ${filters.endDate || 'Today'}`, 105, 22, { align: 'center' });
      
      // Add table
      doc.autoTable({
        startY: 35,
        head: [['Invoice No', 'Date', 'Customer', 'Amount (₹)']],
        body: filteredData.map(sale => [
          sale.id.slice(-4),
          new Date(sale.date).toLocaleDateString(),
          sale.customer,
          sale.totalAmount.toLocaleString()
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [212, 175, 55] }
      });
      
      // Save the PDF
      doc.save('Sales_History.pdf');
      showToast('All sales exported to PDF', 'success');
    } catch (error) {
      console.error('Error exporting all PDFs:', error);
      showToast('Failed to export all PDFs', 'error');
    }
  }, [filteredData, filters]);

  const printInvoice = useCallback(() => {
    try {
      const input = document.getElementById('invoice-to-print');
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<img src="${imgData}" onload="window.print();window.close()" />`);
        printWindow.document.close();
      });
      showToast('Invoice sent to printer', 'info');
    } catch (error) {
      console.error('Error printing invoice:', error);
      showToast('Failed to print invoice', 'error');
    }
  }, []);

  if (loading) {
    return <div className="loading-container">Loading sales data...</div>;
  }

  return (
    <div className="sales-history">
      {/* Toast messages */}
      <div className="toast-container">
        {toastMessages.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header Section */}
      <div className="sales-history-header">
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
              <span className="page-info">
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>
              </span>
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                {'>'}
              </button>{' '}
              <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'>>'}
              </button>{' '}
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
              <h2>Invoice Details - {selectedInvoice.id.slice(-4)}</h2>
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
                    <h3>INVOICE: {selectedInvoice.id.slice(-4)}</h3>
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
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName || item.name || `Item ${index + 1}`}</td>
                        <td>{item.weight > 0 ? item.weight.toFixed(2) : 'N/A'}</td>
                        <td>₹{item.currentRate?.toFixed(2) || item.rate?.toFixed(2) || '0.00'}</td>
                        <td>{item.makingCharge > 0 ? (item.makingCharge + (typeof item.makingCharge === 'number' ? '₹' : '%')) : 'N/A'}</td>
                        <td>{item.gst || 0}%</td>
                        <td>{item.quantity || 1}</td>
                        <td>₹{(item.totalPrice || (item.quantity * (item.currentRate || item.rate || 0))).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="invoice-totals">
                  <div className="total-row grand-total">
                    <span>Total Amount:</span>
                    <span>₹{selectedInvoice.totalAmount?.toLocaleString() || '0'}</span>
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