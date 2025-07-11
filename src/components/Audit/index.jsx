import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import { useToast } from '../../utils/ToastContext';

const dummyLogs = [
  { user: 'Alice', action: 'Generated Report', timestamp: '2024-06-01 10:12', status: 'success' },
  { user: 'Bob', action: 'Scheduled Report', timestamp: '2024-06-01 09:45', status: 'success' },
  { user: 'Carol', action: 'Validation Error', timestamp: '2024-06-01 09:30', status: 'error' },
  { user: 'Dave', action: 'Paused Schedule', timestamp: '2024-05-31 17:20', status: 'warning' },
  { user: 'Eve', action: 'User Login', timestamp: '2024-05-31 08:00', status: 'success' },
  { user: 'Frank', action: 'Edited Settings', timestamp: '2024-05-30 15:10', status: 'success' },
  { user: 'Grace', action: 'Failed Download', timestamp: '2024-05-30 14:55', status: 'error' },
  { user: 'Heidi', action: 'Generated Report', timestamp: '2024-05-30 13:40', status: 'success' },
];

const Audit = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filteredLogs = dummyLogs.filter(log =>
    (filter === 'all' || log.status === filter) &&
    (log.user.toLowerCase().includes(search.toLowerCase()) ||
     log.action.toLowerCase().includes(search.toLowerCase()) ||
     log.timestamp.includes(search))
  );

  useEffect(() => {
    if (search || filter !== 'all') {
      showToast(
        filteredLogs.length > 0
          ? `Showing ${filteredLogs.length} audit log(s).`
          : 'No matching audit logs found.',
        { type: filteredLogs.length > 0 ? 'info' : 'error' }
      );
    }
    // eslint-disable-next-line
  }, [search, filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card card-hover">
        <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Audit Trail</h2>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search user, action, time..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-secondary-200 dark:border-secondary-700">
                    <td className="py-2 pr-4">{log.user}</td>
                    <td className="py-2 pr-4">{log.action}</td>
                    <td className="py-2 pr-4">{log.timestamp}</td>
                    <td className="py-2">
                      {log.status === 'success' && <span className="inline-flex items-center gap-1 text-success-600"><CheckCircle className="w-4 h-4" /> Success</span>}
                      {log.status === 'warning' && <span className="inline-flex items-center gap-1 text-amber-600"><AlertCircle className="w-4 h-4" /> Warning</span>}
                      {log.status === 'error' && <span className="inline-flex items-center gap-1 text-destructive-600"><XCircle className="w-4 h-4" /> Error</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center text-text-secondary py-8">No matching audit logs found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
