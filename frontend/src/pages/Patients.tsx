import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/GlassCard';
import { RiskBadge } from '@/components/RiskBadge';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Search, Plus, X, Eye, FilePlus, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

const G = 'hsl(158 42% 22%)';

const demoPatients = [
  { id: 1, first_name: 'Sarah',   last_name: 'Johnson', date_of_birth: '1985-03-15', gender: 'F', latest_risk: 'High',     risk_score: 72.4, assessments_count: 5 },
  { id: 2, first_name: 'Michael', last_name: 'Chen',    date_of_birth: '1990-07-22', gender: 'M', latest_risk: 'Low',      risk_score: 12.1, assessments_count: 3 },
  { id: 3, first_name: 'Emily',   last_name: 'Davis',   date_of_birth: '1978-11-08', gender: 'F', latest_risk: 'Medium',   risk_score: 45.8, assessments_count: 8 },
  { id: 4, first_name: 'James',   last_name: 'Wilson',  date_of_birth: '1965-01-30', gender: 'M', latest_risk: 'Critical', risk_score: 89.2, assessments_count: 12 },
  { id: 5, first_name: 'Ana',     last_name: 'Martinez',date_of_birth: '1992-06-12', gender: 'F', latest_risk: 'Low',      risk_score: 8.5,  assessments_count: 2 },
  { id: 6, first_name: 'Robert',  last_name: 'Kim',     date_of_birth: '1970-09-25', gender: 'M', latest_risk: 'High',     risk_score: 67.3, assessments_count: 7 },
];

const riskBarColor: Record<string, string> = {
  Low: '#2d9b6b', Medium: '#d97706', High: '#e05c3a', Critical: '#c0293a',
};
const avatarBg: Record<string, string> = {
  Low: 'hsl(158 42% 22% / 0.1)', Medium: 'hsl(38 85% 52% / 0.1)',
  High: 'hsl(14 80% 52% / 0.1)', Critical: 'hsl(350 68% 46% / 0.1)',
};

const getAge = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(210 10% 48%)', marginBottom: 6 }}>{children}</div>
);

