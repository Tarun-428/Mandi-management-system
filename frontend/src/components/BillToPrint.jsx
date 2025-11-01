import React from 'react';

// --- Helper Function: Number to Words (Indian English) ---
// This is self-contained so you don't need a new library
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n === 0) return '';
    if (n < 20) {
      str = a[n];
    } else {
      let digit = n % 10;
      str = b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    }
    return str;
  };

  let n = Math.floor(num);
  if (n === 0) return 'Zero Only';
  
  let str = '';
  let crore = Math.floor(n / 10000000); n %= 10000000;
  if (crore) str += inWords(crore) + ' Crore ';
  
  let lakh = Math.floor(n / 100000); n %= 100000;
  if (lakh) str += inWords(lakh) + ' Lakh ';
  
  let thousand = Math.floor(n / 1000); n %= 1000;
  if (thousand) str += inWords(thousand) + ' Thousand ';
  
  let hundred = Math.floor(n / 100); n %= 100;
  if (hundred) str += inWords(hundred) + ' Hundred ';
  
  if (n) str += inWords(n);
  
  return str.trim() + ' Only';
};
// --- End Helper Function ---


export const BillToPrint = React.forwardRef((props, ref) => {
  // Destructure all the data passed from CreateBill
  const { formData, items, totals, savedId } = props.data;
  
  const billDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const grandTotalInWords = numberToWords(totals.grandTotal);

  // --- Inline Styles for Printing ---
  const styles = {
    page: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#000',
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '10px',
    },
    companyName: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0',
    },
    address: {
      fontSize: '10px',
      margin: '0',
    },
    tagline: {
      fontSize: '11px',
      fontWeight: 'bold',
      margin: '5px 0',
    },
    infoBox: {
      border: '1px solid #000',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '5px',
    },
    infoLeft: {
      width: '60%',
    },
    infoRight: {
      width: '40%',
    },
    infoRow: {
      display: 'flex',
      marginBottom: '3px',
    },
    infoLabel: {
      fontWeight: 'bold',
      width: '100px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #000',
      marginTop: '1px',
    },
    th: {
      border: '1px solid #000',
      padding: '4px',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    td: {
      border: '1px solid #000',
      padding: '4px',
      textAlign: 'left',
    },
    tdCenter: {
      border: '1px solid #000',
      padding: '4px',
      textAlign: 'center',
    },
    tdRight: {
      border: '1px solid #000',
      padding: '4px',
      textAlign: 'right',
    },
    totalsSection: {
      display: 'flex',
      border: '1px solid #000',
      borderTop: 'none',
    },
    totalsLeft: {
      width: '60%',
      padding: '5px',
      borderRight: '1px solid #000',
    },
    totalsRight: {
      width: '40%',
    },
    chargeRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '2px 5px',
    },
    netAmount: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold',
      padding: '5px',
      border: '1px solid #000',
      borderTop: 'none',
      fontSize: '14px',
    },
    rupees: {
      padding: '5px',
      border: '1px solid #000',
      borderTop: 'none',
    },
    signature: {
      textAlign: 'right',
      marginTop: '30px',
    },
    // Stub Styles
    stub: {
      borderTop: '2px dashed #000',
      marginTop: '25px',
      paddingTop: '15px',
    },
    stubHeader: {
      textAlign: 'center',
      marginBottom: '10px',
    },
    stubCompanyName: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0',
    },
    stubRow: {
      display: 'flex',
      justifyContent: 'space-between',
      border: '1px solid #000',
      padding: '5px',
    },
    stubRowBottom: {
      display: 'flex',
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderTop: 'none',
      padding: '5px',
      fontWeight: 'bold',
    },
  };
  // --- End Styles ---
  
  return (
    <div ref={ref} style={styles.page}>
      
      {/* --- Main Bill --- */}
      
      {/* 1. Header */}
      <div style={styles.header}>
        <h2 style={styles.companyName}>KRISHNA TRADERS</h2>
        <p style={styles.address}>Sardar Patel Colony, SHAJAPUR (M.P.)</p>
        <p style={styles.address}>Aditya 7803024246, ANIL - 07527421272, Sunil - 9926590952, 9424063203, 9165488714</p>
        <p style={styles.tagline}>आलू, प्याज, लहसुन के थोक विक्रेता एवं कमीशन एजेंट</p>
      </div>

      {/* 2. Bill/Farmer Info */}
      <div style={styles.infoBox}>
        <div style={styles.infoLeft}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>नाम:</span>
            <span>{formData.farmer_name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>गांव:</span>
            <span>{formData.village_name}</span>
          </div>
        </div>
        <div style={styles.infoRight}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>बिल नंबर:</span>
            <span>{savedId || 'N/A'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>बिल दिनांक:</span>
            <span>{billDate}</span>
          </div>
        </div>
      </div>

      {/* 3. Items Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>विवरण</th>
            <th style={styles.th}>ना (Bags)</th>
            <th style={styles.th}>वजन (Weight)</th>
            <th style={styles.th}>भाव (Rate)</th>
            <th style={styles.th}>रकम (Amount)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={styles.td}>{item.vegetable}</td>
              <td style={styles.tdCenter}>{item.bags}</td>
              <td style={styles.tdRight}>{parseFloat(item.weight).toFixed(2)}</td>
              <td style={styles.tdRight}>{parseFloat(item.rate).toFixed(2)}</td>
              <td style={styles.tdRight}>{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 'bold' }}>
            <td style={styles.td}>कुल</td>
            <td style={styles.tdCenter}>{totals.totalBags}</td>
            <td style={styles.tdRight}>{totals.totalWeight.toFixed(2)}</td>
            <td style={styles.td}></td>
            <td style={styles.tdRight}>{totals.subtotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* 4. Totals & Deductions */}
      <div style={styles.totalsSection}>
        <div style={styles.totalsLeft}>
          <p style={{ fontWeight: 'bold', margin: '0' }}>किसान बिल</p>
          {/* You can add other details here if needed */}
        </div>
        <div style={styles.totalsRight}>
          <div style={styles.chargeRow}>
            <span>Hammali:</span>
            <span>{parseFloat(formData.himmali || 0).toFixed(2)}</span>
          </div>
          <div style={styles.chargeRow}>
            <span>Bharai:</span>
            <span>{parseFloat(formData.bharai || 0).toFixed(2)}</span>
          </div>
          <div style={styles.chargeRow}>
            <span>Motor Bhada:</span>
            <span>{parseFloat(formData.motor_bhada || 0).toFixed(2)}</span>
          </div>
          <div style={styles.chargeRow}>
            <span>Other Charges:</span>
            <span>{parseFloat(formData.other_charges || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* 5. Net Amount */}
      <div style={styles.netAmount}>
        <span>नेट रकम</span>
        <span>{totals.grandTotal.toFixed(2)}</span>
      </div>
      
      {/* 6. Amount in Words */}
      <div style={styles.rupees}>
        <strong>Rupees:</strong> {grandTotalInWords}
      </div>
      
      {/* 7. Signature */}
      <div style={styles.signature}>
        हस्ताक्षर
      </div>

      {/* --- Receipt Stub --- */}
      <div style={styles.stub}>
        <div style={styles.stubHeader}>
          <h3 style={styles.stubCompanyName}>KRISHNA TRADERS</h3>
          <p style={styles.address}>Sardar Patel Colony, SHAJAPUR (M.P.)</p>
        </div>
        <div style={styles.stubRow}>
          <span><strong>बिल नंबर:</strong> {savedId || 'N/A'}</span>
          <span><strong>दिनांक:</strong> {billDate}</span>
        </div>
        <div style={styles.stubRow}>
          <span colSpan="2">
            <strong>Paid To:</strong> {formData.farmer_name}, {formData.village_name}
          </span>
        </div>
        <div style={styles.stubRow}>
          <span colSpan="2">
            <strong>Thru Cheque No / Cash</strong>
          </span>
        </div>
        <div style={styles.stubRowBottom}>
          <span><strong>Rupees:</strong> {grandTotalInWords}</span>
          <span><strong>₹ {totals.grandTotal.toFixed(2)}</strong></span>
        </div>
      </div>
      
    </div>
  );
});

export default BillToPrint;