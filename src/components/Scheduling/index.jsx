import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../utils/ToastContext';
import Modal from '../../utils/Modal';

const initialSchedules = [
  { name: 'Monthly Portfolio', frequency: 'Monthly', next: '2024-07-01', recipients: 'Board, SASRA', status: 'Active' },
  { name: 'Compliance Report', frequency: 'Quarterly', next: '2024-09-30', recipients: 'Compliance', status: 'Active' },
  { name: 'Member Analysis', frequency: 'Yearly', next: '2025-01-10', recipients: 'Management', status: 'Paused' },
];

const Scheduling = () => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingIdx, setPendingIdx] = useState(null);

  const requestToggle = (idx) => {
    setPendingIdx(idx);
    setModalOpen(true);
  };

  const confirmToggle = () => {
    setSchedules(schedules => schedules.map((s, i) => {
      if (i === pendingIdx) {
        const newStatus = s.status === 'Active' ? 'Paused' : 'Active';
        showToast(`Schedule "${s.name}" ${newStatus === 'Active' ? 'activated' : 'paused'}.`, { type: 'success' });
        return { ...s, status: newStatus };
      }
      return s;
    }));
    setModalOpen(false);
    setPendingIdx(null);
  };

  const cancelToggle = () => {
    setModalOpen(false);
    setPendingIdx(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Modal
        open={modalOpen}
        onClose={cancelToggle}
        title={pendingIdx !== null ? (schedules[pendingIdx].status === 'Active' ? 'Pause Schedule?' : 'Activate Schedule?') : ''}
        actions={[
          <button key="cancel" className="btn btn-secondary" onClick={cancelToggle}>Cancel</button>,
          <button key="confirm" className="btn btn-primary" onClick={confirmToggle} autoFocus>Confirm</button>
        ]}
      >
        {pendingIdx !== null && (
          <span>
            Are you sure you want to {schedules[pendingIdx].status === 'Active' ? 'pause' : 'activate'} the schedule <b>{schedules[pendingIdx].name}</b>?
          </span>
        )}
      </Modal>
      <div className="card card-hover">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-text-primary">Report Schedules</h2>
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
                  <th className="py-2">Toggle</th>
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
                    <td className="py-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => requestToggle(idx)}>
                        {s.status === 'Active' ? 'Pause' : 'Activate'}
                      </button>
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

export default Scheduling;
