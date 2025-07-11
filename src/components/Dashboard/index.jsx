import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  Percent,
  Calendar,
  Brain,
  Activity,
  Shield,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Settings,
  Filter
} from 'lucide-react';
import { useToast } from '../../utils/ToastContext';
import Modal from '../../utils/Modal';
import AnalyticsPlaceholder from '../Analytics';
import * as mockData from '../../data/mockData';
import { arrayToCSV } from '../../utils/csvUtils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const { showToast } = useToast();
  // State for quick actions
  const [activeAction, setActiveAction] = useState(null);
  // State for Generate Report
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportReady, setReportReady] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  // Report generation state (local to Dashboard)
  const [selectedReport, setSelectedReport] = useState('portfolio-summary');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportFormat, setReportFormat] = useState('csv');
  const [includeVisualizations, setIncludeVisualizations] = useState(true);
  const [reportData, setReportData] = useState([]);

  // Dummy data for validation
  const validationSummary = {
    success: 12,
    warning: 2,
    error: 1,
  };
  const validationChecks = [
    { label: 'Loan Balances Reconciled', status: 'success' },
    { label: 'Member Data Consistency', status: 'success' },
    { label: 'Portfolio at Risk < 5%', status: 'warning' },
    { label: 'Regulatory Ratios', status: 'success' },
    { label: 'Data Completeness', status: 'error' },
    { label: 'Duplicate Accounts', status: 'success' },
    { label: 'Board Approvals', status: 'success' },
    { label: 'Interest Rate Policy', status: 'success' },
    { label: 'Delinquency Checks', status: 'success' },
    { label: 'Audit Trail Integrity', status: 'success' },
    { label: 'Schedule Consistency', status: 'warning' },
    { label: 'Backup Verification', status: 'success' },
    { label: 'User Access Review', status: 'success' },
    { label: 'Transaction Limits', status: 'success' },
    { label: 'AML Screening', status: 'success' },
  ];

  // Dummy data for schedules
  const schedules = [
    { name: 'Monthly Portfolio', frequency: 'Monthly', next: '2024-07-01', recipients: 'Board, SASRA', status: 'Active' },
    { name: 'Compliance Report', frequency: 'Quarterly', next: '2024-09-30', recipients: 'Compliance', status: 'Active' },
    { name: 'Member Analysis', frequency: 'Yearly', next: '2025-01-10', recipients: 'Management', status: 'Paused' },
  ];

  // Dummy data for analytics
  const analyticsPlaceholder = (
    <div className="flex flex-col items-center justify-center h-64">
      <BarChart3 className="w-12 h-12 text-primary-500 mb-4" />
      <div className="text-lg font-semibold text-text-primary mb-2">Interactive Analytics</div>
      <div className="text-text-secondary">Imagine charts and graphs here (mock-up only)</div>
    </div>
  );

  // Report types, periods, formats (copied from Reports)
  const reportTypes = [
    { id: 'portfolio-summary', name: 'Portfolio Summary', description: 'Comprehensive overview of loan portfolio performance', icon: BarChart3, category: 'Portfolio' },
    { id: 'member-analysis', name: 'Member Analysis', description: 'Detailed member demographics and behavior analysis', icon: Users, category: 'Members' },
    { id: 'financial-performance', name: 'Financial Performance', description: 'Revenue, expenses, and profitability analysis', icon: DollarSign, category: 'Financial' },
    { id: 'compliance-report', name: 'Compliance Report', description: 'Regulatory compliance and risk assessment', icon: Shield, category: 'Compliance' },
    { id: 'trend-analysis', name: 'Trend Analysis', description: 'Historical trends and forecasting', icon: TrendingUp, category: 'Analytics' },
    { id: 'custom-report', name: 'Custom Report', description: 'Build your own report with custom parameters', icon: Settings, category: 'Custom' },
  ];
  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' },
  ];
  const formats = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileText },
  ];

  // Utility to get mock data for the selected report and period
  const getMockReportData = (reportType, reportPeriod) => {
    switch (reportType) {
      case 'portfolio-summary':
        return mockData.portfolioSummary.filter(r => r.period === reportPeriod);
      case 'member-analysis':
        return mockData.members;
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

  // Generate report (mock data, async simulation)
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
      setReportData(data);
      setIsGenerating(false);
      setReportReady(true);
      showToast('Report generated successfully!', { type: 'success' });
    }, 1000);
  };

  // Download report (CSV, PDF, Excel)
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
      if (!reportData.length) {
        showToast('No data to export', { type: 'error' });
        return;
      }
      const doc = new jsPDF();
      const title = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
      doc.setFontSize(16);
      doc.text(title, 10, 15);
      doc.setFontSize(10);
      const headers = Object.keys(reportData[0]);
      let y = 25;
      doc.text(headers.join(' | '), 10, y);
      reportData.forEach(row => {
        y += 7;
        doc.text(headers.map(h => String(row[h])).join(' | '), 10, y);
      });
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 10, y + 15);
      doc.save(`${reportTypes.find(r => r.id === selectedReport)?.name || 'report'}.pdf`);
      setReportReady(false);
      showToast('Report downloaded', { type: 'success' });
      return;
    } else if (reportFormat === 'excel') {
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

  const keyMetrics = [
    {
      label: "Total Portfolio",
      value: "KES 2.47B",
      change: "+3.2% from last month",
      type: "positive",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600"
    },
    {
      label: "Active Members",
      value: "14,256",
      change: "+127 new members",
      type: "positive",
      icon: Users,
      color: "from-blue-500 to-indigo-600"
    },
    {
      label: "Loan Portfolio",
      value: "KES 1.89B",
      change: "+2.8% growth",
      type: "positive",
      icon: TrendingUp,
      color: "from-purple-500 to-violet-600"
    },
    {
      label: "Compliance Score",
      value: "98.7%",
      change: "+1.2% improvement",
      type: "positive",
      icon: Shield,
      color: "from-emerald-500 to-green-600"
    },
  ];

  const aiInsights = [
    {
      title: "Loan Default Risk",
      value: "Low Risk",
      description: "Portfolio shows healthy risk distribution with 2.1% default probability",
      trend: "decreasing",
      percentage: "-0.3%",
      color: "emerald"
    },
    {
      title: "Member Churn Prediction",
      value: "Stable",
      description: "Member retention rate expected to remain strong at 94.2%",
      trend: "stable",
      percentage: "0.0%",
      color: "blue"
    },
    {
      title: "Growth Trends",
      value: "Positive",
      description: "Portfolio growth trajectory shows 8.7% annual increase",
      trend: "increasing",
      percentage: "+2.1%",
      color: "purple"
    }
  ];

  const systemHealth = [
    {
      metric: "System Uptime",
      value: "99.9%",
      status: "excellent",
      icon: Activity
    },
    {
      metric: "Data Sync Status",
      value: "Real-time",
      status: "excellent",
      icon: Clock
    },
    {
      metric: "Last Backup",
      value: "2 hours ago",
      status: "good",
      icon: Shield
    }
  ];

  const quickActions = [
    { label: "Generate Report", icon: FileText, color: "blue", id: "generate" },
    { label: "View Analytics", icon: BarChart3, color: "purple", id: "analytics" },
    { label: "Validate Data", icon: Shield, color: "emerald", id: "validate" },
    { label: "Schedule Report", icon: Calendar, color: "indigo", id: "schedule" },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
      case "decreasing":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400";
      case "warning":
        return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-400";
    }
  };

  // Quick Action Content
  const renderQuickAction = () => {
    switch (activeAction) {
      case "generate":
        return (
          <div className="card card-hover animate-fade-in mt-6">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-text-primary">Generate Report</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setActiveAction(null)} aria-label="Close">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="card-body space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Report Type</label>
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
                  id="viz-dashboard"
                  checked={includeVisualizations}
                  onChange={e => setIncludeVisualizations(e.target.checked)}
                  className="form-checkbox"
                />
                <label htmlFor="viz-dashboard" className="text-sm text-text-primary">Include Visualizations</label>
              </div>
              {/* Generate Button & Progress */}
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
                    <div className="text-xs text-text-secondary mt-2">Generating...</div>
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
        );
      case "analytics":
        return (
          <>
            <Modal
              open={analyticsModalOpen}
              onClose={() => { setAnalyticsModalOpen(false); setActiveAction(null); }}
              title="Quick Analytics Overview"
              actions={[
                <button key="close" className="btn btn-secondary" onClick={() => { setAnalyticsModalOpen(false); setActiveAction(null); }}>Close</button>
              ]}
            >
              <AnalyticsPlaceholder compact />
            </Modal>
            {!analyticsModalOpen && setTimeout(() => setAnalyticsModalOpen(true), 0)}
          </>
        );
      case "validate":
        return (
          <div className="card card-hover animate-fade-in mt-6">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-text-primary">Validate Data</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setActiveAction(null)} aria-label="Close">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="card-body">
              <div className="mb-4 flex gap-4">
                <div className="flex items-center gap-1 text-success-600"><CheckCircle className="w-4 h-4" /> {validationSummary.success} Success</div>
                <div className="flex items-center gap-1 text-amber-600"><AlertCircle className="w-4 h-4" /> {validationSummary.warning} Warnings</div>
                <div className="flex items-center gap-1 text-destructive-600"><XCircle className="w-4 h-4" /> {validationSummary.error} Errors</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-secondary">
                      <th className="py-2 pr-4">Check</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationChecks.map((check, idx) => (
                      <tr key={idx} className="border-b border-secondary-200 dark:border-secondary-700">
                        <td className="py-2 pr-4">{check.label}</td>
                        <td className="py-2">
                          {check.status === 'success' && <span className="inline-flex items-center gap-1 text-success-600"><CheckCircle className="w-4 h-4" /> Success</span>}
                          {check.status === 'warning' && <span className="inline-flex items-center gap-1 text-amber-600"><AlertCircle className="w-4 h-4" /> Warning</span>}
                          {check.status === 'error' && <span className="inline-flex items-center gap-1 text-destructive-600"><XCircle className="w-4 h-4" /> Error</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "schedule":
        return (
          <div className="card card-hover animate-fade-in mt-6">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-text-primary">Schedule Report</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setActiveAction(null)} aria-label="Close">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-secondary">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Frequency</th>
                      <th className="py-2 pr-4">Next Run</th>
                      <th className="py-2 pr-4">Recipients</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s, idx) => (
                      <tr key={idx} className="border-b border-secondary-200 dark:border-secondary-700">
                        <td className="py-2 pr-4">{s.name}</td>
                        <td className="py-2 pr-4">{s.frequency}</td>
                        <td className="py-2 pr-4">{s.next}</td>
                        <td className="py-2 pr-4">{s.recipients}</td>
                        <td className="py-2">
                          {s.status === 'Active' && <span className="inline-flex items-center gap-1 text-success-600"><CheckCircle className="w-4 h-4" /> Active</span>}
                          {s.status === 'Paused' && <span className="inline-flex items-center gap-1 text-amber-600"><AlertCircle className="w-4 h-4" /> Paused</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="card card-hover">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Dashboard Overview</h2>
              <p className="text-text-secondary">Monitor your SACCO's performance and compliance metrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const getChangeIcon = () => {
            switch (metric.type) {
              case "positive":
                return <TrendingUp className="w-4 h-4 text-emerald-600" />;
              case "negative":
                return <TrendingDown className="w-4 h-4 text-red-600" />;
              default:
                return <Minus className="w-4 h-4 text-slate-400" />;
            }
          };

          return (
            <div
              key={index}
              className="card card-hover animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {getChangeIcon()}
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-text-primary">{metric.value}</div>
                  <div className="text-sm text-text-secondary font-medium">{metric.label}</div>
                  <div className={`text-xs font-medium flex items-center gap-1 ${metric.type === "positive" ? "text-emerald-600" :
                    metric.type === "negative" ? "text-red-600" : "text-text-tertiary"
                    }`}>
                    {getChangeIcon()}
                    {metric.change}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-2 card card-hover">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">AI-Powered Insights</h3>
            </div>
          </div>

          <div className="card-body">
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-text-primary">{insight.title}</h4>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium text-${insight.color}-600`}>
                        {insight.value}
                      </span>
                      <span className="text-xs text-text-tertiary">({insight.percentage})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card card-hover">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">System Health</h3>
            </div>
          </div>

          <div className="card-body">
            <div className="space-y-4">
              {systemHealth.map((health, index) => {
                const Icon = health.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-primary">{health.metric}</span>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor(health.status)}`}>
                      {health.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card card-hover">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className={`flex flex-col items-center gap-3 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:border-${action.color}-300 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all duration-300 group focus-visible`}
                  onClick={() => setActiveAction(action.id)}
                  aria-label={action.label}
                >
                  <div className={`w-10 h-10 bg-gradient-to-br from-${action.color}-500 to-${action.color === 'blue' ? 'indigo' : action.color === 'purple' ? 'violet' : action.color}-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-text-primary text-center">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Render Quick Action Section */}
      {renderQuickAction()}
    </div>
  );
};

export default Dashboard;
