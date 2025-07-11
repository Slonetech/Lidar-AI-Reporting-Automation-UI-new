import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../utils/ToastContext';

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

const Validation = () => {
  const { showToast } = useToast();
  useEffect(() => {
    showToast('Validation results loaded.', { type: 'success' });
  }, [showToast]);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card card-hover">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-text-primary">Validation Results</h2>
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
    </div>
  );
};

export default Validation;
