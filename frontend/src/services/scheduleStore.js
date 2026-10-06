// Persistent storage & business logic for Schedule, Medicines, and History Vault
import api from './api';

const INITIAL_SCHEDULE = [
  { id: 1, medicationId: 1, time: '08:00 AM', med: 'Tab. Betaloc 100mg', detail: '1 tablet • BID', status: 'Taken', timePeriod: 'Morning', iconBg: '#EAF8F2', color: '#16A57A' },
  { id: 2, medicationId: 2, time: '09:00 AM', med: 'Tab. Paracetamol 500mg', detail: '1 tablet • TID', status: 'Upcoming', timePeriod: 'Morning', iconBg: '#EAF8F2', color: '#16A57A' },
  { id: 3, medicationId: 3, time: '01:00 PM', med: 'Tab. Dorzolamidum 10mg', detail: '1 tablet • BID', status: 'Pending', timePeriod: 'Afternoon', iconBg: '#EFF6FF', color: '#2563EB' },
  { id: 4, medicationId: 4, time: '02:00 PM', med: 'Cap. Amoxicillin 500mg', detail: '1 capsule • BID', status: 'Pending', timePeriod: 'Afternoon', iconBg: '#FFEDD5', color: '#EA580C' },
  { id: 5, medicationId: 5, time: '06:00 PM', med: 'Tab. Vitamin D3 60k', detail: '1 tablet • Once weekly', status: 'Pending', timePeriod: 'Evening', iconBg: '#EFF6FF', color: '#2563EB' },
  { id: 6, medicationId: 6, time: '09:00 PM', med: 'Tab. Cimetidine 50mg', detail: '2 tablets • HS', status: 'Pending', timePeriod: 'Night', iconBg: '#F3E8FF', color: '#7C3AED' }
];

const INITIAL_MEDICINES = [
  { id: 1, name: 'Betaloc 100mg', type: 'Tablet', dosage: '1 tab', frequency: 'BID', timing: 'Morning/Night', duration: 'As prescribed', status: 'Active', source: 'OCR Prescription' },
  { id: 2, name: 'Paracetamol 500mg', type: 'Tablet', dosage: '1 Tablet', frequency: '3 times daily', timing: 'After Meals', duration: '5 Days', status: 'Active', source: 'Prescription Scan' },
  { id: 3, name: 'Dorzolamidum 10 mg', type: 'Tablet', dosage: '1 tab', frequency: 'BID', timing: 'Afternoon/Night', duration: 'As prescribed', status: 'Active', source: 'OCR Prescription' },
  { id: 4, name: 'Amoxicillin 500mg', type: 'Capsule', dosage: '1 Capsule', frequency: '2 times daily', timing: 'After Meals', duration: '5 Days', status: 'Active', source: 'Prescription Scan' },
  { id: 5, name: 'Vitamin D3 60k', type: 'Chewable', dosage: '1 Tablet', frequency: 'Once weekly', timing: 'Sunday Morning', duration: '4 Weeks', status: 'Active', source: 'Manual Add' },
  { id: 6, name: 'Cimetidine 50 mg', type: 'Tablet', dosage: '2 tabs', frequency: 'TID', timing: 'Three times daily', duration: 'As prescribed', status: 'Active', source: 'OCR Prescription' }
];

