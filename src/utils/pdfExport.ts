import { jsPDF } from 'jspdf';
import { Project, Device, AuditSummary, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';

export function exportProjectToPDF(project: Project, summary: AuditSummary) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = 20;

  // Helper functions for layouts
  const drawHeader = (pageNum: number) => {
    // Top border accent
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Header Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('WaTTrack', margin, 20);

    // Brand tag
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('DESIGNED BY IDNAFEN', margin, 25);

    // Right-aligned Document Label
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text('HOME ENERGY AUDIT REPORT', pageWidth - margin, 20, { align: 'right' });

    // Date
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 25, { align: 'right' });

    // Dividers
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, 29, pageWidth - margin, 29);

    currentY = 38;
  };

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('WaTTrack © 2026 | Comprehensive Home Energy Audits', margin, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  // --- PAGE 1: COVER & DASHBOARD OVERVIEW ---
  drawHeader(1);

  // Project Title Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Project: ${project.name}`, margin + 6, currentY + 10);

  if (project.clientName) {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Client/Audit Host: ${project.clientName}`, margin + 6, currentY + 18);
  } else {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Location: Domestic Property`, margin + 6, currentY + 18);
  }

  // Rate config
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Electricity Rate: ${project.currency}${project.ratePerKWh.toFixed(2)} per kWh`,
    pageWidth - margin - 6,
    currentY + 10,
    { align: 'right' }
  );
  doc.text(
    `Total Devices Audited: ${summary.totalDevicesCount}`,
    pageWidth - margin - 6,
    currentY + 18,
    { align: 'right' }
  );

  currentY += 34;

  // --- KPI Grid Metrics ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Audit Summary Statistics', margin, currentY);
  currentY += 6;

  const cardWidth = (pageWidth - (margin * 2) - 8) / 3;
  const cards = [
    { label: 'DAILY ESTIMATION', valKWh: `${summary.totalDailyKWh.toFixed(2)} kWh`, valCost: `${project.currency}${summary.totalDailyCost.toFixed(2)}` },
    { label: 'MONTHLY ESTIMATION', valKWh: `${summary.totalMonthlyKWh.toFixed(0)} kWh`, valCost: `${project.currency}${summary.totalMonthlyCost.toFixed(2)}` },
    { label: 'ANNUAL ESTIMATION', valKWh: `${summary.totalAnnualKWh.toFixed(0)} kWh`, valCost: `${project.currency}${summary.totalAnnualCost.toFixed(2)}` }
  ];

  cards.forEach((card, idx) => {
    const cardX = margin + (idx * (cardWidth + 4));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, currentY, cardWidth, 24, 1.5, 1.5, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, cardX + 5, currentY + 6);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(card.valCost, cardX + 5, currentY + 14);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(card.valKWh, cardX + 5, currentY + 20);
  });

  currentY += 33;

  // --- Category Breakdown Table ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Energy Breakdown by Category', margin, currentY);
  currentY += 6;

  // Let's calculate actual category stats
  const catStats = CATEGORIES.map(cat => {
    const devicesInCat = project.devices.filter(d => d.category === cat.id);
    const dailyKWh = devicesInCat.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
    const count = devicesInCat.reduce((sum, d) => sum + d.quantity, 0);
    const percentage = summary.totalDailyKWh > 0 ? (dailyKWh / summary.totalDailyKWh) * 100 : 0;
    return { ...cat, dailyKWh, count, percentage };
  }).filter(c => c.count > 0);

  // Draw Category Headers
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Category', margin + 4, currentY + 5.5);
  doc.text('Devices', margin + 60, currentY + 5.5);
  doc.text('Daily Consumption', margin + 95, currentY + 5.5);
  doc.text('Annual Cost', margin + 135, currentY + 5.5);
  doc.text('% Share', margin + 172, currentY + 5.5);

  currentY += 8;

  catStats.forEach(stat => {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 7.5, 'F');

    // Horizontal line
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 7.5, pageWidth - margin, currentY + 7.5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(stat.label, margin + 4, currentY + 5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`${stat.count} unit(s)`, margin + 60, currentY + 5);
    doc.text(`${stat.dailyKWh.toFixed(2)} kWh`, margin + 95, currentY + 5);
    doc.text(`${project.currency}${(stat.dailyKWh * 365 * project.ratePerKWh).toFixed(2)}`, margin + 135, currentY + 5);
    doc.text(`${stat.percentage.toFixed(1)}%`, margin + 172, currentY + 5);

    currentY += 7.5;
  });

  currentY += 8;

  // --- Highlights & Inefficiency Warning ---
  const inefficientDevices = [...project.devices]
    .map(d => ({
      ...d,
      dailyKWh: (d.watts * d.hoursPerDay * d.quantity) / 1000,
      annualCost: ((d.watts * d.hoursPerDay * d.quantity) / 1000) * 365 * project.ratePerKWh
    }))
    .sort((a, b) => b.dailyKWh - a.dailyKWh)
    .slice(0, 3);

  if (inefficientDevices.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('Top Energy Consumers (Priority Focus)', margin, currentY);
    currentY += 5;

    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 226, 226); // red-200
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 24, 1.5, 1.5, 'FD');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(127, 29, 29); // red-900

    let innerY = currentY + 5.5;
    inefficientDevices.forEach((dev, idx) => {
      const catLabel = CATEGORIES.find(c => c.id === dev.category)?.label || dev.category;
      doc.setFont('Helvetica', 'bold');
      doc.text(`${idx + 1}. ${dev.name}`, margin + 5, innerY);
      doc.setFont('Helvetica', 'normal');
      doc.text(
        ` [${catLabel}] runs for ${dev.hoursPerDay} hrs/day at ${dev.watts}W × Qty ${dev.quantity}. Consumes ${dev.dailyKWh.toFixed(2)} kWh/day (~${project.currency}${dev.annualCost.toFixed(2)}/year).`,
        margin + 45,
        innerY
      );
      innerY += 6;
    });

    currentY += 30;
  }

  // Draw first page footer
  drawFooter(1);

  // --- PAGE 2: DETAILED DEVICE REGISTRY ---
  doc.addPage();
  currentY = 20;
  drawHeader(2);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Full Device Inventory & Audit Details', margin, currentY);
  currentY += 6;

  // Inventory Table Header
  doc.setFillColor(51, 65, 85); // slate-700
  doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Device Name', margin + 4, currentY + 5.5);
  doc.text('Category', margin + 44, currentY + 5.5);
  doc.text('Rating (W)', margin + 84, currentY + 5.5);
  doc.text('Daily Hrs', margin + 104, currentY + 5.5);
  doc.text('Qty', margin + 124, currentY + 5.5);
  doc.text('Daily kWh', margin + 139, currentY + 5.5);
  doc.text('Annual Cost', margin + 164, currentY + 5.5);

  currentY += 8;

  project.devices.forEach((dev) => {
    // Page break handling
    if (currentY > pageHeight - 30) {
      drawFooter(doc.internal.pages.length - 1);
      doc.addPage();
      drawHeader(doc.internal.pages.length - 1);
      
      // Reprint Header on new page
      doc.setFillColor(51, 65, 85);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('Device Name', margin + 4, currentY + 5.5);
      doc.text('Category', margin + 44, currentY + 5.5);
      doc.text('Rating (W)', margin + 84, currentY + 5.5);
      doc.text('Daily Hrs', margin + 104, currentY + 5.5);
      doc.text('Qty', margin + 124, currentY + 5.5);
      doc.text('Daily kWh', margin + 139, currentY + 5.5);
      doc.text('Annual Cost', margin + 164, currentY + 5.5);
      currentY += 8;
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');

    // Bottom item divider
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59); // slate-800
    
    // Safely truncate long device names
    let trimmedName = dev.name;
    if (trimmedName.length > 22) {
      trimmedName = trimmedName.substring(0, 20) + '...';
    }
    doc.text(trimmedName, margin + 4, currentY + 4.8);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    const catLabel = CATEGORIES.find(c => c.id === dev.category)?.label || dev.category;
    doc.text(catLabel, margin + 44, currentY + 4.8);

    doc.text(`${dev.watts} W`, margin + 84, currentY + 4.8);
    doc.text(`${dev.hoursPerDay} h/day`, margin + 104, currentY + 4.8);
    doc.text(`${dev.quantity}`, margin + 124, currentY + 4.8);

    const devDailyKWh = (dev.watts * dev.hoursPerDay * dev.quantity) / 1000;
    const devAnnualCost = devDailyKWh * 365 * project.ratePerKWh;

    doc.text(`${devDailyKWh.toFixed(2)} kWh`, margin + 139, currentY + 4.8);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${project.currency}${devAnnualCost.toFixed(2)}`, margin + 164, currentY + 4.8);

    currentY += 7;
  });

  currentY += 10;

  // --- Recommendations Section ---
  if (currentY > pageHeight - 65) {
    drawFooter(doc.internal.pages.length - 1);
    doc.addPage();
    drawHeader(doc.internal.pages.length - 1);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text('Auditor Recommendations & Action Plan', margin, currentY);
  currentY += 5;

  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(204, 251, 241); // teal-100
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 48, 1.5, 1.5, 'FD');

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(13, 148, 136); // teal-600

  let recommendationY = currentY + 5;
  const generalTips = [
    '• Replacement Priority: Swap remaining incandescent bulbs to LED for rapid energy and heat load reduction.',
    '• Load Management: Implement smart plugs or timers to schedule pool pumps, water heaters, and heavy HVAC usage during non-peak utility hours.',
    '• Vampire Slayers: Group home theater or office appliances on a smart standby-limiting strip to instantly terminate phantom loads.',
    '• Cold Wash Laundry: Run washers on Cold Cycles and dryer balls to speed up utility runtimes, reducing cycle costs by up to 80%.',
    '• Regular Filters: Air condition units running on dusty filters expend 15% more power. Replace filters every 3 months.'
  ];

  generalTips.forEach((tip) => {
    doc.text(tip, margin + 5, recommendationY);
    recommendationY += 8;
  });

  drawFooter(doc.internal.pages.length - 1);

  // Save the PDF
  const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`wattrack_audit_${safeName}.pdf`);
}
