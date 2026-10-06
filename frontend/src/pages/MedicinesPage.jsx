import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { scheduleStore } from '../services/scheduleStore';
import { useToast } from '../context/ToastContext';
import { Pill, Plus, Search, Trash2, Check, X, AlertTriangle } from 'lucide-react';

const MedicinesPage = () => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [newMed, setNewMed] = useState({ name: '', type: 'Tablet', dosage: '1 Tablet', frequency: '2 times daily', timing: 'After Meals', duration: '5 Days' });

  const loadMedicines = () => {
    setMedicines(scheduleStore.getMedicines());
  };

  useEffect(() => {
    loadMedicines();
    window.addEventListener('medicare_reminder_added', loadMedicines);
    window.addEventListener('storage', loadMedicines);
    return () => {
      window.removeEventListener('medicare_reminder_added', loadMedicines);
      window.removeEventListener('storage', loadMedicines);
    };
  }, []);

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;

    const medObj = {
      id: Date.now(),
      ...newMed,
      status: 'Active',
      source: 'User Input'
    };

    const updated = [medObj, ...medicines];
    setMedicines(updated);
    scheduleStore.saveMedicines(updated);
    setIsAddModalOpen(false);
    setNewMed({ name: '', type: 'Tablet', dosage: '1 Tablet', frequency: '2 times daily', timing: 'After Meals', duration: '5 Days' });
    addToast(`Added ${newMed.name} to My Medicines!`, 'success');
  };

  const handleDelete = (id, name) => {
    const updated = medicines.filter((m) => m.id !== id);
    setMedicines(updated);
    scheduleStore.saveMedicines(updated);
    addToast(`Removed ${name}`, 'info');
  };

  const handleDeleteAllMedicines = async () => {
    setIsDeletingAll(true);
    try {
      await scheduleStore.clearAllMedicinesAndRemindersAsync();
      loadMedicines();
      setIsDeleteAllModalOpen(false);
      addToast('Successfully deleted all medicines!', 'success');
    } catch (err) {
      addToast('Failed to delete all medicines.', 'error');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            My Medicines
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
            Manage active medicines, OCR-extracted prescription items, and dosages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {medicines.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="btn btn-outline"
              style={{ fontSize: '13px', color: '#EF4444', borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
            >
              <Trash2 size={16} /> Delete All Medicines
            </button>
          )}

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {medicines.length > 0 && (
        <div className="med-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder="Search medicine by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Medicine Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map((med) => (
            <div key={med.id} className="med-card" style={{ borderLeft: med.status === 'Active' ? '4px solid var(--primary-green)' : '4px solid var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: med.status === 'Active' ? 'var(--light-mint)' : 'var(--bg-app)', color: med.status === 'Active' ? 'var(--primary-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{med.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{med.type} • {med.source}</span>
                  </div>
                </div>

                <span className={`badge-status ${med.status === 'Active' ? 'badge-taken' : 'badge-pending'}`}>
                  {med.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div><strong>Dosage:</strong> {med.dosage}</div>
                <div><strong>Frequency:</strong> {med.frequency}</div>
                <div><strong>Timing:</strong> {med.timing}</div>
                <div><strong>Duration:</strong> {med.duration}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => handleDelete(med.id, med.name)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FCA5A5' }}>
                  <Trash2 size={14} /> Remove
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
            {searchTerm ? 'No Matching Medicines Found' : 'No Medicines in Your List'}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            {searchTerm ? 'Try a different search term or add a new medicine.' : 'Scan a prescription or click the button below to add your prescribed medicines.'}
          </p>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary" style={{ margin: '0 auto' }}>
            <Plus size={16} /> Add New Medicine
          </button>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {isAddModalOpen && (
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
          <div className="med-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Add New Medicine</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div className="form-group">
                <label className="form-label">Medicine Name *</label>
                <input
                  type="text"
                  className="input-field no-icon"
                  placeholder="e.g. Metformin 500mg"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="input-field no-icon"
                    value={newMed.type}
                    onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} /> Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ALL MEDICINES CONFIRMATION DIALOG MODAL */}
      {isDeleteAllModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2200,
          padding: '20px'
        }}>
          <div className="med-card" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Delete All Medicines?
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>This will remove all {medicines.length} medicines and reminders from your account.</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              Are you sure you want to delete all saved medicines? This action will also clear today's reminder schedule and cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={handleDeleteAllMedicines}
                className="btn btn-primary"
                style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} />
                {isDeletingAll ? 'Deleting All...' : 'Yes, Delete All Medicines'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MedicinesPage;