const INITIAL_HISTORY = [
  {
    id: 101,
    document_name: 'Prescription_Augmentin.jpg',
    doctor: 'Dr. Sachin Sonawane',
    uploaded_at: '2026-08-14T16:50:00Z',
    status: 'Active',
    imageUrl: null,
    rawText: `Rx\nTab. Augmentin 625mg 1-0-1 x 5days\nTab. Ecoflora 1-0-1 x 5days\nTab. Pan D 40mg 1-0-0 x 5days\nAdv: Hexigel gum paint 1-0-1 x 1week`,
    medicines: [
      { name: 'Augmentin 625mg', dose: '1 tab', frequency: 'BID (Morning & Night)', duration: '5 Days' },
      { name: 'Ecoflora', dose: '1 tab', frequency: 'BID (Morning & Night)', duration: '5 Days' },
      { name: 'Pan D 40mg', dose: '1 tab', frequency: 'QD (Morning Before Food)', duration: '5 Days' },
      { name: 'Hexigel gum paint', dose: 'Application', frequency: 'BID', duration: '1 Week' }
    ]
  },
  {
    id: 102,
    document_name: 'Prescription_Betaloc.jpg',
    doctor: 'Dr. Rajesh Sharma',
    uploaded_at: '2026-08-10T14:15:00Z',
    status: 'Active',
    imageUrl: null,
    rawText: `Rx\nBetaloc 100mg - 1 tab BID\nDorzolamidum 10 mg - 1 tab BID\nCimetidine 50 mg - 2 tabs TID`,
    medicines: [
      { name: 'Betaloc 100mg', dose: '1 tab', frequency: 'BID', duration: 'As prescribed' },
      { name: 'Dorzolamidum 10 mg', dose: '1 tab', frequency: 'BID', duration: 'As prescribed' },
      { name: 'Cimetidine 50 mg', dose: '2 tabs', frequency: 'TID', duration: 'As prescribed' }
    ]
  }
];

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : '';

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Sorts items chronologically without modifying their dynamic backend status
export const formatScheduleStatus = (scheduleArray) => {
  return [...scheduleArray].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
};

