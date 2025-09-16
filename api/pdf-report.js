// Client-side PDF generation using jsPDF
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { calculationData } = req.body;
    
    if (!calculationData) {
      return res.status(400).json({ error: 'No calculation data provided' });
    }

    // Return HTML page that generates PDF client-side
    const htmlContent = generatePDFPage(calculationData);
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlContent);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'PDF generation failed' });
  }
}

function generatePDFPage(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Swiss Tax Declaration Report</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"></script>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background: #f5f5f5; 
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #1e3c72; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
          color: #1e3c72;
        }
        .btn { 
          background: #1e3c72; 
          color: white; 
          border: none; 
          padding: 12px 25px; 
          border-radius: 5px; 
          cursor: pointer; 
          font-size: 16px;
          margin: 10px;
        }
        .btn:hover { 
          background: #2a5298; 
        }
        .summary-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0; 
        }
        .summary-table th, .summary-table td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left; 
        }
        .summary-table th { 
          background-color: #f2f2f2; 
          font-weight: bold; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center; margin-bottom: 20px;">
          <button class="btn" onclick="generatePDF()">Download PDF Report</button>
          <button class="btn" onclick="window.close()">Close Window</button>
        </div>
        
        <div class="header">
          <h1>Swiss Tax Declaration Report</h1>
          <p>Tax Year: ${data.taxYear || new Date().getFullYear()}</p>
          <p>Generated: ${new Date().toLocaleDateString('de-CH')}</p>
          <p>Prepared for: ${data.firstName || ''} ${data.lastName || ''}</p>
        </div>

        <div>
          <h2>Wealth Declaration Summary</h2>
          <table class="summary-table">
            <tr><th>Category</th><th>Amount (CHF)</th></tr>
            <tr><td>Movable Assets</td><td>${(data.movableAssets || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Real Estate</td><td>${(data.realEstate || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Total Assets</td><td>${(data.totalAssets || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Total Debts</td><td>${(data.totalDebts || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
            <tr style="font-weight: bold; background-color: #f8f9fa;"><td>Net Wealth</td><td>${(data.netWealth || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
          </table>
        </div>

        <div>
          <h2>Asset Breakdown</h2>
          <table class="summary-table">
            <tr><th>Asset Type</th><th>Value (CHF)</th><th>Classification</th></tr>
            <tr><td>Bank Accounts</td><td>${(data.bankAccounts || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Movable Assets</td></tr>
            <tr><td>Stock Holdings</td><td>${(data.stockHoldings || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Movable Assets</td></tr>
            <tr><td>Swiss Real Estate</td><td>${(data.swissRealEstate || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Private Property</td></tr>
            <tr><td>Foreign Real Estate</td><td>${(data.foreignRealEstate || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>${(data.rentalIncome || 0) > 0 ? 'Business Property' : 'Private Property'}</td></tr>
          </table>
        </div>
      </div>

      <script>
        function generatePDF() {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          // Title
          doc.setFontSize(20);
          doc.text('Swiss Tax Declaration Report', 20, 20);
          
          doc.setFontSize(12);
          doc.text('Tax Year: ${data.taxYear || new Date().getFullYear()}', 20, 30);
          doc.text('Generated: ' + new Date().toLocaleDateString('de-CH'), 20, 40);
          
          // Wealth summary
          doc.autoTable({
            head: [['Category', 'Amount (CHF)']],
            body: [
              ['Movable Assets', '${(data.movableAssets || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}'],
              ['Real Estate', '${(data.realEstate || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}'],
              ['Total Assets', '${(data.totalAssets || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}'],
              ['Total Debts', '${(data.totalDebts || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}'],
              ['Net Wealth', '${(data.netWealth || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}']
            ],
            startY: 50,
            theme: 'grid'
          });
          
          // Save PDF
          doc.save('swiss-tax-report-' + new Date().toISOString().slice(0,10) + '.pdf');
        }
      </script>
    </body>
    </html>
  `;
}