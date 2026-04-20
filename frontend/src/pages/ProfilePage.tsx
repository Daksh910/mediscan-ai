import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/GlassCard';
import { User, Lock, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

const DEPARTMENTS = ['Endocrinology','Cardiology','General Medicine','Internal Medicine','Neurology','Oncology','Pediatrics','Psychiatry','Surgery','Other'];
const G = 'hsl(158 42% 22%)';

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(210 10% 48%)', marginBottom: 6 }}>{children}</div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'info' | 'password'>('info');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', department: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { navigate('/login'); return; }
    api.get('/api/auth/profile/').then(({ data }) => {
      setProfile(data);
      setForm({ first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '', phone: data.phone || '', department: data.department || '' });
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, [navigate]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/api/auth/profile/', form);
      localStorage.setItem('user', JSON.stringify(data));
      setProfile(data);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.email?.[0] || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.new_password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await api.post('/api/auth/password/change/', pwForm);
      toast.success('Password changed! Please log in again.');
      localStorage.clear();
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  if (loading) return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
      </div>
    </AppLayout>
  );

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, margin: '0 0 4px' }}>My Profile</h1>
          <p style={{ fontSize: 13, color: 'hsl(210 10% 52%)' }}>Manage your clinical account</p>
        </div>

        {/* Profile header card */}
        <GlassCard className="p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: 'hsl(158 42% 22% / 0.1)', border: '2px solid hsl(158 42% 22% / 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: G,
            }}>{initials}</div>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
                {profile?.role === 'doctor' ? 'Dr. ' : ''}{profile?.first_name} {profile?.last_name}
              </h2>
              <p style={{ fontSize: 13, color: 'hsl(210 10% 50%)', marginBottom: 8 }}>{profile?.email}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11.5, padding: '3px 12px', borderRadius: 99, background: 'hsl(158 42% 22% / 0.08)', border: '1px solid hsl(158 42% 22% / 0.2)', color: G, textTransform: 'capitalize', fontWeight: 500 }}>{profile?.role}</span>
                {profile?.department && <span style={{ fontSize: 11.5, padding: '3px 12px', borderRadius: 99, background: 'hsl(34 18% 94%)', border: '1px solid hsl(34 18% 88%)', color: 'hsl(210 10% 48%)' }}>{profile.department}</span>}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'hsl(34 18% 94%)', borderRadius: 12, width: 'fit-content', border: '1px solid hsl(34 18% 88%)' }}>
          {[{ k: 'info', l: 'Profile Info', icon: User }, { k: 'password', l: 'Change Password', icon: Lock }].map(({ k, l, icon: Icon }) => (
            <button key={k} onClick={() => setActiveSection(k as any)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none', transition: 'all 0.15s',
              background: activeSection === k ? 'white' : 'transparent',
              color: activeSection === k ? G : 'hsl(210 10% 48%)',
              boxShadow: activeSection === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
              <Icon size={14} />{l}
            </button>
          ))}
        </div>

        {activeSection === 'info' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color={G} /> Personal Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <Label>First Name</Label>
                    <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="field" placeholder="First name" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="field" placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="field" placeholder="Email address" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="field" placeholder="Contact number" />
                </div>
                {profile?.role !== 'admin' && (
                  <div>
                    <Label>Department</Label>
                    <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="field" style={{ cursor: 'pointer' }}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: 12, marginTop: 4 }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeSection === 'password' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} color={G} /> Change Password
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { k: 'old_password',     l: 'Current Password' },
                  { k: 'new_password',     l: 'New Password' },
                  { k: 'confirm_password', l: 'Confirm New Password' },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <Label>{l}</Label>
                    <input type="password" value={(pwForm as any)[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} className="field" placeholder="••••••••" />
                  </div>
                ))}
                <button onClick={changePassword} disabled={pwSaving} className="btn-primary" style={{ width: '100%', padding: 12, marginTop: 4 }}>
                  {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
