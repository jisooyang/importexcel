import React, { useState } from 'react';
import '../styles/Table.css';

const TaxExemptTable = ({ taxExemptData, regularData }) => {
  const [checkedRows, setCheckedRows] = useState({});
  return (
    <div className="table-container">
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
              <th>Details</th>
              <th>Show</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {regularData.map((cardGroup) => (
              <React.Fragment key={cardGroup.cardNumber}>
                {cardGroup.businesses.map((business, index) => (
                  <tr key={`${cardGroup.cardNumber}-${business.businessRegNum}`}>
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
                    <td> 
                        {(() => {
                          const uniqueLocations = [...new Set(business.arr.map(item => item.이용하신곳))];
                          if (uniqueLocations.length === 1) {
                            return (
                              <div>  {uniqueLocations[0]} </div>
                            );
                          } else {
                            return business.arr.map((item, index) => (
                              <div key={index}> {item.이용하신곳}  </div>
                            ));
                          }
                        })()} 
                    </td>
                    <td data-label="Submitted" className="checkbox-container">
                      <input 
                        type="checkbox"
                        className="custom-checkbox"
                        onChange={(e) => {
                          // Handle checkbox state change
                          console.log(`Row ${cardGroup.cardNumber}-${business.businessRegNum} submitted: ${e.target.checked}`);
                        }}
                      />
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