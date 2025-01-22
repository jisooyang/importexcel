import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../styles/Table.css';

const TaxExemptTable = ({ taxExemptData, regularData }) => {
  const [checkedRows, setCheckedRows] = useState({});
    // Function to export regular data
    const exportRegularData = () => {
      // Transform data for Excel
      const excelData = regularData.flatMap(cardGroup =>
        cardGroup.businesses.map(business => ({
          'Card Number': cardGroup.cardNumber,
          'Business Number': business.businessRegNum,
          'Transaction Count': business.count,
          'Total Amount': business.totalAmount,
          'Location': business.arr.map(item => item.이용하신곳).join(', '),
          'Submitted': checkedRows[`${cardGroup.cardNumber}-${business.businessRegNum}`] ? 'Yes' : 'No'
        }))
      );
  
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
  
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Card Number
        { wch: 15 }, // Business Number
        { wch: 10 }, // Transaction Count
        { wch: 15 }, // Total Amount
        { wch: 30 }, // Location
        { wch: 10 }  // Submitted
      ];
      ws['!cols'] = colWidths;
  
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Regular Transactions");
  
      // Export file
      XLSX.writeFile(wb, `Regular_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
  
    // Function to export tax exempt data
    const exportTaxExemptData = () => {
      // Transform data for Excel
      const excelData = taxExemptData.map(item => ({
        'Card Number': item.카드번호,
        'Business Number': item.사업자번호,
        'Amount': item.이용금액,
        'Tax Type': item.과세유형,
        'Location': item.이용하신곳,
        'Sheet': item.sheetName
      }));
  
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
  
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Card Number
        { wch: 15 }, // Business Number
        { wch: 15 }, // Amount
        { wch: 15 }, // Tax Type
        { wch: 30 }, // Location
        { wch: 15 }  // Sheet
      ];
      ws['!cols'] = colWidths;
  
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tax Exempt Transactions");
  
      // Export file
      XLSX.writeFile(wb, `Tax_Exempt_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
  
    // Function to export all data
    const exportAllData = () => {
      const wb = XLSX.utils.book_new();
  
      // Regular transactions sheet
      const regularExcelData = regularData.flatMap(cardGroup =>
        cardGroup.businesses.map(business => ({
          'Card Number': cardGroup.cardNumber,
          'Business Number': business.businessRegNum,
          'Transaction Count': business.count,
          'Total Amount': business.totalAmount,
          'Location': business.arr.map(item => item.이용하신곳).join(', '),
          'Submitted': checkedRows[`${cardGroup.cardNumber}-${business.businessRegNum}`] ? 'Yes' : 'No'
        }))
      );
      const regularWs = XLSX.utils.json_to_sheet(regularExcelData);
      XLSX.utils.book_append_sheet(wb, regularWs, "Regular Transactions");
  
      // Tax exempt transactions sheet
      const taxExemptExcelData = taxExemptData.map(item => ({
        'Card Number': item.카드번호,
        'Business Number': item.사업자번호,
        'Amount': item.이용금액,
        'Tax Type': item.과세유형,
        'Location': item.이용하신곳,
        'Sheet': item.sheetName
      }));
      const taxExemptWs = XLSX.utils.json_to_sheet(taxExemptExcelData);
      XLSX.utils.book_append_sheet(wb, taxExemptWs, "Tax Exempt Transactions");
  
      // Export file
      XLSX.writeFile(wb, `All_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
  return (
    <div className="table-container">
         {/* Export Buttons */}
         <div className="export-buttons">
        <button className="export-btn" onClick={exportRegularData}>
          Export Regular Data
        </button>
        <button className="export-btn" onClick={exportTaxExemptData}>
          Export Tax Exempt Data
        </button>
        <button className="export-btn" onClick={exportAllData}>
          Export All Data
        </button>
      </div>
      {/* Regular Data Table */}
      <div className="table-wrapper">
        <h3>Regular Transactions</h3>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Card Number</th>
              <th>Business Number</th>
              <th>Cnt</th>{/* Transaction Count */}
              <th>Total Amount</th>
              <th>Submitted</th>
              <th>Show</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {regularData.map((cardGroup) => (
              <React.Fragment key={cardGroup.cardNumber}>
                {cardGroup.businesses.map((business, index) => (
                  <tr 
                    key={`${cardGroup.cardNumber}-${business.businessRegNum}`}
                    className={checkedRows[`${cardGroup.cardNumber}-${business.businessRegNum}`] ? 'row-submitted' : ''}
                  >
                    {index === 0 && (
                      <td
                        rowSpan={cardGroup.businesses.length}
                        className="card-number-cell"
                      >
                        {cardGroup.cardNumber}
                      </td>
                    )}
                    <td data-label="Business Number">{business.businessRegNum}</td>
                    <td data-label="Count" className="count-cell">{business.count}</td>
                    <td data-label="Amount" className="amount">{business.totalAmount}</td>
                    <td data-label="Submitted" className="checkbox-container">
                      <input 
                        type="checkbox"
                        className="custom-checkbox"
                        checked={checkedRows[`${cardGroup.cardNumber}-${business.businessRegNum}`] || false}
                        onChange={(e) => {
                          setCheckedRows(prev => ({
                            ...prev,
                            [`${cardGroup.cardNumber}-${business.businessRegNum}`]: e.target.checked
                          }));
                        }}
                      />
                    </td>
                    <td data-label="Show"> 
                      {(() => {
                        const uniqueLocations = [...new Set(business.arr.map(item => item.이용하신곳))];
                        if (uniqueLocations.length === 1) {
                          return (
                            <div className="single-location">
                              <span className="location-text">{uniqueLocations[0]}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="locations-container">
                              {business.arr.map((item, index) => (
                                <div key={index} className="single-location">
                                  <span className="location-text">{item.이용하신곳}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      })()} 
                    </td>
                    <td data-label="Details"> 
                      <button 
                        className="btn-view"
                        onClick={() => {
                          console.log(business.arr);
                        }}
                      >
                        View Details
                      </button> 
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total Regular Transactions:</td>
              <td>{regularData.reduce((sum, group) => 
                sum + group.businesses.reduce((bSum, b) => bSum + b.count, 0), 0
              )}</td>
              <td colSpan={3} className="amount">
                ₩{regularData.reduce((sum, group) => 
                  sum + group.businesses.reduce((bSum, b) => bSum + b.totalAmount, 0), 
                  0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tax Exempt Data Table */}
      <div className="table-wrapper" style={{ marginTop: '2rem' }}>
        <h3>Tax Exempt Transactions</h3>
        <table className="transaction-table tax-exempt-table">
          <thead>
            <tr>
              <th>Card Number</th>
              <th>Business Number</th>
              <th>Amount</th>
              <th>Tax Type</th>
              <th>Location</th>
              <th>Sheet</th>
            </tr>
          </thead>
          <tbody>
            {taxExemptData.map((item, index) => (
              <tr key={index}>
                <td data-label="Card Number">{item.카드번호}</td>
                <td data-label="Business Number">{item.사업자번호}</td>
                <td data-label="Amount" className="amount">
                  ₩{item.이용금액.toLocaleString()}
                </td>
                <td data-label="Tax Type">
                  <span className="tax-type-badge">
                    {item.과세유형}
                  </span>
                </td>
                <td data-label="Location">{item.이용하신곳}</td>
                <td data-label="Sheet">{item.sheetName}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total Tax Exempt Transactions:</td>
              <td colSpan={4} className="amount">
                {taxExemptData.reduce((sum, item) => sum + item.이용금액, 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>      
    </div>
  );
};

export default TaxExemptTable;