import express from "express";
import xlsx from "node-xlsx";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 3000;
const __dirname = 'D:/private/부가세신고/2025_상반기'//'D:/private/import';

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3001', // Allow only your React app  
  methods: ['GET', 'POST'],
  credentials: true
}));

app.get('/', (req, res) => {
  try {
    let filePath = __dirname + '/import.xlsx'
    const workbook = xlsx.parse(fs.readFileSync(filePath));
    // Separate arrays for regular and tax-exempt data
    let regularData = [];
    let taxExemptData = [];

    // Process each sheet in the workbook
    workbook.forEach((sheet,sheetIdx) => {
      const sheetData = sheet.data;
      
      // Skip empty sheets and sheets with no data
      if (!sheetData || sheetData.length === 0) return;
      
      // Assuming first row is headers
      const headers = sheetData[0];
      const mandatoryHeaders = ['이용금액','이용하신곳','사업자번호']
      for (let i = 0; i < mandatoryHeaders.length; i++) {
        const h = mandatoryHeaders[i];
        const r = headers.find(o=> o===h)
        if(!r){          
          throw new Error(`[ERR] 필수 헤더 빠짐 sheetIdx:${sheetIdx}   HEADER:: ${h}`);  
        }        
      }
 
      const array = sheetData.slice(1).map((row, rowIdx) => {
        const obj = {};
        if(!row || row.length<headers.length){
          //데이터가 없는 영역임 무시
          //console.log( 'No Data', rowIdx, row)          
        }else{
          headers.forEach((header, index) => { 
            if(header === '이용금액' && row[index] ) {      
      
              obj[header] = typeof row[index] === 'number' ? row[index] : Number(row[index].replace(/,/g, '').trim());
            }else{
              obj[header] = row[index];
            }
          });
          if(sheetIdx===5) console.log( '    ', obj)   
          return obj;
        }
      });    
        /**
         * 불공제항목
          공연,영화,놀이동산등
          목욕,이발,미용실
          자동차 유지비용(주유비,수리비)
          - 택시,항공,철도,고속버스등

         */
      // Process data rows (skip header row)
      const taxExemptTitles = ['공연']
      for (let i = 1; i < array.length; i++) {
        const row = array[i];
        if (!row || row.length === 0) continue;     
        row['sheetName'] = sheet.name;
        // Check tax type and separate data
        if(!row['이용하신곳']){
          console.log('이용하신곳 데이터 없음',i, row)
        }else if (row['과세유형']   && (row['과세유형'] === '면세사업자'  || row['과세유형'] === '비영리'  || row['과세유형'] === '간이과세자')
          || (    row['사업자번호'] && row['사업자번호']==='1048183559')
          || (    row['이용하신곳'] && (row['이용하신곳'].indexOf('CGV')>-1
                                || row['이용하신곳'].indexOf('주유')>-1
                                || row['이용하신곳'].indexOf('지하철')>-1
                                || row['이용하신곳'].indexOf('택시')>-1
                                || row['이용하신곳'].indexOf('버스')>-1
                                || row['이용하신곳'].indexOf('도로공사')>-1
                                || row['이용하신곳'].indexOf('비대면진료')>-1))) { //지하철,택시,버스, 고속버스
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

    const groupedByCard = regularData.reduce((acc, current) => {
      let cardNumber = String(current['카드번호'] || '').trim();
      /**
       * 6556235110477509
       * 5361488002203254
       * 5272894865295303
       * 9445421423169053
       * 3564150138667097
       * 5570420332534097 -- 사업자신용카드 (제외)
       * 5570420332535805
       * 5570420334344883
       * 9445418099702027 
       * 3564156881245015
       * 9445421423109877
       * 4579737742769094
       * 9445421423169053
       * 4579730788122021
       * 3569122570885748
       * 5439816158058160*/ 
      if (!cardNumber) return acc;
      if(cardNumber.indexOf('7509')>-1){      cardNumber = '6556235110477509'
      }else if(cardNumber.indexOf('3254')>-1){cardNumber = '5361488002203254'
      }else if(cardNumber.indexOf('5303')>-1){cardNumber = '5272894865295303'
      }else if(cardNumber.indexOf('9053')>-1){cardNumber = '9445421423169053'
      }else if(cardNumber.indexOf('7097')>-1){cardNumber = '3564150138667097'
      }else if(cardNumber.indexOf('4097')>-1){cardNumber = '사업자신용카드 (제외)'
      }else if(cardNumber.indexOf('5805')>-1){cardNumber = '5570420332535805'
      }else if(cardNumber.indexOf('4883')>-1){cardNumber = '5570420334344883'
      }else if(cardNumber.indexOf('2027')>-1){cardNumber = '9445418099702027'
      }else if(cardNumber.indexOf('5015')>-1){cardNumber = '3564156881245015'
      }else if(cardNumber.indexOf('5015')>-1){cardNumber = '3564156881245015'
      }else if(cardNumber.indexOf('9877')>-1){cardNumber = '9445421423109877'
      }else if(cardNumber.indexOf('9094')>-1){cardNumber = '4579737742769094'
      }else if(cardNumber.indexOf('9053')>-1){cardNumber = '9445421423169053'
      }else if(cardNumber.indexOf('2021')>-1){cardNumber = '4579730788122021'
      }else if(cardNumber.indexOf('5748')>-1){cardNumber = '3569122570885748'
      }else if(cardNumber.indexOf('8160')>-1){cardNumber = '5439816158058160'
      }else if(cardNumber.indexOf('8030')>-1){cardNumber = '9445415183428030'
      }else if(cardNumber.indexOf('2360')>-1){cardNumber = '5439817700002360'
      }else if(cardNumber.indexOf('1016')>-1){cardNumber = '5570426271731016'
      }else if(cardNumber.indexOf('9029')>-1){cardNumber = '3564156207439029'
      }else if(cardNumber.indexOf('3822')>-1){cardNumber = '5570420929643822'//KB
      }else if(cardNumber.indexOf('1830')>-1){cardNumber = '5570424479641830'//KB
      }else if(cardNumber.indexOf('3093')>-1){cardNumber = '4092177134573093'//NH
      }else if(cardNumber.indexOf('5672')>-1){cardNumber = '546112******5672' //NH
      }
      
        
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
        
        let obj = {...current};
        delete obj['사업자번호']; 
        if(obj['취소여부']==='정상') delete obj['취소여부'];
        if(obj['과세유형']==='일반과세자') delete obj['과세유형'];  
        if(obj['결제방법']==='일시불') delete obj['결제방법']; 
        
        acc[businessRegNum].push(obj);
        
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
      filePath: filePath,
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