export const scheduleStore = {
  parseTimeToMinutes,
  formatScheduleStatus,

  // Async API integration for Date-Aware & Time-Aware Backend Medication Engine
  getTodayDosesAsync: async (dateStr = null) => {
    try {
      const endpoint = dateStr ? `/api/doses/?date=${dateStr}` : '/api/doses/today/';
      const response = await api.get(endpoint);
      const dataList = Array.isArray(response.data) ? response.data : response.data?.results || [];

      if (dataList && dataList.length > 0) {
        const mapped = dataList.map((dose) => {
          const hours = parseInt(dose.scheduled_time.split(':')[0], 10);
          const minutes = dose.scheduled_time.split(':')[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHour = hours % 12 || 12;
          const timeFormatted = `${formattedHour < 10 ? '0' : ''}${formattedHour}:${minutes} ${ampm}`;

          let period = 'Morning';
          if (hours >= 12 && hours < 16) period = 'Afternoon';
          else if (hours >= 16 && hours < 20) period = 'Evening';
          else if (hours >= 20 || hours < 5) period = 'Night';

          const medName = dose.medication_name && dose.medication_strength && !dose.medication_name.toLowerCase().includes(dose.medication_strength.toLowerCase())
            ? `${dose.medication_name} ${dose.medication_strength}`
            : dose.medication_name;

          // Pure mapping directly derived from backend real date/time evaluation
          let mappedStatus = 'Pending';
          if (dose.status === 'TAKEN') mappedStatus = 'Taken';
          else if (dose.status === 'MISSED') mappedStatus = 'Missed';
          else if (dose.status === 'DUE') mappedStatus = 'Upcoming';
          else if (dose.status === 'PENDING') mappedStatus = 'Pending';

          const cleanDosage = (dose.medication_dosage && !['-', 'None', '.', 'null', ''].includes(String(dose.medication_dosage).trim()))
            ? String(dose.medication_dosage).trim()
            : '';
          const rawTiming = (dose.medication_timing && !['-', 'None', '.', 'null', ''].includes(String(dose.medication_timing).trim()))
            ? String(dose.medication_timing).trim()
            : '';
          const cleanFreq = (dose.medication_frequency && !['-', 'None', '.', 'null', ''].includes(String(dose.medication_frequency).trim()))
            ? String(dose.medication_frequency).trim()
            : '';

          const detailParts = [];
          if (cleanDosage) detailParts.push(cleanDosage);
          if (cleanFreq) detailParts.push(cleanFreq);
          else if (rawTiming && !['after meals', 'after food', 'as prescribed'].includes(rawTiming.toLowerCase())) {
            detailParts.push(rawTiming);
          }
          const detailStr = detailParts.join(' • ') || '1 dose';

          let iconBg = '#EFF6FF';
          let iconColor = '#2563EB';
          if (dose.status === 'MISSED') {
            iconBg = '#FEE2E2';
            iconColor = '#EF4444';
          } else if (dose.status === 'TAKEN') {
            iconBg = '#EAF8F2';
            iconColor = '#16A57A';
          } else if (period === 'Morning') {
            iconBg = '#FEF3C7';
            iconColor = '#D97706';
          } else if (period === 'Afternoon') {
            iconBg = '#EFF6FF';
            iconColor = '#2563EB';
          } else if (period === 'Evening') {
            iconBg = '#FFEDD5';
            iconColor = '#EA580C';
          } else if (period === 'Night') {
            iconBg = '#F3E8FF';
            iconColor = '#7C3AED';
          }

          return {
            id: dose.id,
            medicationId: dose.medication_id || dose.medication,
            time: timeFormatted,
            med: medName,
            detail: detailStr,
            status: mappedStatus,
            timePeriod: period,
            iconBg,
            color: iconColor
          };
        });

        const formatted = formatScheduleStatus(mapped);
        scheduleStore.saveSchedule(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Backend API doses fetch notice:', err);
    }
    return scheduleStore.getSchedule();
  },

  markDoseTakenAsync: async (doseId) => {
    try {
      await api.post(`/api/doses/${doseId}/take/`);
    } catch (err) {
      console.warn('Backend mark dose taken API notice:', err);
    }
    const updated = await scheduleStore.getTodayDosesAsync();
    window.dispatchEvent(new Event('medicare_reminder_added'));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  resetDoseAsync: async (doseId) => {
    try {
      await api.post(`/api/doses/${doseId}/reset/`);
    } catch (err) {
      console.warn('Backend reset dose API notice:', err);
    }
    const updated = await scheduleStore.getTodayDosesAsync();
    window.dispatchEvent(new Event('medicare_reminder_added'));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  resetTodayScheduleAsync: async (dateStr = null) => {
    try {
      await api.post('/api/doses/reset_all/', dateStr ? { date: dateStr } : {});
    } catch (err) {
      console.warn('Backend reset all doses API notice:', err);
    }
    const updated = await scheduleStore.getTodayDosesAsync(dateStr);
    window.dispatchEvent(new Event('medicare_reminder_added'));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  deleteReminderAsync: async (item) => {
    try {
      let medId = item.medicationId;
      if (!medId) {
        const medRes = await api.get('/api/medications/');
        const meds = Array.isArray(medRes.data) ? medRes.data : medRes.data.results || [];
        const found = meds.find(m => m.name.toLowerCase() === (item.med || '').toLowerCase());
        if (found) medId = found.id;
      }

      if (medId) {
        await api.delete(`/api/medications/${medId}/`);
      }
    } catch (err) {
      console.warn('Backend delete medication notice:', err);
    }

    const updated = await scheduleStore.getTodayDosesAsync();
    window.dispatchEvent(new Event('medicare_reminder_added'));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  getSchedule: () => {
    const data = localStorage.getItem('medicare_patient_schedule');
    if (!data) {
      const formatted = formatScheduleStatus(INITIAL_SCHEDULE);
      localStorage.setItem('medicare_patient_schedule', JSON.stringify(formatted));
      return formatted;
    }
    const parsed = JSON.parse(data);
    return formatScheduleStatus(parsed);
  },

  saveSchedule: (scheduleArray) => {
    const formatted = formatScheduleStatus(scheduleArray);
    localStorage.setItem('medicare_patient_schedule', JSON.stringify(formatted));
  },

  getMedicines: () => {
    const data = localStorage.getItem('medicare_patient_medicines');
    if (!data) {
      localStorage.setItem('medicare_patient_medicines', JSON.stringify(INITIAL_MEDICINES));
      return INITIAL_MEDICINES;
    }
    return JSON.parse(data);
  },

  saveMedicines: (medsArray) => {
    localStorage.setItem('medicare_patient_medicines', JSON.stringify(medsArray));
  },

  getHistory: () => {
    const data = localStorage.getItem('medicare_patient_history');
    if (!data) {
      localStorage.setItem('medicare_patient_history', JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    return JSON.parse(data);
  },

  saveHistory: (historyArray) => {
    localStorage.setItem('medicare_patient_history', JSON.stringify(historyArray));
  },

  addHistoryRecord: (doc, extractedMeds, rawText) => {
    const history = scheduleStore.getHistory();
    const docName = doc?.document_name || doc?.file?.name || `Prescription_${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}.jpg`;
    
    let img = null;
    if (doc?.imageUrl) img = doc.imageUrl;
    else if (typeof doc?.file === 'string') img = doc.file;

    const newRecord = {
      id: Date.now(),
      document_name: docName,
      doctor: 'Dr. Prescribing Physician',
      uploaded_at: new Date().toISOString(),
      imageUrl: img,
      status: 'Active',
      rawText: rawText || 'Rx\nExtracted prescription text',
      medicines: extractedMeds.map((m) => ({
        name: m.name,
        dose: m.dose || '1 Dose',
        frequency: m.frequency || 'BID',
        duration: m.duration || 'As prescribed'
      }))
    };

    const updatedHistory = [newRecord, ...history];
    scheduleStore.saveHistory(updatedHistory);
    return newRecord;
  },

  setScheduleForNewScan: (ocrMeds, replaceExisting = true) => {
    const currentMeds = scheduleStore.getMedicines();
    const currentSched = scheduleStore.getSchedule();

    const newMeds = [];
    const newSchedItems = [];

    const getTimesForMed = (freqStr, timingStr) => {
      const combined = `${freqStr || ''} ${timingStr || ''}`.toLowerCase();

      if (combined.includes('1-1-1-1') || combined.includes('qid') || combined.includes('four times')) {
        return [
          { time: '08:00 AM', period: 'Morning' },
          { time: '12:00 PM', period: 'Afternoon' },
          { time: '04:00 PM', period: 'Evening' },
          { time: '08:00 PM', period: 'Night' }
        ];
      }
      if (combined.includes('1-1-1') || combined.includes('tid') || combined.includes('tds') || combined.includes('three times')) {
        return [
          { time: '08:00 AM', period: 'Morning' },
          { time: '02:00 PM', period: 'Afternoon' },
          { time: '08:00 PM', period: 'Night' }
        ];
      }
      if (combined.includes('1-0-1') || combined.includes('bid') || combined.includes('bd') || combined.includes('twice')) {
        return [
          { time: '09:00 AM', period: 'Morning' },
          { time: '09:00 PM', period: 'Night' }
        ];
      }
      if (combined.includes('0-0-1') || combined.includes('hs') || combined.includes('night') || combined.includes('bedtime')) {
        return [{ time: '09:00 PM', period: 'Night' }];
      }
      if (combined.includes('0-1-0') || combined.includes('afternoon') || combined.includes('lunch') || combined.includes('midday')) {
        return [{ time: '01:00 PM', period: 'Afternoon' }];
      }
      if (combined.includes('evening') || combined.includes('snacks')) {
        return [{ time: '06:00 PM', period: 'Evening' }];
      }
      // Default: Once daily morning
      return [{ time: '09:00 AM', period: 'Morning' }];
    };

    ocrMeds.forEach((item, index) => {
      const id = Date.now() + index;
      const medName = item.name || `Medicine ${index + 1}`;
      const form = item.form || item.type || (medName.toLowerCase().includes('cap') ? 'Capsule' : 'Tablet');
      const dose = item.dose || '1 Tablet';
      const frequency = item.frequency || 'Once daily';
      const timing = item.timing || 'After meals';
      const duration = item.duration || '5 Days';

      newMeds.push({
        id: id,
        name: medName,
        type: form,
        dosage: dose,
        frequency: frequency,
        timing: timing,
        duration: duration,
        status: 'Active',
        source: 'OCR Prescription'
      });

      const slots = getTimesForMed(frequency, timing);
      slots.forEach((slot, sIdx) => {
        newSchedItems.push({
          id: id + (sIdx + 1) * 1000,
          time: slot.time,
          med: medName,
          detail: `${dose} • ${timing}`,
          status: 'Pending',
          timePeriod: slot.period,
          iconBg: (index + sIdx) % 2 === 0 ? '#EAF8F2' : '#EFF6FF',
          color: (index + sIdx) % 2 === 0 ? '#16A57A' : '#2563EB'
        });
      });
    });

    const updatedMeds = [...newMeds, ...currentMeds.filter(m => !newMeds.some(nm => nm.name.toLowerCase() === m.name.toLowerCase()))];
    const updatedSched = replaceExisting ? newSchedItems : [...newSchedItems, ...currentSched];

    scheduleStore.saveMedicines(updatedMeds);
    scheduleStore.saveSchedule(updatedSched);
  },

  recreateScheduleFromHistoryItem: (historyItem) => {
    if (!historyItem || !historyItem.medicines) return;
    scheduleStore.setScheduleForNewScan(historyItem.medicines, true);
  },

  addCustomReminder: async (medName, time, dosage, timing) => {
    const currentMeds = scheduleStore.getMedicines();
    const currentSched = scheduleStore.getSchedule();
    const id = Date.now();

    let createdMedId = null;

    try {
      const res = await api.post('/api/medications/', {
        name: medName,
        dosage: dosage || '1 Tablet',
        frequency: time || '08:00 AM',
        timing: timing ? `${timing} (at ${time})` : `At ${time}`,
        duration_days: 30,
        is_active: true
      });
      if (res.data) createdMedId = res.data.id;
    } catch (err) {
      console.warn('Backend custom reminder sync notice:', err);
    }

    const newMedObj = {
      id: createdMedId || id,
      name: medName,
      type: 'Tablet',
      dosage: dosage || '1 Tablet',
      frequency: 'Daily',
      timing: timing || 'After Food',
      duration: 'Ongoing',
      status: 'Active',
      source: 'Custom Reminder'
    };

    const newSchedItem = {
      id: id + 1,
      medicationId: createdMedId,
      time: time || '10:00 AM',
      med: medName,
      detail: `${dosage || '1 Tablet'} • ${timing || 'After Food'}`,
      status: 'Pending',
      timePeriod: 'Day',
      iconBg: '#FEF3C7',
      color: '#D97706'
    };

    scheduleStore.saveMedicines([newMedObj, ...currentMeds]);
    scheduleStore.saveSchedule([newSchedItem, ...currentSched]);

    window.dispatchEvent(new Event('medicare_reminder_added'));
    window.dispatchEvent(new Event('storage'));
  },

  markDoseTaken: (doseId) => {
    const currentSched = scheduleStore.getSchedule();
    const updated = currentSched.map(item => {
      if (item.id === doseId) {
        return { ...item, status: 'Taken' };
      }
      return item;
    });

    const formatted = formatScheduleStatus(updated);
    localStorage.setItem('medicare_patient_schedule', JSON.stringify(formatted));
    return formatted;
  },

  resetTodaySchedule: () => {
    const currentSched = scheduleStore.getSchedule();
    const resetList = currentSched.map((item) => ({
      ...item,
      status: 'Pending'
    }));

    const formatted = formatScheduleStatus(resetList);
    localStorage.setItem('medicare_patient_schedule', JSON.stringify(formatted));
    return formatted;
  },

  clearAllMedicinesAndRemindersAsync: async () => {
    try {
      await api.post('/api/medications/clear_all/');
    } catch (err) {
      console.warn('Backend clear all medicines notice:', err);
    }

    localStorage.setItem('medicare_patient_medicines', JSON.stringify([]));
    localStorage.setItem('medicare_patient_schedule', JSON.stringify([]));

    window.dispatchEvent(new Event('medicare_reminder_added'));
    window.dispatchEvent(new Event('storage'));
    return [];
  }
};
