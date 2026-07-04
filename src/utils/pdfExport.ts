import { jsPDF } from 'jspdf';
import { Project, Device, AuditSummary, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { generatePersonalizedTips } from './tipGenerator';

export function exportProjectToPDF(project: Project, summary: AuditSummary, language: 'en' | 'fr' = 'en') {
  const isFr = language === 'fr';

  const limitText = (text: string, max: number): string => {
    if (!text) return '';
    return text.length > max ? text.substring(0, max - 3) + '...' : text;
  };

  const getShortCatLabel = (catId: string, lang: 'en' | 'fr'): string => {
    const isFrench = lang === 'fr';
    switch (catId) {
      case 'heating_cooling': return isFrench ? 'CVC' : 'HVAC';
      case 'kitchen': return isFrench ? 'CUISINE' : 'KITCHEN';
      case 'lighting': return isFrench ? 'ÉCLAIRAGE' : 'LIGHTING';
      case 'entertainment': return isFrench ? 'MEDIA' : 'MEDIA';
      case 'office_tech': return isFrench ? 'BUREAU' : 'OFFICE';
      case 'laundry_utility': return isFrench ? 'BUANDERIE' : 'UTILITY';
      default: return isFrench ? 'AUTRES' : 'OTHER';
    }
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = 20;

  // --- Translation Dictionary for PDF ---
  const t = {
    docLabel: isFr ? 'FICHE D\'ENREGISTREMENT D\'AUDIT ÉNERGÉTIQUE' : 'ENERGY AUDIT RECORD SHEET',
    dateLabel: isFr ? 'DATE' : 'DATE',
    pageLabel: isFr ? 'PAGE' : 'PAGE',
    designedBy: isFr ? 'CONÇU PAR IDNAFEN // VER DE SYSTÈME v1.0.4' : 'DESIGNED BY IDNAFEN // SYSTEM VER v1.0.4',
    auditPrefix: isFr ? 'AUDIT :' : 'AUDIT:',
    locationLabel: isFr ? 'HÔTE / PROPRIÉTÉ :' : 'HOST / LOCATION:',
    domesticProperty: isFr ? 'PROPRIÉTÉ DOMESTIQUE' : 'DOMESTIC PROPERTY',
    auditorNameLabel: isFr ? 'NOM DE L\'AUDITEUR :' : 'AUDITOR NAME:',
    tariffRate: isFr ? 'TARIF DE RÉFÉRENCE :' : 'TARIFF RATE:',
    registryDevices: isFr ? 'APPAREILS AUDITÉS :' : 'REGISTRY DEVICES:',
    consumptionMetricsHeader: isFr ? 'INDICES DE CONSOMMATION DU FONCTIONNEMENT' : 'AUDITED RUNTIME CONSUMPTION METRICS',
    cardDaily: isFr ? 'CHARGE QUOTIDIENNE' : 'DAILY RUNTIME LOAD',
    cardMonthly: isFr ? 'CHARGE MENSUELLE DE PÉRIODE' : 'MONTHLY PERIOD LOAD',
    cardAnnual: isFr ? 'SOMMAIRE ANNUEL' : 'ANNUALIZED SUMMARY',
    perDay: isFr ? '/ jour' : '/ day',
    perMonth: isFr ? '/ mois' : '/ month',
    perYear: isFr ? '/ an' : '/ year',
    categoryFootprintHeader: isFr ? 'REPARTITION PAR CATÉGORIE FONCTIONNELLE' : 'ENERGY FOOTPRINT BY FUNCTIONAL CATEGORY',
    thCategory: isFr ? 'CATÉGORIE' : 'CATEGORY',
    thUnits: isFr ? 'UNITÉS' : 'UNITS',
    thDailyCons: isFr ? 'CONSO. J. (KWH)' : 'DAILY KWH',
    thAnnualCost: isFr ? 'COÛT ANNUEL' : 'ANNUAL COST',
    thAllocation: isFr ? 'PART (%)' : 'SHARE (%)',
    criticalConsumersHeader: isFr ? 'CONSOMMATEURS CRITIQUES (ACTION PRIORITAIRE REQUIS)' : 'CRITICAL POWER CONSUMERS (PRIORITY ACTION REQUIRED)',
    hardwareInventoryHeader: isFr ? 'REGISTRE COMPLET DU MATÉRIEL INVENTORIÉ' : 'COMPLETE HARDWARE APPLIANCE INVENTORY',
    thApplianceName: isFr ? 'DÉSIGNATION DE L\'APPAREIL' : 'APPLIANCE REGISTERED NAME',
    thPower: isFr ? 'PUISSANCE (W)' : 'POWER (W)',
    thDailyHrs: isFr ? 'HRS / JOUR' : 'DAILY HRS',
    thQty: isFr ? 'QTÉ' : 'QTY',
    thDailyLoad: isFr ? 'CHARGE J.' : 'DAILY LOAD',
    thAnnualCostInvent: isFr ? 'COÛT ANNUEL' : 'ANNUAL COST',
    generalStrategiesHeader: isFr ? 'STRATÉGIES GÉNÉRALES DE CONSERVATION' : 'GENERAL AUDITOR CONSERVATION STRATEGIES',
    actionPlanHeader: isFr ? 'PLAN D\'ACTION D\'ÉCONOMIE D\'ÉNERGIE ENREGISTRÉ' : 'PERSISTENT ENERGY-SAVING ACTION PLAN',
    thActionStrategy: isFr ? 'STRATÉGIE D\'AUDIT / ACTION RECOMMANDÉE' : 'AUDIT STRATEGY / ENFORCED STEP',
    thProjectedReduction: isFr ? 'RÉDUCTION ANNUELLE ESTIMÉE' : 'PROJECTED ANNUAL REDUCTION',
    totalSavingsLabel: isFr ? 'TOTAL DES ÉCONOMIES D\'EFFICACITÉ DE REVENU DÉCLARÉES :' : 'TOTAL DECLARED REVENUE EFFICIENCY SAVINGS:',
    unitLabel: isFr ? 'UNITÉ(S)' : 'UNIT(S)',
    habitLabel: isFr ? 'HABITUELLE' : 'HABITUAL',
    footerLabel: isFr ? 'OUTIL D\'AUDIT DE PUISSANCE INDUSTRIEL WATTRACK // ESTIMATIONS DE CHARGES' : 'WATTRACK INDUSTRIAL POWER AUDITING UTILITY // ALL VALUES ARE ESTIMATES',
    noneDetected: isFr ? 'AUCUN APPAREIL CONFORME DÉTECTÉ' : 'NO ELIGIBLE DEVICES DETECTED',
  };

  // Helper to draw pages background and borders to match the App Theme exactly (#E4E3E0)
  const applyPageTheme = () => {
    // Fill the page background with #E4E3E0
    doc.setFillColor(228, 227, 224); // #E4E3E0
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const drawHeader = (pageNum: number) => {
    applyPageTheme();

    // Top solid border accent (pure black/deep charcoal #141414)
    doc.setFillColor(20, 20, 20); // #141414
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Header Title (Industrial display)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20); // #141414 brand dark text
    doc.text('WaTTrack', margin, 21);

    // Brand tag
    doc.setFont('Courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 115); // subtle grey
    doc.text(t.designedBy, margin, 26);

    // Right-aligned Document Label (Industrial style)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(t.docLabel, pageWidth - margin, 21, { align: 'right' });

    // Date / ID
    doc.setFont('Courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text(`${t.dateLabel}: ${new Date().toLocaleDateString().toUpperCase()} // ${t.pageLabel}: ${pageNum}`, pageWidth - margin, 26, { align: 'right' });

    // Double divider rules representing engineering layout
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.6);
    doc.line(margin, 29, pageWidth - margin, 29);
    
    doc.setLineWidth(0.2);
    doc.line(margin, 30.5, pageWidth - margin, 30.5);

    currentY = 38;
  };

  const drawFooter = (pageNum: number) => {
    // Bottom rule
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFont('Courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(t.footerLabel, margin, pageHeight - 10);
    doc.text(`SHEET_REF: ${project.id.substring(0, 8).toUpperCase()}_${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  // --- PAGE 1: COVER & DASHBOARD OVERVIEW ---
  drawHeader(1);

  // Project Title Card - Sharp, solid borders, matching the #DEDEDB panel background
  doc.setFillColor(222, 222, 219); // #DEDEDB
  doc.setDrawColor(20, 20, 20); // #141414
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 26, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  
  const projectNameSafe = limitText(project.name, 30).toUpperCase();
  doc.text(`${t.auditPrefix} ${projectNameSafe}`, margin + 6, currentY + 8);

  const clientNameVal = project.clientName ? project.clientName : t.domesticProperty;
  const clientNameSafe = limitText(clientNameVal, 30).toUpperCase();

  const auditorNameVal = project.auditorName || 'IDNAFEN';
  const auditorNameSafe = limitText(auditorNameVal, 30).toUpperCase();

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${t.locationLabel} ${clientNameSafe}`, margin + 6, currentY + 15);
  doc.text(`${t.auditorNameLabel} ${auditorNameSafe}`, margin + 6, currentY + 21);

  // Rate config
  doc.setFont('Courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(
    `${t.tariffRate} ${project.currency}${project.ratePerKWh.toFixed(2)} / KWH`,
    pageWidth - margin - 6,
    currentY + 10,
    { align: 'right' }
  );
  doc.text(
    `${t.registryDevices} ${summary.totalDevicesCount}`,
    pageWidth - margin - 6,
    currentY + 18,
    { align: 'right' }
  );

  currentY += 34;

  // --- KPI Grid Metrics ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(t.consumptionMetricsHeader, margin, currentY);
  currentY += 5;

  const cardWidth = (pageWidth - (margin * 2) - 8) / 3;
  const cards = [
    { label: t.cardDaily, valKWh: `${summary.totalDailyKWh.toFixed(2)} KWH`, valCost: `${project.currency}${summary.totalDailyCost.toFixed(2)}`, labelUnit: t.perDay },
    { label: t.cardMonthly, valKWh: `${summary.totalMonthlyKWh.toFixed(0)} KWH`, valCost: `${project.currency}${summary.totalMonthlyCost.toFixed(2)}`, labelUnit: t.perMonth },
    { label: t.cardAnnual, valKWh: `${summary.totalAnnualKWh.toFixed(0)} KWH`, valCost: `${project.currency}${summary.totalAnnualCost.toFixed(2)}`, labelUnit: t.perYear }
  ];

  cards.forEach((card, idx) => {
    const cardX = margin + (idx * (cardWidth + 4));
    // Flat sharp cards matching #EBEAE7 brand-panel-light
    doc.setFillColor(235, 234, 231); // #EBEAE7
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.4);
    doc.rect(cardX, currentY, cardWidth, 24, 'FD');

    // Stats Labels
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(card.label, cardX + 5, currentY + 6);

    // Stats values - Monospace Courier for authentic raw data output
    doc.setFont('Courier', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(20, 20, 20);
    doc.text(card.valCost, cardX + 5, currentY + 14);

    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text(`${card.valKWh} ${card.labelUnit}`, cardX + 5, currentY + 20);
  });

  currentY += 33;

  // --- Category Breakdown Table ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(t.categoryFootprintHeader, margin, currentY);
  currentY += 5;

  // Calculate actual category stats with translated categories labels
  const catStats = CATEGORIES.map(cat => {
    const devicesInCat = project.devices.filter(d => d.category === cat.id);
    const dailyKWh = devicesInCat.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
    const count = devicesInCat.reduce((sum, d) => sum + d.quantity, 0);
    const percentage = summary.totalDailyKWh > 0 ? (dailyKWh / summary.totalDailyKWh) * 100 : 0;
    
    // Select translated label
    const translatedLabel = isFr ? {
      heating_cooling: 'Chauffage & Climatisation',
      kitchen: 'Appareils de Cuisine',
      lighting: 'Éclairage',
      entertainment: 'Divertissement',
      office_tech: 'Bureau & Informatique',
      laundry_utility: 'Buanderie & Utilitaires',
      other: 'Autres Appareils',
    }[cat.id] || cat.label : cat.label;

    return { ...cat, label: translatedLabel, dailyKWh, count, percentage };
  }).filter(c => c.count > 0);

  // Draw Category Headers in solid black/dark theme style
  doc.setFillColor(20, 20, 20); // #141414
  doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(228, 227, 224); // #E4E3E0 text

  const catCol1 = margin + 4;   // Category
  const catCol2 = margin + 58;  // Units
  const catCol3 = margin + 80;  // Daily KWH
  const catCol4 = margin + 118; // Annual Cost
  const catCol5 = margin + 154; // Share (%)

  doc.text(t.thCategory, catCol1, currentY + 5.5);
  doc.text(t.thUnits, catCol2, currentY + 5.5);
  doc.text(t.thDailyCons, catCol3, currentY + 5.5);
  doc.text(t.thAnnualCost, catCol4, currentY + 5.5);
  doc.text(t.thAllocation, catCol5, currentY + 5.5);

  currentY += 8;

  catStats.forEach(stat => {
    doc.setFillColor(235, 234, 231); // #EBEAE7 instead of white for table rows to match layout
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.15);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 7.5, 'FD');

    // Text cells (Industrial pairings)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text(stat.label.toUpperCase(), catCol1, currentY + 5);

    // Monospace data figures
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8);
    doc.text(`${stat.count} ${t.unitLabel.toUpperCase()}`, catCol2, currentY + 5);
    doc.text(`${stat.dailyKWh.toFixed(2)} KWH`, catCol3, currentY + 5);
    doc.text(`${project.currency}${(stat.dailyKWh * 365 * project.ratePerKWh).toFixed(2)}`, catCol4, currentY + 5);
    
    doc.setFont('Courier', 'bold');
    doc.text(`${stat.percentage.toFixed(1)}%`, catCol5, currentY + 5);

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
    doc.setTextColor(20, 20, 20);
    doc.text(t.criticalConsumersHeader, margin, currentY);
    currentY += 5;

    // Sharp Warning panel (#EBEAE7 with thick black solid border)
    doc.setFillColor(235, 234, 231); // #EBEAE7
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 24, 'FD');

    doc.setFont('Courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);

    let innerY = currentY + 5.5;
    inefficientDevices.forEach((dev, idx) => {
      const devNameSafe = limitText(dev.name, 20).toUpperCase();
      const shortCat = getShortCatLabel(dev.category, language);

      doc.setFont('Courier', 'bold');
      doc.text(`[0${idx + 1}] ${devNameSafe}`, margin + 5, innerY);
      doc.setFont('Courier', 'normal');
      
      const detailStr = `:: ${shortCat} AT ${dev.watts}W x ${dev.quantity} QTY FOR ${dev.hoursPerDay}H/D => ${dev.dailyKWh.toFixed(1)} KWH/D (~${project.currency}${dev.annualCost.toFixed(0)}/YR)`;
      const detailStrSafe = limitText(detailStr, 65).toUpperCase();
      
      doc.text(
        detailStrSafe,
        margin + 52,
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
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(t.hardwareInventoryHeader, margin, currentY);
  currentY += 5;

  // Column positions for detailed device table:
  const col1 = margin + 3;   // Appliance Name (up to 20 chars)
  const col2 = margin + 43;  // Category (up to 24 chars)
  const col3 = margin + 81;  // Power
  const col4 = margin + 100; // Daily Hrs
  const col5 = margin + 117; // Qty
  const col6 = margin + 127; // Daily Load
  const col7 = margin + 147; // Annual Cost

  // Inventory Table Header - Solid Black (#BCBBB7 used for sub-header)
  doc.setFillColor(20, 20, 20); // #141414
  doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(228, 227, 224); // #E4E3E0
  doc.text(t.thApplianceName, col1, currentY + 5.5);
  doc.text(t.thCategory, col2, currentY + 5.5);
  doc.text(t.thPower, col3, currentY + 5.5);
  doc.text(t.thDailyHrs, col4, currentY + 5.5);
  doc.text(t.thQty, col5, currentY + 5.5);
  doc.text(t.thDailyLoad, col6, currentY + 5.5);
  doc.text(t.thAnnualCostInvent, col7, currentY + 5.5);

  currentY += 8;

  project.devices.forEach((dev) => {
    // Page break handling
    if (currentY > pageHeight - 30) {
      drawFooter(doc.internal.pages.length - 1);
      doc.addPage();
      drawHeader(doc.internal.pages.length - 1);
      
      // Reprint Header on new page
      doc.setFillColor(20, 20, 20);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(228, 227, 224);
      doc.text(t.thApplianceName, col1, currentY + 5.5);
      doc.text(t.thCategory, col2, currentY + 5.5);
      doc.text(t.thPower, col3, currentY + 5.5);
      doc.text(t.thDailyHrs, col4, currentY + 5.5);
      doc.text(t.thQty, col5, currentY + 5.5);
      doc.text(t.thDailyLoad, col6, currentY + 5.5);
      doc.text(t.thAnnualCostInvent, col7, currentY + 5.5);
      currentY += 8;
    }

    doc.setFillColor(235, 234, 231); // #EBEAE7 row background matching app theme exactly
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.15);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    
    // Truncate long names to 20 chars to fit beautifully
    let trimmedName = dev.name;
    if (trimmedName.length > 20) {
      trimmedName = trimmedName.substring(0, 18) + '...';
    }
    doc.text(trimmedName.toUpperCase(), col1, currentY + 4.8);

    doc.setFont('Courier', 'normal');
    doc.setFontSize(7.5);
    const catLabel = CATEGORIES.find(c => c.id === dev.category)?.label || dev.category;
    const transCatLabel = isFr ? {
      heating_cooling: 'Chauffage & Climatisation',
      kitchen: 'Appareils de Cuisine',
      lighting: 'Éclairage',
      entertainment: 'Divertissement',
      office_tech: 'Bureau & Informatique',
      laundry_utility: 'Buanderie & Utilitaires',
      other: 'Autres Appareils',
    }[dev.category] || catLabel : catLabel;

    // Truncate category labels to 24 chars to fit beautifully
    let trimmedCat = transCatLabel;
    if (trimmedCat.length > 24) {
      trimmedCat = trimmedCat.substring(0, 22) + '...';
    }
    doc.text(trimmedCat.toUpperCase(), col2, currentY + 4.8);

    doc.text(`${dev.watts} W`, col3, currentY + 4.8);
    doc.text(`${dev.hoursPerDay} H/D`, col4, currentY + 4.8);
    doc.text(`${dev.quantity}`, col5, currentY + 4.8);

    const devDailyKWh = (dev.watts * dev.hoursPerDay * dev.quantity) / 1000;
    const devAnnualCost = devDailyKWh * 365 * project.ratePerKWh;

    doc.text(`${devDailyKWh.toFixed(2)} KWH`, col6, currentY + 4.8);
    doc.setFont('Courier', 'bold');
    doc.text(`${project.currency}${devAnnualCost.toFixed(2)}`, col7, currentY + 4.8);

    currentY += 7;
  });

  currentY += 10;

  // --- Recommendations & Action Plan Section ---
  const hasSavedTips = (project.savedTipIds && project.savedTipIds.length > 0) || (project.customTips && project.customTips.length > 0);

  // General tips box
  const generalTips = isFr ? [
    '• RÉTROFIT D\'ÉCLAIRAGE : SWAP HALOGÈNES À FORTE PUISSANCE POUR DES LED 9W (-85% D\'EMPREINTE ÉNERGÉTIQUE).',
    '• OPTIMISATION DU CHRONO : CONFIGUREZ DES PRISES INTELLIGENTES ET PROGRAMMATEURS SUR CHAUFFE-EAU ET RADIATEURS.',
    '• SUPPRESSION DES VEILLES : UTILISEZ DES MULTIPRISES COUPE-VEILLE POUR COUPER LES APPAREILS EN VEILLE FANTÔME.',
    '• SECHAGE INTELLIGENT : PRÉFÉREZ L\'ESSORAGE MAXIMUM ET BOULES DE SÉCHAGE EN LAINE POUR COURT-CIRCUITER LES WATTS.',
    '• NETTOYAGE DU FILTRE : LES FILTRES ENCOMBRÉS FORCE LE CVC À TOURNER 15% PLUS LONGTEMPS. NETTOYEZ-LES TOUS LES 90J.'
  ] : [
    '• LIGHTING RETROFIT : SWAP HIGH-WATTAGE HALOGENS/INCANDESCENTS FOR 9W LED EQUIVALENTS (-85% FOOTPRINT).',
    '• SCHEDULING DEVIATION : CONFIGURE SMART OUTLETS & MECHANICAL TIMERS TO CUT HEAVY HEATER/COOLING RUNTIMES.',
    '• VAMPIRE SUPPRESSION : CENTRALISE TECH/OFFICE TERMINALS TO STANDBY-LIMITING POWER STRIPS TO CUT PHANTOM DRAW.',
    '• DRYING OPTIMIZATION : USE HIGH-SPEED ACCELERATED SPIN WASH CYCLES & DRYER WOOL BALLS TO DROP UTILITY DRAWS.',
    '• AIR FILTER REPLACEMENT : CLOGGED INTAKE DUCTS CHOKE HVAC EQUIPMENT, EXPENDING 15% MORE OPERATIONAL WATTS.'
  ];

  doc.setFont('Courier', 'bold');
  doc.setFontSize(7.5);
  const maxTextWidth = pageWidth - (margin * 2) - 10; // 210 - 40 - 10 = 160mm
  const processedTips: string[][] = generalTips.map(tip => doc.splitTextToSize(tip, maxTextWidth));
  const totalLinesCount = processedTips.reduce((sum, lines) => sum + lines.length, 0);

  const lineSpacing = 4.0;
  const paragraphSpacing = 1.8;
  const boxHeight = 6 + (totalLinesCount * lineSpacing) + (processedTips.length - 1) * paragraphSpacing;

  if (currentY + boxHeight + 15 > pageHeight - 15) {
    drawFooter(doc.internal.pages.length - 1);
    doc.addPage();
    drawHeader(doc.internal.pages.length - 1);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(t.generalStrategiesHeader, margin, currentY);
  currentY += 5;

  // Sharp beige/panel card background (#DEDEDB) with solid dark border
  doc.setFillColor(222, 222, 219); // #DEDEDB
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.4);
  doc.rect(margin, currentY, pageWidth - (margin * 2), boxHeight, 'FD');

  doc.setFont('Courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);

  let recommendationY = currentY + 5;
  processedTips.forEach((lines) => {
    lines.forEach((line) => {
      doc.text(line, margin + 5, recommendationY);
      recommendationY += lineSpacing;
    });
    recommendationY += paragraphSpacing;
  });

  currentY += boxHeight + 10;

  // --- MY SAVED ACTION PLAN (PERSISTENT TIPS) ---
  if (hasSavedTips) {
    if (currentY > pageHeight - 60) {
      drawFooter(doc.internal.pages.length - 1);
      doc.addPage();
      drawHeader(doc.internal.pages.length - 1);
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(t.actionPlanHeader, margin, currentY);
    currentY += 5;

    // Load actual generated tips in the correct language to find matching saved ones
    const allGenerated = generatePersonalizedTips(project, language);
    const savedGenerated = allGenerated.filter(t => project.savedTipIds?.includes(t.id));
    const customList = project.customTips || [];

    // Calculate sum of savings
    const totalSavedAnnual = savedGenerated.reduce((sum, t) => sum + t.annualSavings, 0);

    // Warm light grey paper sheet background (#EBEAE7) with thick black border
    doc.setFillColor(235, 234, 231); // #EBEAE7
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.5);
    
    // We estimate height based on items
    const totalItemsCount = savedGenerated.length + customList.length;
    const boxHeight = 12 + (totalItemsCount * 7.5) + (totalSavedAnnual > 0 ? 10 : 0);
    
    if (currentY + boxHeight > pageHeight - 20) {
      drawFooter(doc.internal.pages.length - 1);
      doc.addPage();
      drawHeader(doc.internal.pages.length - 1);
    }

    doc.rect(margin, currentY, pageWidth - (margin * 2), boxHeight, 'FD');

    let itemY = currentY + 6;
    doc.setFont('Courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text(t.thActionStrategy.toUpperCase(), margin + 5, itemY);
    doc.text(t.thProjectedReduction.toUpperCase(), pageWidth - margin - 5, itemY, { align: 'right' });
    
    // Divider line
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, itemY + 2.5, pageWidth - margin - 4, itemY + 2.5);
    itemY += 8.5;

    // List Saved AI Tips
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8);
    savedGenerated.forEach(tip => {
      doc.setFont('Courier', 'bold');
      doc.setTextColor(20, 20, 20);

      // Combine title and action step to guarantee no overlap with price on the right
      const fullText = `• ${tip.title.toUpperCase()} // ACTION: ${tip.actionableStep.toUpperCase()}`;
      const displayText = limitText(fullText, 80);
      
      doc.text(displayText, margin + 5, itemY);

      doc.setFont('Courier', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text(`-${project.currency}${tip.annualSavings.toFixed(2)}`, pageWidth - margin - 5, itemY, { align: 'right' });
      itemY += 7.5;
    });

    // List Custom authored Tips
    customList.forEach(customText => {
      doc.setFont('Courier', 'bold');
      doc.setTextColor(20, 20, 20);

      // Combine label and custom text to guarantee no overlap with status label on the right
      const fullText = `• ${isFr ? 'ACTION PERSONNELLE' : 'CUSTOM REGISTER'} // ${customText.toUpperCase()}`;
      const displayText = limitText(fullText, 80);

      doc.text(displayText, margin + 5, itemY);

      doc.setFont('Courier', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(t.habitLabel, pageWidth - margin - 5, itemY, { align: 'right' });
      itemY += 7.5;
    });

    if (totalSavedAnnual > 0) {
      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, itemY, pageWidth - margin - 4, itemY);
      itemY += 5.5;
      doc.setFont('Courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(20, 20, 20);
      doc.text(t.totalSavingsLabel, margin + 5, itemY);
      doc.text(`-${project.currency}${totalSavedAnnual.toFixed(2)} / ${isFr ? 'AN' : 'YR'}`, pageWidth - margin - 5, itemY, { align: 'right' });
    }

    currentY += boxHeight + 10;
  }

  drawFooter(doc.internal.pages.length - 1);

  // Save the PDF
  const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`wattrack_audit_${safeName}.pdf`);
}