const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', date_of_birth: '', gender: 'M', blood_group: '', contact: '', email: '', address: '' });
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (genderFilter) params.set('gender', genderFilter);
      const { data } = await api.get(`/api/patients/?${params}`);
      setPatients(Array.isArray(data) ? data : data.results || []);
    } catch {
      setPatients(demoPatients.filter(p =>
        (!search || `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
        (!genderFilter || p.gender === genderFilter)
      ));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, [search, genderFilter]);

  const handleAddPatient = async () => {
    try {
      await api.post('/api/patients/', form);
      toast.success('Patient record created.');
      setDrawerOpen(false);
      setForm({ first_name: '', last_name: '', date_of_birth: '', gender: 'M', blood_group: '', contact: '', email: '', address: '' });
      fetchPatients();
    } catch { toast.error('Failed to create patient record.'); }
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, margin: 0 }}>Patient Registry</h1>
            <p style={{ fontSize: 13, color: 'hsl(210 10% 52%)', marginTop: 4 }}>{patients.length} patients total</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(210 8% 60%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search patients…" className="field"
                style={{ paddingLeft: 32, width: 200, fontSize: 13 }} />
            </div>
            {/* Gender filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ v: '', l: 'All' }, { v: 'M', l: 'Male' }, { v: 'F', l: 'Female' }].map(({ v, l }) => (
                <button key={v} onClick={() => setGenderFilter(v)} style={{
                  padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: '1px solid', transition: 'all 0.15s',
                  borderColor: genderFilter === v ? G : 'hsl(34 18% 86%)',
                  background: genderFilter === v ? 'hsl(158 42% 22% / 0.08)' : 'transparent',
                  color: genderFilter === v ? G : 'hsl(210 10% 48%)',
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <UserCircle2 size={40} color="hsl(210 8% 75%)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, color: 'hsl(210 10% 52%)' }}>No patients found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {patients.map((p, i) => {
              const initials = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase();
              const rl = p.latest_risk || 'Low';
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard hover className="p-5">
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: avatarBg[rl] || 'hsl(158 42% 22% / 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: riskBarColor[rl] || G,
                        fontFamily: 'Playfair Display, serif',
                      }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.first_name} {p.last_name}
                        </h3>
                        <p style={{ fontSize: 12, color: 'hsl(210 10% 54%)', marginTop: 3 }}>
                          {p.date_of_birth ? `${getAge(p.date_of_birth)} yrs` : '—'} · {p.gender === 'M' ? 'Male' : 'Female'}
                        </p>
                        <div style={{ marginTop: 10 }}><RiskBadge level={rl} /></div>
                        {p.risk_score !== undefined && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                              <span style={{ color: 'hsl(210 8% 58%)' }}>Risk Score</span>
                              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'hsl(210 15% 18%)' }}>{p.risk_score}%</span>
                            </div>
                            <div style={{ height: 4, background: 'hsl(34 18% 90%)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${p.risk_score}%`, background: riskBarColor[rl] || G, borderRadius: 99, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        )}
                        <p style={{ fontSize: 11, color: 'hsl(210 8% 62%)', marginTop: 8 }}>{p.assessments_count || 0} assessments</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button onClick={() => navigate(`/patients/${p.id}`)} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                            background: 'hsl(158 42% 22% / 0.07)', border: '1px solid hsl(158 42% 22% / 0.2)',
                            color: G, cursor: 'pointer', transition: 'all 0.12s',
                          }}>
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => navigate(`/assessment?patient=${p.id}`)} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                            background: 'hsl(38 85% 52% / 0.07)', border: '1px solid hsl(38 85% 52% / 0.22)',
                            color: 'hsl(38 85% 45%)', cursor: 'pointer', transition: 'all 0.12s',
                          }}>
                            <FilePlus size={12} /> Assess
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <button onClick={() => setDrawerOpen(true)} style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 50, height: 50, borderRadius: '50%',
          background: G, color: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px hsl(158 42% 22% / 0.35)', zIndex: 40,
          transition: 'all 0.15s',
        }}>
          <Plus size={22} />
        </button>

        {/* Drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.18)', backdropFilter: 'blur(2px)' }}
                onClick={() => setDrawerOpen(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'white', borderLeft: '1px solid hsl(34 18% 88%)', overflowY: 'auto', boxShadow: '-4px 0 32px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid hsl(34 18% 90%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 600, margin: 0 }}>Add Patient</h3>
                  <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'hsl(210 8% 58%)' }}>
                    <X size={18} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {['first_name', 'last_name'].map(f => (
                      <div key={f}>
                        <Label>{f.replace('_', ' ')}</Label>
                        <input type="text" value={(form as any)[f]} onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))} className="field" placeholder={f === 'first_name' ? 'First' : 'Last'} />
                      </div>
                    ))}
                  </div>
                  {[
                    { k: 'date_of_birth', t: 'date',  l: 'Date of Birth' },
                    { k: 'blood_group',   t: 'text',  l: 'Blood Group' },
                    { k: 'contact',       t: 'text',  l: 'Contact' },
                    { k: 'email',         t: 'email', l: 'Email' },
                    { k: 'address',       t: 'text',  l: 'Address' },
                  ].map(({ k, t, l }) => (
                    <div key={k}>
                      <Label>{l}</Label>
                      <input type={t} value={(form as any)[k]} onChange={e => setForm(x => ({ ...x, [k]: e.target.value }))} className="field" />
                    </div>
                  ))}
                  <div>
                    <Label>Gender</Label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['M', 'F'].map(g => (
                        <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))} style={{
                          flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          border: '1px solid', transition: 'all 0.15s',
                          borderColor: form.gender === g ? G : 'hsl(34 18% 86%)',
                          background: form.gender === g ? 'hsl(158 42% 22% / 0.08)' : 'transparent',
                          color: form.gender === g ? G : 'hsl(210 10% 48%)',
                        }}>{g === 'M' ? 'Male' : 'Female'}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleAddPatient} className="btn-primary" style={{ width: '100%', padding: 12, marginTop: 4 }}>
                    Create Patient Record
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Patients;
