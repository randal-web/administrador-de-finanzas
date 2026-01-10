import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (period, stats, transactions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Reporte Financiero', 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 28);
  
  // Period Badge
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 35, 120, 10, 2, 2, 'FD');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Periodo del reporte: ${period}`, 18, 41.5);

  // Summary Cards
  const startY = 55;
  const cardWidth = 40;
  const cardHeight = 25;
  const gap = 10;
  
  // Helper to draw little detailed boxes for stats
  const drawStatBox = (x, title, value, color) => {
    // doc.setFillColor(255, 255, 255);
    // doc.setDrawColor(226, 232, 240);
    // doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(title, x, startY);
    
    doc.setFontSize(14);
    doc.setTextColor(...color);
    doc.text(`$${value.toFixed(2)}`, x, startY + 8);
  };

  // Ingresos
  drawStatBox(14, 'Ingresos', stats.income, [16, 185, 129]); // emerald-500
  
  // Gastos
  drawStatBox(14 + 50, 'Gastos', stats.expenses, [244, 63, 94]); // rose-500

  // Ahorros
  drawStatBox(14 + 100, 'Ahorros', stats.savings, [59, 130, 246]); // blue-500

  // Balance
  drawStatBox(14 + 150, 'Balance Neto', stats.balance, [15, 23, 42]); // slate-900

  // Line Separator
  doc.setDrawColor(226, 232, 240);
  doc.line(14, startY + 15, pageWidth - 14, startY + 15);

  // Transactions Table
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Detalle de Transacciones', 14, startY + 28);

  const tableRows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('es-ES'),
    t.description,
    t.category,
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    `$${t.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: startY + 35,
    head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
    body: tableRows,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      textColor: [51, 65, 85]
    },
    headStyles: { 
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    didParseCell: function(data) {
        // Color amount column based on type
        if (data.section === 'body' && data.column.index === 4) {
            const rowIdx = data.row.index;
            const type = transactions[rowIdx].type;
            if (type === 'income') {
                data.cell.styles.textColor = [16, 185, 129];
            } else {
                data.cell.styles.textColor = [244, 63, 94];
            }
        }
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
  }

  doc.save(`Reporte_Finanzas_${period.replace(/ /g, '_')}.pdf`);
};
