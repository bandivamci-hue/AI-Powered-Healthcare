import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import MetricCard from '../components/ui/MetricCard';
import { scheduleStore } from '../services/scheduleStore';
import { useToast } from '../context/ToastContext';
import { 
  Pill, 
  Calendar, 
  Clock, 
  Activity, 
  Camera, 
  Plus, 
  Bell, 
  ChevronRight, 
  Sun, 
  Moon,
  RotateCcw
} from 'lucide-react';

const DashboardPage = () => {
  const { addToast } = useToast();
  const [schedule, setSchedule] = useState([]);
  const [medicines, setMedicines] = useState([]);

  // Fetch dynamic schedule & medicines from backend scheduleStore
  const loadData = async () => {
    const todayList = await scheduleStore.getTodayDosesAsync();
    setSchedule(todayList);
    setMedicines(scheduleStore.getMedicines());
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('medicare_reminder_added', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('medicare_reminder_added', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute live dynamic metrics
  const totalDoses = schedule.length;
  const takenCount = schedule.filter(item => item.status === 'Taken').length;
  const missedCount = schedule.filter(item => item.status === 'Missed').length;
  const upcomingCount = schedule.filter(item => item.status === 'Upcoming' || item.status === 'Pending').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;

  // Next upcoming dose
  const nextReminder = schedule.find(item => item.status === 'Upcoming') || schedule.find(item => item.status === 'Pending');

  // Handle Mark as Taken directly from Dashboard (persists to backend database)
  const handleMarkAsTaken = async () => {
    if (!nextReminder) return;
    const updated = await scheduleStore.markDoseTakenAsync(nextReminder.id);
    setSchedule(updated);
    addToast(`Marked ${nextReminder.med} as taken!`, 'success');
  };

  // Reset doses in backend database and synchronize
  const handleResetSchedule = async () => {
    const resetList = await scheduleStore.resetTodayScheduleAsync();
    setSchedule(resetList);
    addToast('Reset today doses back to pending stage!', 'info');
  };

  const getBadgeClass = (status) => {
    if (status === 'Taken') return 'badge-taken';
    if (status === 'Missed') return 'badge-missed';
    if (status === 'Upcoming') return 'badge-upcoming';
    return 'badge-pending';
  };

  return (
    <AppLayout>
      {/* 4 TOP METRIC CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <MetricCard
          title="Today's Total Doses"
          value={totalDoses}
          icon={Calendar}
          iconColor="var(--primary-green)"
          iconBg="var(--light-mint)"
          trend={takenCount > 0 ? `${takenCount} completed today` : 'Daily Schedule'}
          trendColor="var(--primary-green)"
        />

        <MetricCard
          title="Doses Taken"
          value={takenCount}
          icon={Pill}
          iconColor="var(--primary-green)"
          iconBg="var(--light-mint)"
          trend={`${takenCount} of ${totalDoses} doses`}
          trendColor="var(--primary-green)"
        />

        <MetricCard
          title="Upcoming / Due"
          value={upcomingCount}
          icon={Clock}
          iconColor="var(--yellow-text)"
          iconBg="var(--yellow-soft-bg)"
          trend={missedCount > 0 ? `${missedCount} missed` : 'Next on schedule'}
          trendColor={missedCount > 0 ? '#EF4444' : 'var(--yellow-text)'}
        />

        <MetricCard
          title="Adherence Rate"
          value={`${adherenceRate}%`}
          icon={Activity}
          iconColor="var(--purple-text)"
          iconBg="var(--purple-soft-bg)"
          trend={adherenceRate >= 80 ? 'Excellent Adherence' : 'Action Needed'}
          trendColor={adherenceRate >= 80 ? 'var(--primary-green)' : 'var(--yellow-text)'}
        />
      </div>

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: TODAY'S SCHEDULE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="med-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div className="flex items-center gap-2">
                <Calendar size={20} color="var(--primary-green)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Today's Schedule</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetSchedule}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--text-muted)' }}
                  title="Reset completed doses back to upcoming"
                >
                  <RotateCcw size={14} /> Reset Doses
                </button>
                <Link to="/reminders" style={{ fontSize: '13px', color: 'var(--primary-green)', fontWeight: 600 }}>
                  View All
                </Link>
              </div>
            </div>

            {/* Full-Width Timeline Schedule List */}
            <div className="timeline">
              {schedule.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No medication doses scheduled for today.
                </div>
              ) : (
                schedule.map((item, index) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-time">
                      <span style={{ color: item.status === 'Taken' ? 'var(--dark-green)' : item.status === 'Missed' ? '#EF4444' : item.status === 'Upcoming' ? 'var(--yellow-text)' : 'var(--text-primary)' }}>
                        {item.time}
                      </span>
                      <span className="timeline-subtext flex items-center gap-1">
                        {item.timePeriod === 'Night' ? (
                          <Moon size={12} color="#7C3AED" />
                        ) : item.timePeriod === 'Evening' ? (
                          <Sun size={12} color="#EA580C" />
                        ) : item.timePeriod === 'Afternoon' ? (
                          <Sun size={12} color="#2563EB" />
                        ) : (
                          <Sun size={12} color="#D97706" />
                        )}
                        <span style={{
                          color: item.timePeriod === 'Night' ? '#7C3AED' : item.timePeriod === 'Evening' ? '#EA580C' : item.timePeriod === 'Afternoon' ? '#2563EB' : 'var(--text-muted)'
                        }}>
                          {item.timePeriod}
                        </span>
                      </span>
                    </div>

                    <div className="timeline-dot-wrapper">
                      <div className="timeline-dot" style={{ backgroundColor: item.status === 'Taken' ? 'var(--primary-green)' : item.status === 'Missed' ? '#EF4444' : item.status === 'Upcoming' ? 'var(--yellow-text)' : 'var(--text-muted)' }}></div>
                      {index < schedule.length - 1 && <div className="timeline-line"></div>}
                    </div>

                    <div className="timeline-card">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: item.status === 'Taken' ? 'var(--light-mint)' : item.status === 'Missed' ? '#FEE2E2' : item.status === 'Upcoming' ? 'var(--yellow-soft-bg)' : 'var(--bg-card)',
                          color: item.status === 'Taken' ? 'var(--primary-green)' : item.status === 'Missed' ? '#EF4444' : item.status === 'Upcoming' ? 'var(--yellow-text)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Pill size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{item.med}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{item.detail}</p>
                        </div>
                      </div>

                      <span className={`badge-status ${getBadgeClass(item.status)}`}>
                        {item.status === 'Taken' ? '✓ Taken' : item.status === 'Missed' ? '⚠ Missed' : item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NEXT REMINDER (TOP) & QUICK ACTIONS (BELOW) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. DYNAMIC NEXT REMINDER CARD (TOP PRIORITY) */}
          <div className="med-card" style={{ border: '1.5px solid var(--primary-green)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="flex items-center gap-2">
                <Clock size={18} color="var(--primary-green)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Next Reminder</h3>
              </div>
              <Link to="/reminders" style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {nextReminder ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '30px', fontWeight: 900, color: 'var(--primary-green)', letterSpacing: '-0.5px' }}>{nextReminder.time}</span>
                    <span className="badge-status badge-upcoming" style={{ fontSize: '11px' }}>{nextReminder.timePeriod}</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)', margin: '6px 0 0' }}>{nextReminder.med}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{nextReminder.detail}</p>
                </div>

                <button
                  onClick={handleMarkAsTaken}
                  className="btn btn-full"
                  style={{ backgroundColor: 'var(--primary-green)', color: 'white', fontWeight: 700, padding: '10px 16px', borderRadius: '10px' }}
                >
                  ✓ Mark as Taken
                </button>
              </>
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--primary-green)', fontWeight: 600 }}>
                🎉 All scheduled doses for today completed!
              </div>
            )}
          </div>

          {/* 2. QUICK ACTIONS CARD (BELOW) */}
          <div className="med-card">
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/scan-prescription" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--light-mint)',
                transition: 'transform 0.2s',
                border: '1px solid var(--mint-border)',
                textDecoration: 'none'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Scan Prescription</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Upload or capture doctor prescription</p>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--primary-green)" />
              </Link>

              <Link to="/reminders" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--purple-soft-bg)',
                transition: 'transform 0.2s',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                textDecoration: 'none'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--purple-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Medication Reminders</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Manage daily dosage alerts</p>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--purple-text)" />
              </Link>

              <Link to="/health-center" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--blue-soft-bg)',
                transition: 'transform 0.2s',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                textDecoration: 'none'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--blue-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Health Center & SOS</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Nearby hospitals & clinical guides</p>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--blue-text)" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
