import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { documentService } from '../services/documentService';
import { scheduleStore } from '../services/scheduleStore';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PrescriptionPreview from '../components/prescription/PrescriptionPreview';
import RawOcrPanel from '../components/prescription/RawOcrPanel';
import MedicineGuidance from '../components/prescription/MedicineGuidance';
import MedicineBreakdown from '../components/prescription/MedicineBreakdown';
import VoiceGuidanceCard from '../components/prescription/VoiceGuidanceCard';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  Pill, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Clock,
  Volume2,
  VolumeX,
  Upload,
  FileCheck,
  Activity,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalLanguage, setModalLanguage] = useState(user?.preferredLanguage || 'Telugu');
  const [activeVoiceGuidance, setActiveVoiceGuidance] = useState('');

  // Fetch live persisted medical records from backend database
  const loadMedicalHistory = async () => {
    setLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.warn('Error loading history from API:', err);
      addToast('Failed to load medical history from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const handleApplySchedule = (record) => {
    if (record.medicines && record.medicines.length > 0) {
      scheduleStore.setScheduleForNewScan(record.medicines, true);
      setSelectedRecord(null);
      addToast(`Applied ${record.document_name} to Today's Schedule!`, 'success');
      navigate('/dashboard');
    } else {
      addToast('No extracted medicines found in this document to schedule.', 'warning');
    }
  };

  const getCleanOcrText = (doc) => {
    if (doc.extracted_text) return doc.extracted_text;
    if (!doc.ai_summary) return '';
    if (doc.ai_summary.includes('[RAW_TEXT]')) {
      const parts = doc.ai_summary.split('[RAW_TEXT]');
      return (parts[1] || parts[0]).split('[MEDICINES]')[0].trim();
    }
    if (doc.ai_summary.includes('[MEDICINES]')) {
      return doc.ai_summary.split('[MEDICINES]')[0].trim();
    }
    return doc.ai_summary.trim();
  };

  // Quick Listen Trigger directly from the table row
  const handleQuickListen = (doc, e) => {
    e.stopPropagation();
    setSelectedRecord(doc);
    const summaryText = doc.medicines && doc.medicines.length > 0
      ? `Medical prescription ${doc.document_name}. Contains ${doc.medicines.length} prescribed medicines: ` +
        doc.medicines.map(m => `${m.name}, ${m.dose || '1 dose'}, ${m.frequency || 'as prescribed'}`).join('. ')
      : `Medical document ${doc.document_name}. ${getCleanOcrText(doc)}`;
    setActiveVoiceGuidance(summaryText);
    addToast(`Playing audio guide for ${doc.document_name}`, 'info');
  };

  // Filter documents based on search & document type
  const filteredDocuments = documents.filter((item) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (item.document_name || '').toLowerCase().includes(term);
    const docMatch = (item.doctor_name || '').toLowerCase().includes(term);
    const medMatch = (item.medicines || []).some((m) => (m.name || '').toLowerCase().includes(term));
    const textMatch = (item.ai_summary || '').toLowerCase().includes(term);

    const matchesSearch = nameMatch || docMatch || medMatch || textMatch;

    if (selectedType === 'ALL') return matchesSearch;
    return matchesSearch && (item.document_type || 'prescription').toLowerCase() === selectedType.toLowerCase();
  });

  const getDocTypeBadge = (type) => {
    const t = (type || 'prescription').toLowerCase();
    if (t.includes('prescription')) return { label: 'Prescription', color: '#10B981', bg: 'var(--light-mint)', icon: Pill };
    if (t.includes('report')) return { label: 'Medical Report', color: '#3B82F6', bg: 'var(--blue-soft-bg)', icon: Activity };
    if (t.includes('discharge')) return { label: 'Discharge Summary', color: '#8B5CF6', bg: 'var(--purple-soft-bg)', icon: FileText };
    if (t.includes('lab')) return { label: 'Lab Test', color: '#F59E0B', bg: 'var(--yellow-soft-bg)', icon: FileSpreadsheet };
    return { label: 'Medical Document', color: '#10B981', bg: 'var(--light-mint)', icon: FileText };
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Medical History Vault
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Permanent database archive of your uploaded doctor prescriptions, medical reports, and voice guidance.
          </p>
        </div>

        <Link to="/scan-prescription" className="btn btn-primary" style={{ padding: '10px 20px', gap: '8px' }}>
          <Upload size={18} /> Upload New Document
        </Link>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="stat-cards-grid">
        <div className="stat-card stat-card-green">
          <div>
            <span className="stat-title">Total Records</span>
            <div className="stat-value">{documents.length}</div>
            <span style={{ fontSize: '12px', color: 'var(--dark-green)' }}>Database Synced</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div>
            <span className="stat-title">Prescriptions</span>
            <div className="stat-value">{documents.filter(d => (d.document_type || 'prescription').toLowerCase().includes('prescription')).length}</div>
            <span style={{ fontSize: '12px', color: 'var(--blue-text)' }}>AI Extracted</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--blue-soft-bg)', color: 'var(--blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} />
          </div>
        </div>

        <div className="stat-card stat-card-yellow">
          <div>
            <span className="stat-title">Reports & Tests</span>
            <div className="stat-value">{documents.filter(d => !(d.document_type || 'prescription').toLowerCase().includes('prescription')).length}</div>
            <span style={{ fontSize: '12px', color: 'var(--yellow-text)' }}>Medical Records</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--yellow-soft-bg)', color: 'var(--yellow-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div>
            <span className="stat-title">Extracted Medicines</span>
            <div className="stat-value">
              {documents.reduce((sum, d) => sum + (d.medicines ? d.medicines.length : 0), 0)}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--purple-text)' }}>Active & Archived</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--purple-soft-bg)', color: 'var(--purple-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* SEARCH AND TYPE FILTER BAR */}
      <div className="med-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: '280px', maxWidth: '440px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by document name, doctor, medicine, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Document Type Filter Pills */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Documents' },
              { id: 'prescription', label: 'Prescriptions' },
              { id: 'medical_report', label: 'Reports' },
              { id: 'discharge_summary', label: 'Discharge Summaries' },
              { id: 'lab_test', label: 'Lab Tests' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: selectedType === type.id ? 'var(--primary-green)' : 'var(--border-subtle)',
                  backgroundColor: selectedType === type.id ? 'var(--primary-green)' : 'var(--bg-app)',
                  color: selectedType === type.id ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MEDICAL HISTORY TABLE / LIST CONTAINER */}
      <div className="med-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading medical records from secure database...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Medical Records Found
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
              {searchTerm || selectedType !== 'ALL'
                ? 'No documents match your active search or filter criteria. Try clearing filters.'
                : 'You have not uploaded any prescriptions or medical reports yet. Upload your first document to store it permanently.'}
            </p>
            <Link to="/scan-prescription" className="btn btn-primary">
              <Upload size={16} /> Upload First Prescription
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Document</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Doctor / Facility</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Uploaded Date</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Extracted Medicines</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((item) => {
                const typeBadge = getDocTypeBadge(item.document_type);
                const TypeIcon = typeBadge.icon;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    {/* Document Title & File Link */}
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: typeBadge.bg, color: typeBadge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <TypeIcon size={18} />
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '14px' }}>{item.document_name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID #{item.id} • Processed</span>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: typeBadge.bg,
                        color: typeBadge.color
                      }}>
                        {typeBadge.label}
                      </span>
                    </td>

                    {/* Doctor Name */}
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {item.doctor_name || 'Dr. Prescribing Physician'}
                    </td>

                    {/* Upload Date */}
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                    </td>

                    {/* Medicines List Preview */}
                    <td style={{ padding: '16px 20px' }}>
                      {item.medicines && item.medicines.length > 0 ? (
                        <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.medicines[0].name}
                          </span>
                          {item.medicines.length > 1 && (
                            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                              +{item.medicines.length - 1} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prescription Scanned</span>
                      )}
                    </td>

                    {/* Action Buttons: Listen & View Details */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleQuickListen(item, e)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--primary-green)' }}
                          title="Listen with Text-to-Speech Voice Reader"
                        >
                          <Volume2 size={15} /> Listen
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRecord(item);
                            setModalLanguage(user?.preferredLanguage ? user.preferredLanguage.charAt(0).toUpperCase() + user.preferredLanguage.slice(1) : 'Telugu');
                          }}
                          className="btn btn-outline-green"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* RICH HISTORICAL DETAILS MODAL WITH TEXT-TO-SPEECH VOICE READER */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '24px'
        }}>
          <div className="med-card" style={{ width: '100%', maxWidth: '1150px', padding: '32px', maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedRecord.document_name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Permanent Vault Record • Uploaded on {new Date(selectedRecord.uploaded_at || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Three Column Results Layout Inside Modal */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Column 1: Original Image Preview */}
              <div style={{ minHeight: '340px' }}>
                <PrescriptionPreview
                  imageUrl={selectedRecord.file_url || selectedRecord.file || selectedRecord.imageUrl}
                  medicinesCount={(selectedRecord.medicines || []).length}
                />
              </div>

              {/* Column 2: Extracted Medical Information */}
              <div style={{ minHeight: '340px' }}>
                <RawOcrPanel
                  rawText={getCleanOcrText(selectedRecord)}
                />
              </div>

              {/* Column 3: Multilingual Patient Guidance + Voice Assistant */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '340px' }}>
                <MedicineGuidance
                  medicines={selectedRecord.medicines || []}
                  selectedLanguage={modalLanguage}
                  onLanguageChange={(lang) => setModalLanguage(lang)}
                  onGuidanceChange={(text) => setActiveVoiceGuidance(text)}
                />

                {/* Multilingual Voice Reader for this History Record */}
                <VoiceGuidanceCard
                  text={activeVoiceGuidance}
                  selectedLanguage={modalLanguage}
                />
              </div>
            </div>

            {/* Extracted Medicine Breakdown Cards inside Modal */}
            {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
              <MedicineBreakdown medicines={selectedRecord.medicines} />
            )}

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                {selectedRecord.file_url && (
                  <a
                    href={selectedRecord.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '13px' }}
                  >
                    <Download size={15} /> Download Original Document
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedRecord(null)} className="btn btn-outline">
                  Close Vault Record
                </button>

                <button onClick={() => handleApplySchedule(selectedRecord)} className="btn btn-primary">
                  <RefreshCw size={16} /> Re-Create & Apply to Today's Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HistoryPage;
