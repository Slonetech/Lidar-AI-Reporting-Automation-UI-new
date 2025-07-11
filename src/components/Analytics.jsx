import React, { useState } from 'react';
import { Download, BarChart3, LineChart, FileText } from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import {
  ResponsiveContainer, LineChart as RLineChart, Line, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const categories = ['Loans', 'Savings', 'Members', 'Revenue', 'Expenses', 'Compliance', 'Defaults'];

// Dummy data for charts
const dummyLineData = months.map((month, i) => ({
  name: month,
  Portfolio: 10 + i * 3 + (i % 2 === 0 ? 5 : -2),
  Members: 100 + i * 10 + (i % 3 === 0 ? 15 : -10),
  Compliance: 80 + i * 2 + (i % 4 === 0 ? 5 : -3),
}));
const dummyBarData = categories.map((cat, i) => ({
  name: cat,
  Value: 20 + i * 7 + (i % 2 === 0 ? 10 : -5),
}));

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
];
const metrics = [
  { value: 'Portfolio', label: 'Portfolio Growth' },
  { value: 'Members', label: 'Active Members' },
  { value: 'Compliance', label: 'Compliance Score' },
];
const ranges = [
  { value: '6m', label: 'Last 6 Months' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'ytd', label: 'Year to Date' },
];

const Analytics = ({ compact = false }) => {
  const { showToast } = useToast();
  const [chartType, setChartType] = useState('line');
  const [metric, setMetric] = useState(['Portfolio']);
  const [range, setRange] = useState('12m');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Filtering logic (dummy for now)
  let filteredLineData = dummyLineData;
  if (range === '6m') filteredLineData = dummyLineData.slice(-6);
  if (range === 'ytd') filteredLineData = dummyLineData.slice(0, new Date().getMonth() + 1);
  // Date picker filter (dummy, not affecting data yet)

  const handleExport = (type) => {
    showToast(`Analytics exported as ${type.toUpperCase()} (dummy)`, { type: 'success' });
  };

  // Multi-select for metrics
  const handleMetricChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setMetric(selected);
  };

  return (
    <div className={`w-full ${compact ? '' : 'max-w-2xl mx-auto'} flex flex-col gap-4`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {chartTypes.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.value}
                className={`btn btn-secondary px-3 py-1 ${chartType === c.value ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => setChartType(c.value)}
                aria-label={c.label}
              >
                <Icon className="w-4 h-4" /> {c.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="form-select min-w-[120px]"
            value={range}
            onChange={e => setRange(e.target.value)}
            aria-label="Select date range"
          >
            {ranges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start date"
            className="form-input w-28"
            aria-label="Start date"
            isClearable
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End date"
            className="form-input w-28"
            aria-label="End date"
            isClearable
          />
          <select
            className="form-select min-w-[140px]"
            multiple
            value={metric}
            onChange={handleMetricChange}
            aria-label="Select metrics"
            size={metrics.length}
            style={{ height: `${metrics.length * 2}em` }}
          >
            {metrics.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        {/* Export Button Group */}
        <div className="flex gap-0 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700 bg-background-secondary dark:bg-secondary-800 shadow-sm">
          <button
            className="btn btn-outline !rounded-none !border-0 !shadow-none flex items-center gap-2 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus-visible"
            onClick={() => handleExport('csv')}
            aria-label="Export as CSV"
            tabIndex={0}
            title="Export as CSV"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <div className="w-px bg-secondary-200 dark:bg-secondary-700 my-2" />
          <button
            className="btn btn-outline !rounded-none !border-0 !shadow-none flex items-center gap-2 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus-visible"
            onClick={() => handleExport('png')}
            aria-label="Export as Image"
            tabIndex={0}
            title="Export as Image"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Image</span>
          </button>
        </div>
      </div>
      {/* Chart Area */}
      <div className={`rounded-xl border border-secondary-200 dark:border-secondary-700 bg-background-secondary dark:bg-secondary-800 shadow-inner flex items-center justify-center ${compact ? 'h-40' : 'h-96'}`} style={{ minHeight: compact ? 160 : 340 }}>
        <ResponsiveContainer width="100%" height={compact ? 160 : 320}>
          {chartType === 'line' ? (
            <RLineChart data={filteredLineData} margin={{ top: 24, right: 24, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#8884d8' }} />
              <YAxis tick={{ fill: '#8884d8' }} />
              <Tooltip contentStyle={{ background: '#18181b', color: '#fff', borderRadius: 8, border: '1px solid #6366f1' }} />
              <Legend />
              {metric.map((m, idx) => (
                <Line
                  key={m}
                  type="monotone"
                  dataKey={m}
                  stroke={['#6366f1', '#3b82f6', '#a78bfa'][idx % 3]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </RLineChart>
          ) : (
            <RBarChart data={dummyBarData} margin={{ top: 24, right: 24, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#8884d8' }} />
              <YAxis tick={{ fill: '#8884d8' }} />
              <Tooltip contentStyle={{ background: '#18181b', color: '#fff', borderRadius: 8, border: '1px solid #6366f1' }} />
              <Legend />
              <Bar dataKey="Value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </RBarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-text-tertiary text-center mt-2">(This is a demo with interactive charts and advanced filtering.)</div>
    </div>
  );
};

export default Analytics; 