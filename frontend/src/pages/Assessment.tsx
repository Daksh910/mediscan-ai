import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/GlassCard';
import { RiskBadge } from '@/components/RiskBadge';
import { CountUp } from '@/components/CountUp';
import { Search, ChevronRight, ChevronLeft, Check, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';
import { generateAssessmentPDF } from '@/lib/pdfReport';

const G = 'hsl(158 42% 22%)';

const binaryFields = [
  { key: 'high_bp',       label: 'High Blood Pressure',          desc: 'Diagnosed with hypertension' },
  { key: 'high_chol',     label: 'High Cholesterol',             desc: 'Total cholesterol > 240 mg/dL' },
  { key: 'chol_check',    label: 'Cholesterol Checked',          desc: 'Checked in last 5 years' },
  { key: 'smoker',        label: 'Smoker',                       desc: 'Smoked at least 100 cigarettes' },
  { key: 'stroke',        label: 'Stroke History',               desc: 'Previous stroke event' },
  { key: 'heart_disease', label: 'Heart Disease',                desc: 'CHD or myocardial infarction' },
  { key: 'phys_activity', label: 'Physical Activity',            desc: 'Exercise in past 30 days' },
  { key: 'fruits',        label: 'Fruits Daily',                 desc: 'Consumes fruit 1+ times/day' },
  { key: 'veggies',       label: 'Vegetables Daily',             desc: 'Consumes vegetables 1+ times/day' },
  { key: 'heavy_alcohol', label: 'Heavy Alcohol',                desc: 'M>14, F>7 drinks/wk' },
  { key: 'any_healthcare',label: 'Has Healthcare',               desc: 'Any healthcare coverage' },
  { key: 'no_doc_cost',   label: 'Cost Prevented Doctor Visit',  desc: 'Could not see doctor due to cost' },
  { key: 'diff_walk',     label: 'Difficulty Walking',           desc: 'Serious difficulty walking/climbing stairs' },
];

const ageCategories = ['18-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+'];
const educationLevels = ['Never attended','Elementary','Some High School','High School Grad','Some College','College Grad'];
const incomeLevels = ['< $10k','$10-15k','$15-25k','$25-35k','$35-50k','$50-75k','> $75k','> $75k+'];
const genHealthLabels = ['Excellent','Very Good','Good','Fair','Poor'];

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25)   return { label: 'Normal',       color: '#2d9b6b' };
  if (bmi < 30)   return { label: 'Overweight',   color: '#d97706' };
  return                  { label: 'Obese',        color: '#e05c3a' };
};

const getRiskColor = (level: string): string => {
  const map: Record<string, string> = { low:'#2d9b6b', Low:'#2d9b6b', medium:'#d97706', Medium:'#d97706', high:'#e05c3a', High:'#e05c3a', critical:'#c0293a', Critical:'#c0293a' };
  return map[level] || '#2d9b6b';
};

const getStatusColor = (status: string): string => {
  const s = status?.toLowerCase();
  if (s === 'critical') return '#c0293a';
  if (s === 'high')     return '#e05c3a';
  if (s === 'elevated') return '#d97706';
  return '#2d9b6b';
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(210 10% 48%)', marginBottom: 6 }}>{children}</div>
);

const Slider = ({ label, value, min, max, onChange, display }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; display: React.ReactNode }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <Label>{label}</Label>
      <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'hsl(210 10% 30%)' }}>{display}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: G, cursor: 'pointer' }} />
  </div>
);

