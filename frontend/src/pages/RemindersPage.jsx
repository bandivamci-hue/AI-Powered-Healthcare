import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { scheduleStore } from '../services/scheduleStore';
import { useToast } from '../context/ToastContext';
import { Bell, Plus, Check, X, RotateCcw, Trash2, AlertTriangle, Pill } from 'lucide-react';

const RemindersPage = () => {
  const { addToast } = useToast();
  const [schedule, setSchedule] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [newReminder, setNewReminder] = useState({ medName: '', time: '08:00 AM', dosage: '1 Tablet', timing: 'After Meals' });

  const loadSchedule = async () => {
    const list = await scheduleStore.getTodayDosesAsync();
    setSchedule(list);
  };

  useEffect(() => {
    loadSchedule();
    const handleSync = () => loadSchedule();
    window.addEventListener('medicare_reminder_added', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('medicare_reminder_added', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.medName.trim()) return;

    await scheduleStore.addCustomReminder(newReminder.medName, newReminder.time, newReminder.dosage, newReminder.timing);
    await loadSchedule();
    setIsModalOpen(false);
    setNewReminder({ medName: '', time: '08:00 AM', dosage: '1 Tablet', timing: 'After Meals' });
    addToast(`Reminder created for ${newReminder.medName} at ${newReminder.time}!`, 'success');
  };

  const handleToggleStatus = async (id) => {
    const updated = await scheduleStore.markDoseTakenAsync(id);
    setSchedule(updated);
    addToast('Marked dose as taken!', 'success');
  };

  const handleDeleteReminder = async () => {
    if (!deleteConfirmItem) return;
    const item = deleteConfirmItem;
    setDeleteConfirmItem(null);

    await scheduleStore.deleteReminderAsync(item);
    await loadSchedule();
    addToast(`Deleted reminder for ${item.med}`, 'info');
  };

  const handleResetSchedule = async () => {
    const resetList = await scheduleStore.resetTodayScheduleAsync();
    setSchedule(resetList);
    addToast('Reset all reminders back to active stage!', 'info');
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Medication Reminders
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
            Manage daily schedule, alarm times, and dosage instructions.
          </p>
        </div>

        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleResetSchedule} className="btn btn-outline" style={{ fontSize: '13px' }}>
            <RotateCcw size={16} /> Reset All Doses
          </button>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Set Custom Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      {schedule.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {schedule.map((item) => (
            <div key={item.id} className="med-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="flex items-center gap-4">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: item.status === 'Missed' ? '#FEE2E2' : item.iconBg || 'var(--light-mint)',
                  color: item.status === 'Missed' ? '#EF4444' : item.color || 'var(--primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.status === 'Missed' ? <AlertTriangle size={22} /> : <Bell size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '18px', fontWeight: 800, color: item.status === 'Missed' ? '#EF4444' : 'var(--text-primary)' }}>
                      {item.time}
                    </span>
                    <span className={`badge-status ${item.status === 'Taken' ? 'badge-taken' : item.status === 'Missed' ? 'badge-missed' : 'badge-upcoming'}`}>
                      {item.status === 'Taken' ? '✓ Taken' : item.status === 'Missed' ? '⚠ Missed' : item.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>{item.med}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.status !== 'Taken' && (
                  <button onClick={() => handleToggleStatus(item.id)} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    <Check size={16} /> Mark as Taken
                  </button>
                )}

                {/* Individual Delete Button */}
                <button
                  onClick={() => setDeleteConfirmItem(item)}
                  className="btn btn-outline"
                  style={{ padding: '8px 12px', fontSize: '13px', color: '#EF4444', borderColor: '#FCA5A5' }}
                  title="Delete this medication reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="med-card" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Pill size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Medication Reminders
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            You have no active reminders scheduled. Scan a prescription or add a custom reminder above.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ margin: '0 auto' }}>
            <Plus size={16} /> Add Your First Reminder
          </button>
        </div>
      )}

      {/* SET REMINDER MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="med-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Set Custom Reminder
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field no-icon"
                  placeholder="e.g. Paracetamol 650"
                  value={newReminder.medName}
                  onChange={(e) => setNewReminder({ ...newReminder, medName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Scheduled Time
                  </label>
                  <select
                    className="input-field no-icon"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  >
                    <option value="06:00 AM">06:00 AM (Early Morning)</option>
                    <option value="08:00 AM">08:00 AM (Breakfast)</option>
                    <option value="09:00 AM">09:00 AM (Morning)</option>
                    <option value="01:00 PM">01:00 PM (Lunch)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="06:00 PM">06:00 PM (Evening)</option>
                    <option value="08:00 PM">08:00 PM (Dinner)</option>
                    <option value="09:00 PM">09:00 PM (Night)</option>
                    <option value="10:00 PM">10:00 PM (Bedtime)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Dosage
                  </label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. 1 Tablet"
                    value={newReminder.dosage}
                    onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Timing Instructions
                </label>
                <input
                  type="text"
                  className="input-field no-icon"
                  placeholder="e.g. After Lunch"
                  value={newReminder.timing}
                  onChange={(e) => setNewReminder({ ...newReminder, timing: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} /> Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL DELETE CONFIRMATION DIALOG MODAL */}
      {deleteConfirmItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2100,
          padding: '20px'
        }}>
          <div className="med-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Delete Medication Reminder?
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>This will remove the reminder from your schedule and database.</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{deleteConfirmItem.med}</strong>
              <span style={{ color: 'var(--text-muted)' }}>Scheduled Time: {deleteConfirmItem.time} ({deleteConfirmItem.detail})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReminder}
                className="btn btn-primary"
                style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
              >
                Delete Reminder
              </button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
};

export default RemindersPage;
