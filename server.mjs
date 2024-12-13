import express from "express";
import xlsx from "node-xlsx";
import fs from "fs";

const app = express();
const port = 3000;
const __dirname = 'D:/private/import';


app.get('/', (req, res) => {
  try {
    const workbook = xlsx.parse(fs.readFileSync(__dirname + '/import.xlsx'));
    // Separate arrays for regular and tax-exempt data
    let regularData = [];
    let taxExemptData = [];

      // Process each sheet in the workbook
      workbook.forEach(sheet => {
        const sheetData = sheet.data;
        
        // Skip empty sheets and sheets with no data
        if (!sheetData || sheetData.length === 0) return;
        
        // Assuming first row is headers
        const headers = sheetData[0];
        const array = sheetData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => { 
            if(header === '이용금액') {
              obj[header] = Number(row[index].replace(',', '').trim());
            }else{
              obj[header] = row[index];
            }
          });
          return obj;
        });    
        
        // Process data rows (skip header row)
        for (let i = 1; i < array.length; i++) {
          const row = array[i];
          if (!row || row.length === 0) continue;     
          row['sheetName'] = sheet.name;
          // Check tax type and separate data
          if (row['과세유형'] === '면세사업자') {
            taxExemptData.push(row);
          } else {
            regularData.push(row);
          }
        }
      });

      // 데이터 카드번호 - 사업자 번호로 정렬
      regularData.sort((a, b) => {
        // Get values for field A
        const aFieldA = a['카드번호'];
        const bFieldA = b['카드번호'];
        
        // Compare field A first
        if (aFieldA < bFieldA) return -1;
        if (aFieldA > bFieldA) return 1;
        
        // If field A values are equal, compare field B
        const aFieldB = a['사업자번호'] ;
        const bFieldB = b['사업자번호'];
        
        // Compare field B as secondary sort
        if (aFieldB < bFieldB) return -1;
        if (aFieldB > bFieldB) return 1;
        
        return 0;
      }); 

            //regularData
          /**"카드번호": "",
      "취소여부": "정상",
      "결제방법": "일시불",
      "이용금액": 1370,
      "이용하신곳": "코원에너지서비스(주)-자동이체용",
      "사업자번호": "",
      "과세유형": "일반과세자", */
      const groupedByCard = regularData.reduce((acc, current) => {
        const cardNumber = String(current['카드번호'] || '').trim(); 
        if (!cardNumber) return acc;
         
        if (!acc[cardNumber]) {
          acc[cardNumber] = [];
        } 
        let obj = {...current};
        delete obj['카드번호'];
        acc[cardNumber].push(obj); 

        return acc;
      }, {}); 
      const cardGroupArray = Object.entries(groupedByCard).map(([cardNumber, items]) => {
        // Group items by business registration number
        const groupedByBusiness = items.reduce((acc, current) => {
          const businessRegNum = String(current['사업자번호'] || '').trim();
          
          if (!businessRegNum) return acc;
          
          if (!acc[businessRegNum]) {
            acc[businessRegNum] = [];
          }
          
          acc[businessRegNum].push({...current});
          
          return acc;
        }, {});
        
        const groupArray = Object.entries(groupedByBusiness).map(([businessRegNum, arr]) => ({
          businessRegNum,
          count: arr.length,
          totalAmount: arr.reduce((acc, current) => acc + current['이용금액'], 0),
          arr        
        })); 
        // Return the object with cardNumber and grouped business data
        return {
          cardNumber,
          businesses: groupArray
        };
      });
      

      res.json({ 
        'regularData': cardGroupArray,
        taxExemptData
      });
 
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});