const RiskGauge = ({ score, level, color }: { score: number; level: string; color: string }) => {
  const clamped = Math.min(Math.max(score, 0), 100);
  const r = 80; const cx = 115; const cy = 105;
  const toXY = (a: number) => ({ x: cx + r * Math.cos((a * Math.PI) / 180), y: cy + r * Math.sin((a * Math.PI) / 180) });
  const arc = (s: number, e: number) => { const a = toXY(s); const b = toXY(e); const l = e - s > 180 ? 1 : 0; return `M ${a.x} ${a.y} A ${r} ${r} 0 ${l} 1 ${b.x} ${b.y}`; };
  const fillAngle = -180 + (clamped / 100) * 180;
  const tip = toXY(fillAngle);
  const levelLabel = level ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 230 120" width="320" height="170">
        {/* Track zones */}
        {[{ s: -180, e: -135, c: '#2d9b6b' }, { s: -135, e: -90, c: '#d97706' }, { s: -90, e: -45, c: '#e05c3a' }, { s: -45, e: 0, c: '#c0293a' }].map((z, i) => (
          <path key={i} d={arc(z.s, z.e)} fill="none" stroke={z.c + '22'} strokeWidth="16" strokeLinecap="round" />
        ))}
        {/* Fill */}
        <motion.path d={arc(-180, fillAngle)} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }} />
        {/* Needle */}
        <motion.line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={color} strokeWidth="2.5" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x="18"  y="115" fill="hsl(210 8% 65%)" fontSize="9" textAnchor="middle">LOW</text>
        <text x="212" y="115" fill="hsl(210 8% 65%)" fontSize="9" textAnchor="middle">CRIT</text>
      </svg>
      <div style={{ textAlign: 'center', marginTop: -10 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color, lineHeight: 1 }}>
          <CountUp end={clamped} decimals={1} suffix="%" duration={1500} />
        </div>
        <span style={{
          display: 'inline-block', marginTop: 10, padding: '5px 18px',
          borderRadius: 99, fontSize: 13, fontWeight: 600, fontFamily: 'DM Mono, monospace',
          color, border: `1px solid ${color}50`, background: color + '12',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>{levelLabel} Risk</span>
      </div>
    </div>
  );
};

