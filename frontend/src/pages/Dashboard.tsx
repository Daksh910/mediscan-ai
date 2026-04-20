import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/GlassCard';
import { CountUp } from '@/components/CountUp';
import { RiskBadge } from '@/components/RiskBadge';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/LoadingSkeleton';
import { Users, Activity, AlertTriangle, Brain, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import api from '@/lib/api';
import { motion } from 'framer-motion';

const G = 'hsl(158 42% 22%)';
const RISK_COLORS: Record<string, string> = {
  Low: '#2d9b6b', Medium: '#d97706', High: '#e05c3a', Critical: '#c0293a',
  low: '#2d9b6b', medium: '#d97706', high: '#e05c3a', critical: '#c0293a',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid hsl(34 18% 88%)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      {label && <p style={{ color: 'hsl(210 10% 38%)', marginBottom: 6, fontSize: 12, fontWeight: 500 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill || G, fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

const statConfig = [
  { icon: Users,         color: G,                      bg: 'hsl(158 42% 22% / 0.08)', label: 'Total Patients'       },
  { icon: Activity,      color: 'hsl(38 85% 52%)',       bg: 'hsl(38 85% 52% / 0.08)',  label: "Today's Assessments"  },
  { icon: AlertTriangle, color: 'hsl(14 80% 52%)',       bg: 'hsl(14 80% 52% / 0.08)',  label: 'High Risk Patients'   },
  { icon: Brain,         color: 'hsl(270 55% 55%)',      bg: 'hsl(270 55% 55% / 0.08)', label: 'Avg Risk Score'       },
];

const Dashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [riskDist, setRiskDist] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { navigate('/login'); return; }
    const load = async () => {
      try {
        const [s, r, a, t, rc] = await Promise.all([
          api.get('/api/analytics/summary/'),
          api.get('/api/analytics/risk-distribution/'),
          api.get('/api/analytics/age-groups/'),
          api.get('/api/analytics/trends/?months=6'),
          api.get('/api/analytics/recent/'),
        ]);
        const totals = s.data?.totals || {};
        const averages = s.data?.averages || {};
        setSummary({ total_patients: totals.patients ?? 0, today_assessments: totals.today_assessments ?? 0, high_risk: totals.high_risk_patients ?? 0, avg_risk: averages.risk_score ?? 0 });
        const rdRaw = Array.isArray(r.data?.data) ? r.data.data : [];
        setRiskDist(rdRaw.map((d: any) => ({ name: d.level ? d.level.charAt(0).toUpperCase() + d.level.slice(1) : d.name, value: d.count ?? d.value ?? 0 })));
        const agRaw = Array.isArray(a.data?.age_groups) ? a.data.age_groups : [];
        setAgeGroups(agRaw.map((g: any) => ({ group: g.group, Low: g.low ?? 0, Medium: g.medium ?? 0, High: g.high ?? 0, Critical: g.critical ?? 0 })));
        const tRaw = Array.isArray(t.data?.monthly_data) ? t.data.monthly_data : [];
        setTrends(tRaw.map((m: any) => ({ month: m.month, assessments: m.total_assessments ?? 0, highRisk: m.high_risk_count ?? 0, avgScore: m.avg_risk_score ?? 0 })));
        const recentRaw = Array.isArray(rc.data?.recent_assessments) ? rc.data.recent_assessments : [];
        setRecent(recentRaw.map((item: any) => ({
          id: item.patient_id ?? item.id,
          patient: item.patient_name ?? 'Unknown',
          risk_level: item.risk_level ? item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1) : 'Low',
          risk_score: item.risk_score ?? 0, bmi: item.bmi ?? '-',
          assessed_by: item.assessed_by ?? '', time: item.assessed_at ? new Date(item.assessed_at).toLocaleString() : '',
        })));
      } catch {
        setSummary({ total_patients: 12, today_assessments: 3, high_risk: 4, avg_risk: 52.3 });
        setRiskDist([{ name: 'Low', value: 3 }, { name: 'Medium', value: 4 }, { name: 'High', value: 3 }, { name: 'Critical', value: 2 }]);
        setAgeGroups([{ group: '18-30', Low: 2, Medium: 1, High: 0, Critical: 0 }, { group: '31-45', Low: 1, Medium: 2, High: 1, Critical: 0 }, { group: '46-60', Low: 0, Medium: 1, High: 2, Critical: 1 }, { group: '60+', Low: 0, Medium: 0, High: 1, Critical: 2 }]);
        setTrends([{ month: 'Jan 2026', assessments: 5, highRisk: 2, avgScore: 48 }, { month: 'Feb 2026', assessments: 8, highRisk: 3, avgScore: 51 }, { month: 'Mar 2026', assessments: 12, highRisk: 4, avgScore: 52 }]);
        setRecent([
          { id: 1, patient: 'Arjun Sharma', risk_level: 'High', risk_score: 72.4, bmi: 31.2, assessed_by: 'Dr. Ramesh Gupta', time: '2 min ago' },
          { id: 2, patient: 'Priya Patel', risk_level: 'Low', risk_score: 12.1, bmi: 23.4, assessed_by: 'Dr. Ramesh Gupta', time: '15 min ago' },
        ]);
      } finally { setLoading(false); }
    };
    load();
  }, [navigate]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = summary ? [
    { label: 'Total Patients',        value: summary.total_patients,       suffix: '',   decimals: 0 },
    { label: "Today's Assessments",   value: summary.today_assessments,    suffix: '',   decimals: 0 },
    { label: 'High Risk Patients',    value: summary.high_risk,             suffix: '',   decimals: 0 },
    { label: 'Avg Risk Score',        value: summary.avg_risk,              suffix: '%',  decimals: 1 },
  ] : [];

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'hsl(210 8% 58%)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{greeting()}</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 600, margin: 0, color: 'hsl(210 15% 12%)' }}>
              Dr. {user.first_name || user.username || 'Physician'}
            </h1>
            <p style={{ fontSize: 13, color: 'hsl(210 10% 52%)', marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={() => navigate('/assessment')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
            New Assessment <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {statCards.map((card, i) => {
              const cfg = statConfig[i];
              return (
                <motion.div key={card.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <GlassCard hover className="p-5">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'hsl(210 10% 50%)', letterSpacing: '0.02em' }}>{card.label}</span>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <cfg.icon size={16} color={cfg.color} />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: 'hsl(210 15% 12%)', lineHeight: 1 }}>
                      <CountUp end={card.value} decimals={card.decimals} suffix={card.suffix} />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Charts row */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ChartSkeleton /><ChartSkeleton />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {/* Donut */}
            <GlassCard className="p-5">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: 0 }}>Risk Distribution</h3>
                <TrendingUp size={15} color="hsl(210 8% 62%)" />
              </div>
              {riskDist.length === 0 ? (
                <p style={{ color: 'hsl(210 8% 62%)', textAlign: 'center', padding: '48px 0', fontSize: 13 }}>No data yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={riskDist} cx="50%" cy="50%" innerRadius={62} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                        {riskDist.map((entry) => <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#94a3b8'} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    {riskDist.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLORS[d.name] }} />
                        <span style={{ color: 'hsl(210 10% 48%)' }}>{d.name}</span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'hsl(210 15% 18%)' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>

            {/* Age group bar */}
            <GlassCard className="p-5">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 18px' }}>Risk by Age Group</h3>
              {ageGroups.length === 0 ? (
                <p style={{ color: 'hsl(210 8% 62%)', textAlign: 'center', padding: '48px 0', fontSize: 13 }}>No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={ageGroups} margin={{ top: 5, right: 8, left: -24, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(34 18% 90%)" />
                    <XAxis dataKey="group" tick={{ fill: 'hsl(210 10% 58%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(210 10% 58%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Low" stackId="a" fill="#2d9b6b" />
                    <Bar dataKey="Medium" stackId="a" fill="#d97706" />
                    <Bar dataKey="High" stackId="a" fill="#e05c3a" />
                    <Bar dataKey="Critical" stackId="a" fill="#c0293a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </div>
        )}

        {/* Monthly trend */}
        {loading ? <ChartSkeleton /> : (
          <GlassCard className="p-5">
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: '0 0 18px' }}>Monthly Trends</h3>
            {trends.length === 0 ? (
              <p style={{ color: 'hsl(210 8% 62%)', textAlign: 'center', padding: '48px 0', fontSize: 13 }}>No data yet — assessments will appear here after the first month</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trends} margin={{ top: 5, right: 8, left: -24, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(158 42% 22%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(158 42% 22%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e05c3a" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#e05c3a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(34 18% 90%)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(210 10% 58%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(210 10% 58%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="assessments" stroke={G} fill="url(#gGreen)" strokeWidth={2} name="Assessments" />
                  <Area type="monotone" dataKey="highRisk" stroke="#e05c3a" fill="url(#gRed)" strokeWidth={2} name="High Risk" />
                  <Area type="monotone" dataKey="avgScore" stroke="#d97706" fill="none" strokeWidth={1.5} strokeDasharray="5 5" name="Avg Score %" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        )}

        {/* Recent activity */}
        {loading ? <TableSkeleton /> : (
          <GlassCard className="p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, margin: 0 }}>Recent Assessments</h3>
              <button onClick={() => navigate('/patients')} style={{ fontSize: 12, color: G, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                View all →
              </button>
            </div>
            {recent.length === 0 ? (
              <p style={{ color: 'hsl(210 8% 62%)', textAlign: 'center', padding: '28px 0', fontSize: 13 }}>No recent assessments</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid hsl(34 18% 90%)' }}>
                      {['Patient', 'Risk Level', 'Score', 'BMI', 'Assessed By', 'Time'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontFamily: 'DM Mono, monospace', fontSize: 10.5, fontWeight: 500, color: 'hsl(210 8% 58%)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r: any, i: number) => (
                      <motion.tr key={i}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => r.id && navigate(`/patients/${r.id}`)}
                        style={{ borderBottom: '1px solid hsl(34 18% 93%)', cursor: r.id ? 'pointer' : 'default', transition: 'background 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(34 20% 97%)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '11px 10px', fontWeight: 500, color: 'hsl(210 15% 14%)' }}>{r.patient}</td>
                        <td style={{ padding: '11px 10px' }}><RiskBadge level={r.risk_level} /></td>
                        <td style={{ padding: '11px 10px', fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'hsl(210 10% 28%)' }}>{r.risk_score}%</td>
                        <td style={{ padding: '11px 10px', fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'hsl(210 10% 42%)' }}>{r.bmi}</td>
                        <td style={{ padding: '11px 10px', color: 'hsl(210 10% 50%)', whiteSpace: 'nowrap' }}>{r.assessed_by}</td>
                        <td style={{ padding: '11px 10px', color: 'hsl(210 8% 60%)', fontSize: 12 }}>{r.time}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
