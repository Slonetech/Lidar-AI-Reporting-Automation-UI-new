import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Settings,
  Filter,
  XCircle
} from 'lucide-react';
import { useToast } from '../../utils/ToastContext';
import * as mockData from '../../data/mockData';
import { arrayToCSV } from '../../utils/csvUtils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState('portfolio-summary');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportFormat, setReportFormat] = useState('csv');
  const [includeVisualizations, setIncludeVisualizations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportReady, setReportReady] = useState(false);
  const [reportData, setReportData] = useState([]);

  const reportTypes = [
    {
      id: 'portfolio-summary',
      name: 'Portfolio Summary',
      description: 'Comprehensive overview of loan portfolio performance',
      icon: BarChart3,
      category: 'Portfolio'
    },
    {
      id: 'member-analysis',
      name: 'Member Analysis',
      description: 'Detailed member demographics and behavior analysis',
      icon: Users,
      category: 'Members'
    },
    {
      id: 'financial-performance',
      name: 'Financial Performance',
      description: 'Revenue, expenses, and profitability analysis',
      icon: DollarSign,
      category: 'Financial'
    },
    {
      id: 'compliance-report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and risk assessment',
      icon: Shield,
      category: 'Compliance'
    },
    {
      id: 'trend-analysis',
      name: 'Trend Analysis',
      description: 'Historical trends and forecasting',
      icon: TrendingUp,
      category: 'Analytics'
    },
    {
      id: 'custom-report',
      name: 'Custom Report',
      description: 'Build your own report with custom parameters',
      icon: Settings,
      category: 'Custom'
    }
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileText },
  ];

  const recentReports = [
    { name: 'Portfolio Summary', date: '2024-01-15', status: 'completed' },
    { name: 'Member Analysis', date: '2024-01-14', status: 'completed' },
    { name: 'Compliance Report', date: '2024-01-13', status: 'completed' }
  ];

  // Utility to get mock data for the selected report and period
  const getMockReportData = (reportType, reportPeriod) => {
    switch (reportType) {
      case 'portfolio-summary':
        return mockData.portfolioSummary.filter(r => r.period === reportPeriod);
      case 'member-analysis':
        return mockData.members; // Optionally filter by activity/period
      case 'financial-performance':
        return mockData.financialPerformance.filter(r => r.type === reportPeriod);
      case 'compliance-report':
        return mockData.complianceReport.filter(r => r.period === reportPeriod);
      case 'trend-analysis':
        return mockData.trendAnalysis.filter(r => r.period === reportPeriod);
      default:
        return [];
    }
  };

  // Updated handleGenerateReport to use mock data in development
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setProgress(0);
    setReportReady(false);
    const isDev = process.env.NODE_ENV === 'development';
    setTimeout(() => {
      let data;
      if (isDev) {
        data = getMockReportData(selectedReport, reportPeriod);
      } else {
        // TODO: Fetch from backend API in production
        data = [];
      }
      setReportData(data); // Store in state for download
      setIsGenerating(false);
      setReportReady(true);
      showToast('Report generated successfully!', { type: 'success' });
    }, 1000); // Simulate async
  };

  const handleDownloadReport = () => {
    let content = '';
    let mimeType = '';
    let fileExt = '';

    if (reportFormat === 'csv') {
      content = arrayToCSV(reportData);
      mimeType = 'text/csv';
      fileExt = 'csv';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTypes.find(r => r.id === selectedReport)?.name || 'report'}.${fileExt}`;
      a.click();
      URL.revokeObjectURL(url);
      setReportReady(false);
      showToast('Report downloaded', { type: 'success' });
      return;
    } else if (reportFormat === 'pdf') {
      // PDF generation using jsPDF
      if (!reportData.length) {
        showToast('No data to export', { type: 'error' });
        return;
      }
      const doc = new jsPDF();
      const title = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
      doc.setFontSize(16);
      doc.text(title, 10, 15);
      doc.setFontSize(10);
      // Table headers
      const headers = Object.keys(reportData[0]);
      let y = 25;
      doc.text(headers.join(' | '), 10, y);
      // Table rows
      reportData.forEach(row => {
        y += 7;
        doc.text(headers.map(h => String(row[h])).join(' | '), 10, y);
      });
      // Footer
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 10, y + 15);
      doc.save(`${reportTypes.find(r => r.id === selectedReport)?.name || 'report'}.pdf`);
      setReportReady(false);
      showToast('Report downloaded', { type: 'success' });
      return;
    } else if (reportFormat === 'excel') {
      // Excel generation using xlsx
      if (!reportData.length) {
        showToast('No data to export', { type: 'error' });
        return;
      }
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      const sheetName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sheetName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setReportReady(false);
      showToast('Report downloaded', { type: 'success' });
      return;
    } else {
      // Existing logic for other formats (to be updated in next steps)
      content = `Report: ${reportTypes.find(r => r.id === selectedReport)?.name}\nPeriod: ${periods.find(p => p.value === reportPeriod)?.label}\nFormat: ${reportFormat}\nVisualizations: ${includeVisualizations ? 'Yes' : 'No'}\nGenerated: ${new Date().toLocaleString()}`;
      mimeType = 'text/plain';
      fileExt = 'txt';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTypes.find(r => r.id === selectedReport)?.name || 'report'}.${fileExt}`;
      a.click();
      URL.revokeObjectURL(url);
      setReportReady(false);
      showToast('Report downloaded', { type: 'success' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card card-hover">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Report Generation</h2>
              <p className="text-text-secondary">Create and manage comprehensive SASRA compliance reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="card card-hover">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-text-primary">Select Report Type</h3>
            </div>
            <div className="card-body">
              <div className="flex flex-wrap gap-2">
                {reportTypes.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReport(r.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedReport === r.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'border-secondary-200 dark:border-secondary-700 text-text-secondary hover:border-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'}`}
                    >
                      <Icon className="w-4 h-4" /> {r.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="card card-hover">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-text-primary">Report Configuration</h3>
            </div>
            <div className="card-body space-y-6">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Reporting Period</label>
                <div className="flex flex-wrap gap-2">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setReportPeriod(p.value)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${reportPeriod === p.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'border-secondary-200 dark:border-secondary-700 text-text-secondary hover:border-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Output Format</label>
                <div className="flex flex-wrap gap-2">
                  {formats.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setReportFormat(f.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${reportFormat === f.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'border-secondary-200 dark:border-secondary-700 text-text-secondary hover:border-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'}`}
                    >
                      <f.icon className="w-4 h-4" /> {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="viz"
                  checked={includeVisualizations}
                  onChange={e => setIncludeVisualizations(e.target.checked)}
                  className="form-checkbox"
                />
                <label htmlFor="viz" className="text-sm text-text-primary">Include Visualizations</label>
              </div>

              <div>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner w-4 h-4"></div> Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" /> Generate Report
                    </>
                  )}
                </button>
                {isGenerating && (
                  <div className="mt-4">
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-xs text-text-secondary mt-2">{progress}% complete</div>
                  </div>
                )}
                {reportReady && !isGenerating && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                    <div className="text-sm text-success-700">Report ready!</div>
                    <button className="btn btn-success" onClick={handleDownloadReport}><Download className="w-4 h-4" /> Download Report</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview and Actions */}
        <div className="space-y-6">
          {/* Report Preview */}
          <div className="card card-hover">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-text-primary">Report Preview</h3>
            </div>
            <div className="card-body">
              {selectedReport ? (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-secondary-500" />
                      <span className="text-sm font-medium text-text-primary">
                        {reportTypes.find(r => r.id === selectedReport)?.name}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary space-y-1">
                      <div>Period: {periods.find(p => p.value === reportPeriod)?.label}</div>
                      <div>Format: {formats.find(f => f.value === reportFormat)?.label}</div>
                      <div>Visualizations: {includeVisualizations ? 'Included' : 'Excluded'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                  <p className="text-text-secondary">Select a report type to preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="card card-hover">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-text-primary">Recent Reports</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{report.name}</div>
                      <div className="text-xs text-text-secondary">{report.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <button className="p-1 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded">
                        <Download className="w-4 h-4 text-secondary-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