const Assessment = () => {
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patient');

  const [formData, setFormData] = useState<Record<string, number>>({
    high_bp: 0, high_chol: 0, chol_check: 0, bmi: 25, smoker: 0, stroke: 0,
    heart_disease: 0, phys_activity: 0, fruits: 0, veggies: 0, heavy_alcohol: 0,
    any_healthcare: 0, no_doc_cost: 0, gen_health: 3, ment_health: 0, phys_health: 0,
    diff_walk: 0, sex: 0, age_category: 5, education: 4, income: 4,
  });

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { navigate('/login'); return; }
    const load = async () => {
      try {
        const { data } = await api.get(`/api/patients/?search=${patientSearch}`);
        const list = Array.isArray(data) ? data : data.results || [];
        setPatients(list);
        if (preselectedPatientId && !selectedPatient) {
          const match = list.find((p: any) => String(p.id) === preselectedPatientId);
          if (match) { setSelectedPatient(match); setStep(2); }
        }
      } catch { setPatients([]); }
    };
    load();
  }, [patientSearch, navigate]);

  const handlePredict = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/patients/assessments/create/', { patient: selectedPatient.id, ...formData });
      const processedResult = {
        ...data,
        risk_score_display: Math.round((data.risk_score || 0) * 100 * 10) / 10,
        risk_level: data.risk_level || 'low',
        risk_factors: Array.isArray(data.risk_factors) ? data.risk_factors : [],
        model_breakdown: data.model_breakdown || {},
        recommendations: data.recommendations || '',
      };
      setResult(processedResult);
      setStep(3);
      toast.success(`Risk Score: ${processedResult.risk_score_display}% — ${processedResult.risk_level.toUpperCase()}`);
    } catch { toast.error('Assessment failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const set = (key: string) => (v: number) => setFormData(f => ({ ...f, [key]: v }));

  const STEPS = ['Select Patient', 'Health Indicators', 'Results'];

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, margin: '0 0 4px' }}>New Assessment</h1>
          <p style={{ fontSize: 13, color: 'hsl(210 10% 52%)' }}>AI-powered diabetes risk prediction</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                    background: done ? G : active ? 'hsl(158 42% 22% / 0.1)' : 'hsl(34 18% 92%)',
                    color: done ? 'white' : active ? G : 'hsl(210 8% 60%)',
                    border: `1.5px solid ${done || active ? G : 'hsl(34 18% 86%)'}`,
                  }}>
                    {done ? <Check size={14} /> : s}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: active ? G : 'hsl(210 8% 60%)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {s < 3 && <div style={{ flex: 1, height: 1.5, background: step > s ? G : 'hsl(34 18% 88%)', margin: '0 12px', transition: 'background 0.3s' }} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <GlassCard className="p-6">
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, margin: '0 0 18px' }}>Select Patient</h3>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(210 8% 60%)' }} />
                  <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Search by name…" className="field" style={{ paddingLeft: 34, fontSize: 13 }} />
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {patients.length === 0 && <p style={{ color: 'hsl(210 8% 60%)', fontSize: 13, textAlign: 'center', padding: '28px 0' }}>No patients found</p>}
                  {patients.map(p => (
                    <button key={p.id} onClick={() => setSelectedPatient(p)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 10, border: '1.5px solid',
                      borderColor: selectedPatient?.id === p.id ? G : 'hsl(34 18% 88%)',
                      background: selectedPatient?.id === p.id ? 'hsl(158 42% 22% / 0.06)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                    }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'hsl(210 15% 14%)' }}>{p.first_name} {p.last_name}</span>
                        {p.age && <span style={{ fontSize: 12, color: 'hsl(210 8% 58%)', marginLeft: 8 }}>{p.age} yrs</span>}
                      </div>
                      {p.latest_risk_level && <RiskBadge level={p.latest_risk_level} />}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={() => selectedPatient && setStep(2)} disabled={!selectedPatient} className="btn-primary" style={{ gap: 8 }}>
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <GlassCard className="p-6">
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, margin: '0 0 6px' }}>Health Indicators</h3>
                <p style={{ fontSize: 13, color: 'hsl(210 10% 48%)', marginBottom: 22 }}>
                  For <strong style={{ color: G }}>{selectedPatient?.first_name} {selectedPatient?.last_name}</strong>
                </p>

                {/* Binary toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 10, marginBottom: 28 }}>
                  {binaryFields.map(f => (
                    <div key={f.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 14px', borderRadius: 10, background: 'hsl(34 18% 97%)', border: '1px solid hsl(34 18% 90%)',
                    }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'hsl(210 15% 18%)', marginBottom: 2 }}>{f.label}</p>
                        <p style={{ fontSize: 11, color: 'hsl(210 8% 58%)' }}>{f.desc}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0, marginLeft: 12 }}>
                        {['No', 'Yes'].map((label, val) => (
                          <button key={label} onClick={() => setFormData(fd => ({ ...fd, [f.key]: val }))} style={{
                            padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            border: '1px solid', transition: 'all 0.12s',
                            borderColor: formData[f.key] === val ? G : 'hsl(34 18% 84%)',
                            background: formData[f.key] === val ? 'hsl(158 42% 22% / 0.1)' : 'transparent',
                            color: formData[f.key] === val ? G : 'hsl(210 10% 52%)',
                          }}>{label}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sliders */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
                  <Slider label="BMI" value={formData.bmi} min={10} max={98} onChange={set('bmi')}
                    display={<span style={{ color: getBMICategory(formData.bmi).color }}>{formData.bmi} — {getBMICategory(formData.bmi).label}</span>} />
                  <Slider label="General Health" value={formData.gen_health} min={1} max={5} onChange={set('gen_health')}
                    display={genHealthLabels[formData.gen_health - 1]} />
                  <Slider label="Mental Health Bad Days" value={formData.ment_health} min={0} max={30} onChange={set('ment_health')}
                    display={`${formData.ment_health}/30`} />
                  <Slider label="Physical Health Bad Days" value={formData.phys_health} min={0} max={30} onChange={set('phys_health')}
                    display={`${formData.phys_health}/30`} />
                </div>

                {/* Dropdowns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                  {[
                    { k: 'sex',          l: 'Sex',              opts: [{v:0,l:'Female'},{v:1,l:'Male'}] },
                    { k: 'age_category', l: 'Age Category',     opts: ageCategories.map((c,i) => ({v:i+1,l:c})) },
                    { k: 'education',    l: 'Education Level',  opts: educationLevels.map((c,i) => ({v:i+1,l:c})) },
                    { k: 'income',       l: 'Income Level',     opts: incomeLevels.map((c,i) => ({v:i+1,l:c})) },
                  ].map(({ k, l, opts }) => (
                    <div key={k}>
                      <Label>{l}</Label>
                      <select value={formData[k]} onChange={e => setFormData(f => ({ ...f, [k]: Number(e.target.value) }))}
                        className="field" style={{ cursor: 'pointer' }}>
                        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setStep(1)} className="btn-outline"><ChevronLeft size={15} /> Back</button>
                  <button onClick={handlePredict} disabled={loading} className="btn-primary">
                    {loading ? (
                      <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin3d 0.7s linear infinite' }} /> Analysing…</>
                    ) : <>Predict Risk <ChevronRight size={15} /></>}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && result && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <GlassCard className="p-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <RiskGauge score={result.risk_score_display} level={result.risk_level} color={getRiskColor(result.risk_level)} />
                </GlassCard>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                  {/* Risk Factors */}
                  <GlassCard className="p-5">
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 16px' }}>Risk Factors</h3>
                    {result.risk_factors.length === 0 ? (
                      <p style={{ color: 'hsl(210 8% 62%)', fontSize: 13, textAlign: 'center', padding: '28px 0' }}>No significant risk factors detected</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {result.risk_factors.map((f: any, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 9, background: 'hsl(34 18% 97%)', border: '1px solid hsl(34 18% 90%)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 7, height: 7, borderRadius: '50%', background: getStatusColor(f.status), flexShrink: 0 }} />
                              <div>
                                <p style={{ fontSize: 13, color: 'hsl(210 15% 18%)', marginBottom: 1 }}>{f.factor}</p>
                                {f.note && <p style={{ fontSize: 11, color: 'hsl(210 8% 58%)' }}>{f.note}</p>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'hsl(210 10% 48%)' }}>{String(f.value)}</span>
                              <span style={{
                                fontSize: 10.5, padding: '2px 8px', borderRadius: 99, fontWeight: 600, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase',
                                color: getStatusColor(f.status), border: `1px solid ${getStatusColor(f.status)}40`, background: getStatusColor(f.status) + '12',
                              }}>{f.status}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </GlassCard>

                  {/* Ensemble Analysis */}
                  <GlassCard className="p-5">
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 16px' }}>Ensemble Analysis</h3>
                    {Object.keys(result.model_breakdown).length === 0 ? (
                      <p style={{ color: 'hsl(210 8% 62%)', fontSize: 13, textAlign: 'center', padding: '28px 0' }}>No model breakdown available</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {Object.entries(result.model_breakdown).map(([model, score]: [string, any], i) => {
                          const pct = Math.round(Number(score) * 100 * 10) / 10;
                          return (
                            <motion.div key={model} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                <span style={{ fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', color: 'hsl(210 10% 48%)' }}>{model}</span>
                                <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'hsl(210 15% 18%)' }}>{pct}%</span>
                              </div>
                              <div style={{ height: 6, background: 'hsl(34 18% 90%)', borderRadius: 99, overflow: 'hidden' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.12 }}
                                  style={{ height: '100%', borderRadius: 99, background: getRiskColor(result.risk_level) }} />
                              </div>
                            </motion.div>
                          );
                        })}
                        <p style={{ fontSize: 11, color: 'hsl(210 8% 62%)', textAlign: 'center', marginTop: 4 }}>Individual model probability estimates</p>
                      </div>
                    )}
                  </GlassCard>
                </div>

                {/* Recommendations */}
                <GlassCard className="p-5" style={{ borderLeft: `3px solid ${getRiskColor(result.risk_level)}` }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 10px' }}>Clinical Recommendations</h3>
                  <p style={{ fontSize: 14, color: 'hsl(210 10% 40%)', lineHeight: 1.7 }}>{result.recommendations}</p>
                  <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: 'hsl(34 18% 96%)', fontSize: 11.5, fontFamily: 'DM Mono, monospace', color: 'hsl(210 10% 52%)' }}>
                    Confidence: {Math.round((result.model_confidence || 0) * 100)}% · Assessment #{result.id}
                  </div>
                </GlassCard>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={() => navigate(`/patients/${selectedPatient?.id}`)} className="btn-primary">Save & View Patient</button>
                  <button onClick={async () => {
                    try { await generateAssessmentPDF(result, selectedPatient); toast.success('PDF downloaded!'); }
                    catch { toast.error('PDF generation failed'); }
                  }} className="btn-outline">
                    <Download size={14} /> Download PDF
                  </button>
                  <button onClick={() => { setStep(1); setResult(null); setSelectedPatient(null); }} className="btn-outline">New Assessment</button>
                  <button onClick={() => navigate('/dashboard')} className="btn-outline">Dashboard</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Assessment;
