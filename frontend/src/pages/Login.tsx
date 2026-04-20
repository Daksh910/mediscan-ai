import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, LogIn, Shield, AlertCircle, Activity, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const DEPARTMENTS = [
  'Endocrinology','Cardiology','General Medicine','Internal Medicine',
  'Neurology','Oncology','Pediatrics','Psychiatry','Surgery','Other',
];

type Mode = 'choose' | 'login' | 'register' | 'forgot';

const G = 'hsl(158 42% 22%)';

// 3D rotating cross / medical symbol
const MedSymbol = () => (
  <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 28 }}>
    <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="lgBg" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="hsl(158 42% 32%)" />
          <stop offset="100%" stopColor="hsl(158 42% 16%)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill="url(#lgBg)" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Cross */}
      <rect x="46" y="28" width="28" height="64" rx="7" fill="rgba(255,255,255,0.22)" />
      <rect x="28" y="46" width="64" height="28" rx="7" fill="rgba(255,255,255,0.22)" />
      <rect x="48" y="30" width="24" height="60" rx="6" fill="rgba(255,255,255,0.85)" />
      <rect x="30" y="48" width="60" height="24" rx="6" fill="rgba(255,255,255,0.85)" />
      {/* Shine */}
      <ellipse cx="48" cy="44" rx="12" ry="8" fill="rgba(255,255,255,0.12)" />
    </svg>
    {/* Pulse rings */}
    <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '1.5px solid hsl(158 42% 22% / 0.2)', animation: 'fadeIn 1s 0.5s ease both', opacity: 0 }} />
    <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1px solid hsl(158 42% 22% / 0.1)', animation: 'fadeIn 1s 0.8s ease both', opacity: 0 }} />
  </div>
);

