import React from 'react';
import { FileText, Download, CheckCircle } from 'lucide-react';

export function ReportGeneratorUI({
    selectedReport, setSelectedReport,
    reportPeriod, setReportPeriod,
    reportFormat, setReportFormat,
    includeVisualizations, setIncludeVisualizations,
    isGenerating, progress, reportReady,
    handleGenerateReport, handleDownloadReport,
    reportTypes, periods, formats
}) {
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
                                {reportTypes.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedReport(r.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedReport === r.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'border-secondary-200 dark:border-secondary-700 text-text-secondary hover:border-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'}`}
                                    >
                                        <FileText className="w-4 h-4" /> {r.name}
                                    </button>
                                ))}
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
                                            <FileText className="w-4 h-4" /> {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="viz-ui"
                                    checked={includeVisualizations}
                                    onChange={e => setIncludeVisualizations(e.target.checked)}
                                    className="form-checkbox"
                                />
                                <label htmlFor="viz-ui" className="text-sm text-text-primary">Include Visualizations</label>
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
                </div>
            </div>
        </div>
    );
} 