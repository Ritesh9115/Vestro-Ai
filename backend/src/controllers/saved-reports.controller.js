const SavedReport = require('../models/SavedReport');
const Notification = require('../models/Notification');
const { asyncHandler, createError } = require('../utils/errors');
const PDFDocument = require('pdfkit');

/**
 * GET /api/reports
 */
const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, verdict, favorite, tag } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { userId: req.user._id };
  if (verdict && ['INVEST', 'WATCH', 'SKIP'].includes(verdict.toUpperCase())) {
    filter.verdict = verdict.toUpperCase();
  }
  if (favorite === 'true') filter.isFavorite = true;
  if (tag) filter.tags = tag;

  const [reports, total] = await Promise.all([
    SavedReport.find(filter)
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reportSnapshot'), // Exclude heavy snapshot from list view
    SavedReport.countDocuments(filter),
  ]);

  res.json({
    reports,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

/**
 * POST /api/reports
 */
const saveReport = asyncHandler(async (req, res) => {
  const { symbol, companyName, sector, verdict, confidence, healthScore, notes, tags, reportSnapshot } = req.body;

  const report = await SavedReport.create({
    userId: req.user._id,
    symbol: symbol?.toUpperCase(),
    companyName,
    sector,
    verdict,
    confidence,
    healthScore,
    notes: notes || '',
    tags: tags || [],
    reportSnapshot,
  });

  // DSA: Queue — create notification (FIFO)
  await Notification.create({
    userId: req.user._id,
    type: 'report_saved',
    title: `Report saved: ${companyName || symbol}`,
    body: `Your ${verdict} report for ${companyName || symbol} has been saved.`,
    relatedSymbol: symbol?.toUpperCase(),
    relatedEntityId: report._id,
  });

  res.status(201).json({ message: 'Report saved.', reportId: report._id });
});

/**
 * PATCH /api/reports/:id
 */
const updateReport = asyncHandler(async (req, res) => {
  const report = await SavedReport.findOne({ _id: req.params.id, userId: req.user._id });
  if (!report) throw createError('Report not found.', 404);

  const { notes, tags, isFavorite } = req.body;
  if (notes !== undefined) report.notes = notes;
  if (tags !== undefined) report.tags = tags;
  if (isFavorite !== undefined) report.isFavorite = isFavorite;
  await report.save();

  res.json({ message: 'Report updated.', report });
});

/**
 * DELETE /api/reports/:id
 */
const deleteReport = asyncHandler(async (req, res) => {
  const result = await SavedReport.deleteOne({ _id: req.params.id, userId: req.user._id });
  if (result.deletedCount === 0) throw createError('Report not found.', 404);
  res.json({ message: 'Report deleted.' });
});

/**
 * GET /api/reports/:id/export
 * Generates and streams a PDF of the saved report.
 */
const exportReportPDF = asyncHandler(async (req, res) => {
  const report = await SavedReport.findOne({ _id: req.params.id, userId: req.user._id });
  if (!report) throw createError('Report not found.', 404);

  const snap = report.reportSnapshot || {};
  const company = snap.company || {};
  const ai = snap.aiAnalysis || {};
  const fin = snap.financials || {};

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="vestro-${report.symbol}-report.pdf"`);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(res);

  // Header
  doc.fontSize(22).fillColor('#0E8F5B').text('Vestro AI Investment Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#5B6B63').text(`Generated: ${new Date(report.savedAt).toLocaleDateString('en-IN')}`, { align: 'center' });
  doc.moveDown();

  // Company
  doc.fontSize(18).fillColor('#0F211A').text(company.name || report.companyName || report.symbol);
  doc.fontSize(11).fillColor('#5B6B63').text(`${company.sector || ''} · ${company.exchange || ''} · ${report.symbol}`);
  doc.moveDown();

  // Verdict badge
  const verdictColor = report.verdict === 'INVEST' ? '#0E8F5B' : report.verdict === 'WATCH' ? '#B8862E' : '#C8443A';
  doc.fontSize(16).fillColor(verdictColor).text(`Verdict: ${report.verdict || 'N/A'}`, { continued: true });
  doc.fontSize(13).fillColor('#5B6B63').text(`  Confidence: ${ai.confidence || report.confidence || 'N/A'}%`);
  doc.moveDown();

  // Health Score
  doc.fontSize(13).fillColor('#0F211A').text(`Health Score: ${ai.healthScore || report.healthScore || 'N/A'}/100`);
  doc.moveDown(0.5);

  // Investment Thesis
  if (ai.investmentThesis) {
    doc.fontSize(13).fillColor('#0F211A').text('Investment Thesis', { underline: true });
    doc.fontSize(11).fillColor('#5B6B63').text(ai.investmentThesis);
    doc.moveDown(0.5);
  }

  // Key Reasons
  if (ai.topReasons?.length) {
    doc.fontSize(13).fillColor('#0F211A').text('Key Reasons', { underline: true });
    ai.topReasons.forEach((r) => doc.fontSize(11).fillColor('#5B6B63').text(`• ${r}`));
    doc.moveDown(0.5);
  }

  // Key Risks
  if (ai.keyRisks?.length) {
    doc.fontSize(13).fillColor('#C8443A').text('Key Risks', { underline: true });
    ai.keyRisks.forEach((r) => doc.fontSize(11).fillColor('#5B6B63').text(`• ${r}`));
    doc.moveDown(0.5);
  }

  // Financial snapshot
  if (fin.revenue) {
    doc.fontSize(13).fillColor('#0F211A').text('Financial Snapshot', { underline: true });
    const rows = [
      ['Revenue', fin.revenue ? `₹${(fin.revenue / 1e7).toFixed(2)}Cr` : 'N/A'],
      ['Net Margin', fin.netMargin ? `${fin.netMargin.toFixed(1)}%` : 'N/A'],
      ['ROE', fin.roe ? `${fin.roe.toFixed(1)}%` : 'N/A'],
      ['Debt/Equity', fin.debtToEquity ?? 'N/A'],
      ['P/E Ratio', fin.pe ?? 'N/A'],
    ];
    rows.forEach(([k, v]) => {
      doc.fontSize(11).fillColor('#0F211A').text(`${k}: `, { continued: true }).fillColor('#5B6B63').text(String(v));
    });
    doc.moveDown(0.5);
  }

  // User notes
  if (report.notes) {
    doc.fontSize(13).fillColor('#0F211A').text('Your Notes', { underline: true });
    doc.fontSize(11).fillColor('#5B6B63').text(report.notes);
    doc.moveDown(0.5);
  }

  // Disclaimer
  doc.moveDown();
  doc.fontSize(9).fillColor('#9AA69F').text(
    'Disclaimer: This report is generated by Vestro AI for educational purposes only. It does not constitute financial advice. All investment decisions should be made after consulting a qualified financial advisor.',
    { align: 'center' }
  );

  doc.end();
});

module.exports = { getReports, saveReport, updateReport, deleteReport, exportReportPDF };
