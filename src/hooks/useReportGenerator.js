import { useState } from 'react';
import * as mockData from '../data/mockData';
import { arrayToCSV } from '../utils/csvUtils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Optionally, these could be moved to a constants file
export const reportTypes = [
    { id: 'portfolio-summary', name: 'Portfolio Summary', description: 'Comprehensive overview of loan portfolio performance' },
    { id: 'member-analysis', name: 'Member Analysis', description: 'Detailed member demographics and behavior analysis' },
    { id: 'financial-performance', name: 'Financial Performance', description: 'Revenue, expenses, and profitability analysis' },
    { id: 'compliance-report', name: 'Compliance Report', description: 'Regulatory compliance and risk assessment' },
    { id: 'trend-analysis', name: 'Trend Analysis', description: 'Historical trends and forecasting' },
    { id: 'custom-report', name: 'Custom Report', description: 'Build your own report with custom parameters' },
];

export const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' },
];

export const formats = [
    { value: 'csv', label: 'CSV' },
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
];

export function useReportGenerator({ onToast } = {}) {
    const [selectedReport, setSelectedReport] = useState('portfolio-summary');
    const [reportPeriod, setReportPeriod] = useState('monthly');
    const [reportFormat, setReportFormat] = useState('csv');
    const [includeVisualizations, setIncludeVisualizations] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [reportReady, setReportReady] = useState(false);
    const [reportData, setReportData] = useState([]);

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

    const handleGenerateReport = () => {
        setIsGenerating(true);
        setProgress(0);
        setReportReady(false);
        setTimeout(() => {
            let data = getMockReportData(selectedReport, reportPeriod);
            setReportData(data);
            setIsGenerating(false);
            setReportReady(true);
            if (onToast) onToast('Report generated successfully!', { type: 'success' });
        }, 1000);
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
            if (onToast) onToast('Report downloaded', { type: 'success' });
            return;
        } else if (reportFormat === 'pdf') {
            if (!reportData.length) {
                if (onToast) onToast('No data to export', { type: 'error' });
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
            if (onToast) onToast('Report downloaded', { type: 'success' });
            return;
        } else if (reportFormat === 'excel') {
            if (!reportData.length) {
                if (onToast) onToast('No data to export', { type: 'error' });
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
            if (onToast) onToast('Report downloaded', { type: 'success' });
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
            if (onToast) onToast('Report downloaded', { type: 'success' });
        }
    };

    return {
        selectedReport, setSelectedReport,
        reportPeriod, setReportPeriod,
        reportFormat, setReportFormat,
        includeVisualizations, setIncludeVisualizations,
        isGenerating, progress, reportReady, reportData,
        handleGenerateReport, handleDownloadReport,
        reportTypes, periods, formats,
    };
} 