import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Bookmark, ArrowRight, X } from 'lucide-react';
import { scheduleStore } from '../../services/scheduleStore';
import { useToast } from '../../context/ToastContext';

const ResultsActions = ({ doc, medicines = [], rawText = '' }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [replaceSchedule, setReplaceSchedule] = useState(true);

  const handleReviewLater = () => {
    scheduleStore.addHistoryRecord(doc, medicines, rawText);
    addToast('Prescription saved to History Vault!', 'info');
    navigate('/dashboard');
  };

  const handleConfirmSchedule = () => {
    if (!medicines || medicines.length === 0) {
      addToast('No medicines available to create a schedule.', 'warning');
      return;
    }

    scheduleStore.addHistoryRecord(doc, medicines, rawText);
    scheduleStore.setScheduleForNewScan(medicines, replaceSchedule);
    addToast('Saved to History Vault & updated Today\'s Schedule!', 'success');
    navigate('/dashboard');
  };

  return (
    <div style={{ marginTop: '28px' }}>
      {/* Safety Notice & Replacement Option */}
      <div style={{
        backgroundColor: 'var(--light-mint)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        border: '1px solid var(--mint-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} color="var(--primary-green)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark-green)' }}>
            Please review your extracted medicines before adding them to your schedule.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="replaceScheduleOption"
            checked={replaceSchedule}
            onChange={(e) => setReplaceSchedule(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-green)', cursor: 'pointer' }}
          />
          <label htmlFor="replaceScheduleOption" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dark-green)', cursor: 'pointer' }}>
            Replace today's schedule with ONLY these medicines
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => navigate('/scan-prescription')}
          className="btn btn-outline"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={16} /> Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReviewLater}
            className="btn btn-outline-green"
          >
            <Bookmark size={16} /> Review Later
          </button>

          <button
            onClick={handleConfirmSchedule}
            disabled={!medicines || medicines.length === 0}
            className="btn btn-primary"
            style={{ padding: '12px 24px', opacity: (!medicines || medicines.length === 0) ? 0.6 : 1 }}
          >
            Confirm & Create Schedule <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsActions;
