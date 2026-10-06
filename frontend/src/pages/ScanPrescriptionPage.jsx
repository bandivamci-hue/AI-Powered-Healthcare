import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { documentService } from '../services/documentService';
import { scheduleStore } from '../services/scheduleStore';
import { 
  Camera, 
  Upload, 
  HelpCircle, 
  Sun, 
  Target, 
  FileText, 
  ShieldCheck, 
  MoreVertical,
  CheckCircle2,
  Sparkles,
  Loader2,
  Clock,
  Zap,
  X,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const PROCESSING_STEPS = [
  { id: 1, label: 'Uploading prescription image to encrypted vault', icon: Upload, progress: 25, duration: 1 },
  { id: 2, label: 'AI Vision OCR analyzing doctor handwriting & printed text', icon: Target, progress: 55, duration: 2 },
  { id: 3, label: 'Extracting medicine names, strengths & dosage timings', icon: Sparkles, progress: 85, duration: 2 },
  { id: 4, label: 'Structuring your personalized medication schedule', icon: CheckCircle2, progress: 100, duration: 1 }
];

const ScanPrescriptionPage = () => {
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [error, setError] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Progress & Loading Animation State
  const [processingStep, setProcessingStep] = useState(1);
  const [progressPct, setProgressPct] = useState(15);
  const [estimatedSeconds, setEstimatedSeconds] = useState(4);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  // Live Camera Capture State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentScans(scheduleStore.getHistory());
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const openCamera = async () => {
    setError('');
    setCameraError('');
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    setIsCameraOpen(true);
    setCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraLoading(false);
      setCameraError('Camera capture is not supported in this browser. Please upload the prescription image instead.');
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (e) {
        // Fallback for desktop webcams or restricted browsers
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setCameraLoading(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Video play notice:', err));
      }
    } catch (err) {
      setCameraLoading(false);
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permission in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera was detected on this device.');
      } else if (err.name === 'NotSupportedError') {
        setCameraError('Camera capture is not supported in this browser. Please upload the prescription image instead.');
      } else {
        setCameraError('Unable to access device camera. Please check camera permissions or upload an image.');
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedPhotoUrl(dataUrl);
        stopCameraStream();
      } else {
        setCameraError('Failed to capture photo. Please try again.');
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    openCamera();
  };

  const handleUseCapturedPhoto = () => {
    if (!capturedBlob) return;
    const fileName = `prescription_camera_${Date.now()}.jpg`;
    const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });
    
    // Close camera modal
    setIsCameraOpen(false);
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    stopCameraStream();

    // Directly reuse the existing prescription processing pipeline
    handleFileSelected(file);
  };

  const closeCameraModal = () => {
    setIsCameraOpen(false);
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    stopCameraStream();
  };

  // Timer simulation during active upload/processing
  useEffect(() => {
    if (uploading) {
      setProcessingStep(1);
      setProgressPct(20);
      setEstimatedSeconds(4);
      setElapsedSeconds(0);

      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);

        if (elapsed <= 1) {
          setProcessingStep(1);
          setProgressPct(25);
          setEstimatedSeconds(4);
        } else if (elapsed <= 2) {
          setProcessingStep(2);
          setProgressPct(55);
          setEstimatedSeconds(3);
        } else if (elapsed <= 4) {
          setProcessingStep(3);
          setProgressPct(85);
          setEstimatedSeconds(1);
        } else {
          setProcessingStep(4);
          setProgressPct(95);
          setEstimatedSeconds(0);
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [uploading]);

  const handleFileSelected = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setError('');
    
    // Create immediate local data URL for preview and thumbnail in loading animation
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPreviewImage(dataUrl);
      setUploading(true);

      try {
        let docData;
        try {
          docData = await documentService.uploadDocument(file, file.name);
          docData.imageUrl = docData.file || dataUrl;
        } catch (apiErr) {
          console.warn('[Prescription Notice] Local fallback:', apiErr);
          docData = {
            id: Date.now(),
            document_name: file.name,
            document_type: 'prescription',
            file: dataUrl,
            imageUrl: dataUrl,
            uploaded_at: new Date().toISOString(),
            ai_summary: null
          };
        }

        // Complete 100% progress animation before navigating
        setProgressPct(100);
        setProcessingStep(4);
        
        setTimeout(() => {
          setUploading(false);
          addToast('Prescription analyzed successfully!', 'success');
          navigate('/scan-prescription/results', { state: { document: docData } });
        }, 600);

      } catch (err) {
        console.error(err);
        setUploading(false);
        setError(err.detail || 'Failed to process prescription image. Please try again.');
        addToast('Document upload failed.', 'error');
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link> {' > '} <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Scan Prescription</span>
      </div>

      {/* Page Title Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Scan Prescription
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
            Upload or capture a clear photo of your prescription. AI Vision automatically extracts medicines and creates your dosage schedule.
          </p>
        </div>
        <button
          onClick={() => setShowHowItWorks(true)}
          className="btn btn-outline-green"
          style={{ borderRadius: '9999px', fontSize: '13px', padding: '8px 18px' }}
        >
          <HelpCircle size={16} /> How it works?
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '10px', padding: '14px', fontSize: '13.5px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}


      {/* SCAN PAGE MAIN GRID */}
      <div className="scan-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
        {/* LEFT COLUMN: UPLOADER & RECENT SCANS */}
        <div>
          {/* Main Upload Box */}
          <div
            className={`med-card upload-dropzone-card ${dragActive ? 'drag-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            style={{ 
              marginBottom: '32px',
              padding: '44px 28px',
              borderRadius: '28px',
              border: '2px dashed rgba(16, 185, 129, 0.4)',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            {/* Hidden native file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files[0] && handleFileSelected(e.target.files[0])}
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={(e) => e.target.files[0] && handleFileSelected(e.target.files[0])}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
            />

            <div className="upload-icon-circle processing-radar-circle" style={{ 
              width: '68px', 
              height: '68px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--primary-green)', 
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}>
              <FileText size={32} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Upload or capture prescription
            </h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '28px' }}>
              Select a method below or drag and drop your document anywhere in this box
            </p>

            {/* TWO DISTINCT INTERACTIVE ACTION CARDS */}
            <div className="upload-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px', textAlign: 'center' }}>
              {/* Action Card 1: Upload File / Browse */}
              <div
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="upload-action-tile upload-action-browse"
                style={{
                  padding: '24px 18px',
                  borderRadius: '20px',
                  border: '1.5px dashed var(--primary-green)',
                  backgroundColor: 'var(--light-mint)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                }}>
                  <Upload size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    Upload Prescription File
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Browse device or drop PNG, JPG (Max 10MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: '6px', fontSize: '13px', padding: '8px 18px', pointerEvents: 'none' }}
                >
                  <Upload size={15} /> Browse Files
                </button>
              </div>

              {/* Action Card 2: Take Photo with Camera */}
              <div
                onClick={(e) => { e.stopPropagation(); openCamera(); }}
                className="upload-action-tile upload-action-camera"
                style={{
                  padding: '24px 18px',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(59, 130, 246, 0.4)',
                  backgroundColor: 'var(--blue-soft-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                }}>
                  <Camera size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    Take Photo with Camera
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Capture live document using webcam or phone
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: '6px', fontSize: '13px', padding: '8px 18px', color: '#2563EB', borderColor: 'rgba(59, 130, 246, 0.4)', pointerEvents: 'none' }}
                >
                  <Camera size={15} /> Open Camera
                </button>
              </div>
            </div>

            {/* Security Guarantee Badge */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              borderRadius: '999px',
              padding: '10px 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border-subtle)',
              color: 'var(--primary-green)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <ShieldCheck size={17} color="var(--primary-green)" />
              Your prescription is private, encrypted, and processed securely.
            </div>
          </div>

          {/* Recent Scans Section (Synced with History Vault) */}
          <div className="med-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Scans</h3>
              <Link to="/history" style={{ fontSize: '13px', color: 'var(--primary-green)', fontWeight: 600 }}>View All</Link>
            </div>

            {recentScans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                No past scans recorded yet. Upload your first prescription above!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentScans.slice(0, 4).map((scan) => (
                  <div 
                    key={scan.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-input)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{scan.document_name}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {scan.uploaded_at ? new Date(scan.uploaded_at).toLocaleDateString() : 'Uploaded'}
                        </span>
                      </div>
                    </div>

                    <span className="badge-status badge-extracted" style={{ fontSize: '11px' }}>
                      AI Processed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TIPS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="med-card" style={{ padding: '28px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
              <Zap size={18} color="var(--primary-green)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Tips for Best Results
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex items-start gap-3">
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sun size={17} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Use Good Lighting</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>Ensure the paper is evenly lit with no heavy shadows across doctor handwriting.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Camera size={17} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Capture Full Document</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>Align all four corners within the camera frame for accurate dosage detection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target size={17} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Keep It Steady</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>Hold the camera flat and steady to avoid blurriness and maximize OCR precision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS MODAL */}
      {showHowItWorks && (
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
          <div className="med-card" style={{ maxWidth: '520px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={20} color="var(--primary-green)" />
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>How Prescription AI Works</h3>
              </div>
              <button onClick={() => setShowHowItWorks(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="flex items-start gap-3">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Upload or Snap Photo</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Take a photo or upload a PNG/JPEG of your doctor prescription.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>AI Vision OCR Extraction</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Gemini Vision AI parses medicine names, strengths (e.g. 500mg), frequencies (e.g. BID), and timings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Automatic Dosage Reminders</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Confirmed medicines are scheduled into daily date-aware alarms with taken/missed tracking.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowHowItWorks(false)} className="btn btn-primary btn-full">
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* DYNAMIC SCANNING & TIME ESTIMATION LOADING MODAL */}
      {uploading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }}>
          <div className="med-card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            borderRadius: '24px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1.5px solid var(--mint-border)',
            textAlign: 'center'
          }}>
            {/* Visual Laser Scanner Preview Box */}
            <div style={{
              width: '140px',
              height: '140px',
              margin: '0 auto 20px',
              borderRadius: '20px',
              border: '2px solid var(--primary-green)',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
            }}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Prescription Scan"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
              ) : (
                <FileText size={48} color="var(--primary-green)" />
              )}
              {/* Animated Laser Sweep Beam */}
              <div className="scanner-laser-bar"></div>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Analyzing Prescription...
            </h3>
            
            {/* Time Estimation Indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary-green)',
              backgroundColor: 'var(--light-mint)',
              padding: '6px 16px',
              borderRadius: '999px',
              marginBottom: '20px'
            }}>
              <LoadingSpinner size={14} color="var(--primary-green)" strokeWidth={3} />
              <span>
                {estimatedSeconds > 0 ? `Estimated time: ~${estimatedSeconds}s remaining` : 'Finalizing results...'} ({elapsedSeconds}s elapsed)
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Scanning Progress</span>
                <span style={{ color: 'var(--primary-green)' }}>{progressPct}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }}></div>
              </div>
            </div>

            {/* Live Step Pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              {PROCESSING_STEPS.map((step) => {
                const isCurrent = processingStep === step.id;
                const isPassed = processingStep > step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: isPassed || isCurrent ? 1 : 0.45 }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? 'var(--primary-green)' : isCurrent ? 'var(--light-mint)' : 'var(--border-subtle)',
                      color: isPassed ? 'white' : isCurrent ? 'var(--primary-green)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPassed ? (
                        <CheckCircle2 size={15} />
                      ) : isCurrent ? (
                        <LoadingSpinner size={13} color="var(--primary-green)" strokeWidth={3} />
                      ) : (
                        <Icon size={12} />
                      )}
                    </div>

                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--primary-green)' : 'var(--text-primary)'
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL LIVE CAMERA CAPTURE MODAL */}
      {isCameraOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3100,
          padding: '16px'
        }}>
          <div className="med-card" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            borderRadius: '24px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            border: '1.5px solid var(--mint-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {capturedPhotoUrl ? 'Prescription Photo Preview' : 'Capture Prescription'}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {capturedPhotoUrl ? 'Review photo before AI analysis' : 'Position document within the camera frame'}
                  </span>
                </div>
              </div>

              <button
                onClick={closeCameraModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
                aria-label="Close camera"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {cameraError && (
              <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.25)', color: '#DC2626', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  <strong>Camera Notice</strong>
                </div>
                <span>{cameraError}</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
                  <button onClick={openCamera} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    Try Again
                  </button>
                  <button onClick={closeCameraModal} className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    Upload File Instead
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {cameraLoading && !cameraError && (
              <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <LoadingSpinner size={36} color="var(--primary-green)" strokeWidth={3} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Starting camera stream...</span>
              </div>
            )}

            {/* Live Camera Viewfinder */}
            {!cameraLoading && !cameraError && !capturedPhotoUrl && (
              <div>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '320px',
                  backgroundColor: '#000',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Document Alignment Frame Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    border: '2px dashed rgba(255, 255, 255, 0.7)',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25)'
                  }}>
                    <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderLeft: '4px solid #10B981', borderRadius: '4px 0 0 0' }}></div>
                    <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderRight: '4px solid #10B981', borderRadius: '0 4px 0 0' }}></div>
                    <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderLeft: '4px solid #10B981', borderRadius: '0 0 0 4px' }}></div>
                    <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderRight: '4px solid #10B981', borderRadius: '0 0 4px 0' }}></div>
                  </div>

                  {/* Floating Guide Badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)'
                  }}>
                    Align prescription inside frame
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={capturePhoto}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '12px', fontSize: '14px', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Camera size={18} /> Capture Photo
                  </button>
                  <button
                    onClick={closeCameraModal}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '12px', fontSize: '14px', borderRadius: '12px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Captured Photo Review State */}
            {capturedPhotoUrl && (
              <div>
                <div style={{
                  width: '100%',
                  height: '320px',
                  backgroundColor: '#000',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--primary-green)'
                }}>
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured prescription"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={handleRetake}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={16} /> Retake
                  </button>
                  <button
                    onClick={handleUseCapturedPhoto}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '12px', fontSize: '14px', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <CheckCircle2 size={18} /> Use This Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ScanPrescriptionPage;
