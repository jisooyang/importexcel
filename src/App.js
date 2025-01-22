import React, { useState, useEffect } from 'react';
import TaxExemptTable from './components/TaxExemptTable';
function App() {
  const [data, setData] = useState({ regularData: [], taxExemptData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      setData(jsonData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="App" style={styles.container}>
      <h2>Loading...</h2>
    </div>
  );

  if (error) return (
    <div className="App" style={styles.container}>
      <h2>Error: {error}</h2>
    </div>
  );

  return (
    // <div className="container">
    //   <h1>Card Transaction Data</h1>
    //   <TaxExemptTable 
    //     taxExemptData={data.taxExemptData}
    //     regularData={data.regularData}
    //   />
    // </div>
    <div className="App" style={styles.container}>
      <h3>Export File: {data.filePath || 'No file selected'}</h3>
       <TaxExemptTable 
         taxExemptData={data.taxExemptData}
         regularData={data.regularData}
       />
      {/* <div style={styles.section}>
        <h2>Regular Data</h2>
        {data.regularData.map((card, index) => (
          <div key={index} style={styles.card}>
            <h3>Card Number: {card.cardNumber}</h3>
            {card.businesses.map((business, bIndex) => (
              <div key={bIndex} style={styles.business}>
                <p>Business Number: {business.businessRegNum}</p>
                <p>Count: {business.count}</p>
                <p>Total Amount: {business.totalAmount}원</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2>Tax Exempt Data</h2>
        <p>Count: {data.taxExemptData.length}</p>
      </div> */}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  card: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  business: {
    marginLeft: '20px',
    padding: '10px',
    borderLeft: '3px solid #007bff'
  }
};

export default App; 