const Login = () => {
  const [mode, setMode] = useState<Mode>('choose');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regData, setRegData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', role: 'doctor',
    phone: '', department: 'Endocrinology', admin_code: '',
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim()) { setLoginError('Username is required.'); return; }
    if (!password) { setLoginError('Password is required.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login/', { username, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh || '');
      localStorage.setItem('user', JSON.stringify(data.user || { username }));
      toast.success('Welcome back!');
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 400) setLoginError('Incorrect username or password.');
      else if (status === 403) setLoginError('Account deactivated. Contact admin.');
      else setLoginError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegErrors({});
    const errors: Record<string, string> = {};
    if (!regData.first_name.trim()) errors.first_name = 'Required';
    if (!regData.last_name.trim()) errors.last_name = 'Required';
    if (!regData.username.trim()) errors.username = 'Required';
    if (!regData.email.trim()) errors.email = 'Required';
    if (regData.password.length < 8) errors.password = 'Min 8 characters';
    if (regData.password !== regData.password2) errors.password2 = 'Passwords do not match';
    if (regData.role === 'admin' && !regData.admin_code) errors.admin_code = 'Admin code required';
    if (Object.keys(errors).length > 0) { setRegErrors(errors); return; }
    setLoading(true);
    try {
      const payload = { ...regData };
      if (regData.role === 'admin') delete (payload as any).department;
      await api.post('/api/auth/register/', payload);
      toast.success('Account created! Please sign in.');
      setMode('login');
      setUsername(regData.username);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const mapped: Record<string, string> = {};
        Object.entries(data).forEach(([key, val]) => { mapped[key] = Array.isArray(val) ? val[0] as string : String(val); });
        setRegErrors(mapped);
        const first = Object.values(mapped)[0];
        if (first) toast.error(first);
      } else toast.error('Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/password/reset/', { email: forgotEmail });
      setForgotSent(true);
    } catch { toast.error('Something went wrong.'); }
    finally { setLoading(false); }
  };

  const reg = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegData(d => ({ ...d, [key]: e.target.value }));
    setRegErrors(prev => ({ ...prev, [key]: '' }));
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 11.5, fontWeight: 500, color: 'hsl(210 10% 42%)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>{children}</div>
  );

  const FieldError = ({ field }: { field: string }) =>
    regErrors[field] ? <p style={{ color: 'hsl(14 80% 52%)', fontSize: 11.5, marginTop: 4 }}>{regErrors[field]}</p> : null;

  const cardStyle: React.CSSProperties = {
    background: 'white', border: '1px solid hsl(34 18% 88%)',
    borderRadius: 16, padding: '36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
    width: '100%', maxWidth: 440,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'hsl(34 25% 97%)' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'none', background: G, position: 'relative', overflow: 'hidden', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        className="lg:flex">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        {/* Dot grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <defs>
            <pattern id="ddots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.6)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ddots)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 600, color: 'white' }}>MediScan AI</span>
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 600, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
            Clinical Intelligence<br />for Modern Medicine
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
            AI-powered diabetes risk assessment trained on 70,692 CDC health records with 83% accuracy.
          </p>
          <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, margin: '44px auto 0' }}>
            {['83% Model Accuracy', '88% Recall Rate', 'SHAP Explainability', 'Role-Based Access'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', overflowY: 'auto' }}
        className="lg:w-[520px]">
        <div style={cardStyle}>
          {/* Header shown on mobile only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: 16, color: 'hsl(210 15% 12%)' }}>MediScan AI</div>
              <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'hsl(210 8% 58%)', letterSpacing: '0.05em' }}>CLINICAL INTELLIGENCE PLATFORM</div>
            </div>
          </div>

          {/* ── CHOOSE ── */}
          {mode === 'choose' && (
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Welcome back</h2>
              <p style={{ fontSize: 14, color: 'hsl(210 10% 48%)', marginBottom: 28 }}>Choose how to continue</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: UserPlus, label: 'Register', sub: 'Create a new clinical account', accent: G,                          action: () => setMode('register') },
                  { icon: LogIn,    label: 'Sign In',  sub: 'Access your clinical dashboard', accent: 'hsl(38 85% 52%)',          action: () => setMode('login') },
                  { icon: Shield,   label: 'Admin',    sub: 'Hospital administration panel',  accent: 'hsl(14 80% 52%)',          action: () => setMode('login') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'hsl(34 25% 97%)', border: '1px solid hsl(34 18% 88%)',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = item.accent + '55'; (e.currentTarget as HTMLElement).style.background = 'white'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'hsl(34 18% 88%)'; (e.currentTarget as HTMLElement).style.background = 'hsl(34 25% 97%)'; }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: item.accent + '15', border: `1px solid ${item.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={17} color={item.accent} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210 15% 12%)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'hsl(210 8% 58%)', marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <button type="button" onClick={() => { setMode('choose'); setLoginError(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'hsl(210 10% 48%)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Sign in</h2>
              <p style={{ fontSize: 14, color: 'hsl(210 10% 48%)', marginBottom: 28 }}>Access your clinical dashboard</p>
              <div style={{ marginBottom: 16 }}>
                <Label>Username</Label>
                <input type="text" value={username} onChange={e => { setUsername(e.target.value); setLoginError(''); }}
                  className="field" placeholder="Enter your username" required autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <Label>Password</Label>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  className="field" placeholder="Enter your password" required />
              </div>
              {loginError && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'hsl(14 80% 52% / 0.08)', border: '1px solid hsl(14 80% 52% / 0.2)', marginBottom: 16 }}>
                  <AlertCircle size={15} color="hsl(14 80% 52%)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: 'hsl(14 80% 52%)' }}>{loginError}</span>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: 12 }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <button type="button" onClick={() => { setMode('forgot'); setLoginError(''); }}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'hsl(210 8% 58%)', textAlign: 'center', padding: '6px 0' }}
                onMouseEnter={e => (e.currentTarget.style.color = G)} onMouseLeave={e => (e.currentTarget.style.color = 'hsl(210 8% 58%)')}>
                Forgot password?
              </button>
            </form>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <button type="button" onClick={() => { setMode('choose'); setRegErrors({}); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'hsl(210 10% 48%)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Create account</h2>
              <p style={{ fontSize: 14, color: 'hsl(210 10% 48%)', marginBottom: 24 }}>Join as a clinician or admin</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {(['first_name', 'last_name'] as const).map(k => (
                  <div key={k}>
                    <Label>{k === 'first_name' ? 'First Name' : 'Last Name'}</Label>
                    <input type="text" value={regData[k]} onChange={reg(k)}
                      className="field" style={{ borderColor: regErrors[k] ? 'hsl(14 80% 52%)' : undefined }}
                      placeholder={k === 'first_name' ? 'First' : 'Last'} />
                    <FieldError field={k} />
                  </div>
                ))}
              </div>
              {[
                { key: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username' },
                { key: 'email',    label: 'Email',    type: 'email', placeholder: 'doctor@hospital.com' },
                { key: 'phone',    label: 'Phone',    type: 'text',  placeholder: 'Contact number' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <Label>{f.label}</Label>
                  <input type={f.type} value={(regData as any)[f.key]} onChange={reg(f.key)}
                    className="field" style={{ borderColor: regErrors[f.key] ? 'hsl(14 80% 52%)' : undefined }}
                    placeholder={f.placeholder} />
                  <FieldError field={f.key} />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <Label>Role</Label>
                  <select value={regData.role} onChange={reg('role')} className="field" style={{ cursor: 'pointer' }}>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ opacity: regData.role === 'admin' ? 0.4 : 1 }}>
                  <Label>Department</Label>
                  <select value={regData.department} onChange={reg('department')} className="field" disabled={regData.role === 'admin'} style={{ cursor: regData.role === 'admin' ? 'not-allowed' : 'pointer' }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {regData.role === 'admin' && (
                <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'hsl(14 80% 52% / 0.05)', border: '1px solid hsl(14 80% 52% / 0.18)' }}>
                  <Label><Shield size={11} style={{ display: 'inline', marginRight: 4 }} />Admin Access Code</Label>
                  <input type="password" value={regData.admin_code} onChange={reg('admin_code')}
                    className="field" placeholder="Enter admin code"
                    style={{ background: 'transparent', borderColor: regErrors.admin_code ? 'hsl(14 80% 52%)' : 'hsl(14 80% 52% / 0.3)' }} />
                  <FieldError field="admin_code" />
                  <p style={{ fontSize: 11, color: 'hsl(210 8% 62%)', marginTop: 6 }}>Contact hospital IT administration for access code</p>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <Label>Password</Label>
                <input type="password" value={regData.password} onChange={reg('password')}
                  className="field" style={{ borderColor: regErrors.password ? 'hsl(14 80% 52%)' : undefined }}
                  placeholder="Min 8 characters" />
                <FieldError field="password" />
              </div>
              <div style={{ marginBottom: 22 }}>
                <Label>Confirm Password</Label>
                <input type="password" value={regData.password2} onChange={reg('password2')}
                  className="field" style={{ borderColor: regErrors.password2 ? 'hsl(14 80% 52%)' : undefined }}
                  placeholder="Repeat password" />
                <FieldError field="password2" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── FORGOT ── */}
          {mode === 'forgot' && (
            <div>
              <button type="button" onClick={() => { setMode('login'); setForgotSent(false); setForgotEmail(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'hsl(210 10% 48%)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}>
                <ArrowLeft size={14} /> Back to Sign In
              </button>
              {!forgotSent ? (
                <form onSubmit={handleForgotPassword}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Reset password</h2>
                  <p style={{ fontSize: 14, color: 'hsl(210 10% 48%)', marginBottom: 28 }}>Enter your registered email address</p>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Email Address</Label>
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="field" placeholder="your@email.com" required autoFocus />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'hsl(158 42% 22% / 0.1)', border: '2px solid hsl(158 42% 22% / 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="24" height="24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 600, margin: '0 0 10px' }}>Check your email</h3>
                  <p style={{ fontSize: 14, color: 'hsl(210 10% 48%)', lineHeight: 1.6 }}>
                    If <strong style={{ color: G }}>{forgotEmail}</strong> is registered, a reset link has been sent.
                  </p>
                  <p style={{ fontSize: 12, color: 'hsl(210 8% 62%)', marginTop: 10 }}>Link expires in 1 hour · Check spam folder too</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
