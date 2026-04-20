import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Activity, Shield, Brain, BarChart3, Database, Zap, ArrowRight, ChevronDown } from 'lucide-react';

const STATS = [
  { value: '83%',  label: 'Model Accuracy',   sub: 'ROC-AUC: 0.83' },
  { value: '70K+', label: 'Training Records',  sub: 'CDC Health Survey' },
  { value: '4',    label: 'ML Algorithms',     sub: 'Stacking Ensemble' },
  { value: '88%',  label: 'Recall Rate',       sub: 'Clinical Sensitivity' },
];

const FEATURES = [
  { icon: Brain,    title: 'Ensemble ML Engine',      desc: 'Stacking ensemble of Random Forest, XGBoost, LightGBM & Gradient Boosting with SMOTETomek resampling for superior class balance.' },
  { icon: Activity, title: 'Real-Time Risk Assessment', desc: 'Submit 21 CDC health indicators and receive instant diabetes risk probability with confidence scores and clinical recommendations.' },
  { icon: BarChart3, title: 'SHAP Explainability',    desc: 'Understand exactly which health factors drive each prediction with perturbation-based feature importance scores.' },
  { icon: Database, title: 'PostgreSQL Backend',       desc: 'Full patient history, assessment timelines, and analytics powered by Django REST Framework with JWT authentication.' },
  { icon: Shield,   title: 'Clinical Grade Security', desc: 'Role-based access control for doctors, nurses, and admins. Every assessment is logged with assessor attribution.' },
  { icon: Zap,      title: 'Analytics Dashboard',     desc: 'Risk distribution trends, age group analysis, monthly cohort charts and real-time activity feed.' },
];

// Floating 3D sphere made of SVG arcs
const Sphere3D = () => (
  <div className="anim-float" style={{ width: 340, height: 340, position: 'relative', flexShrink: 0 }}>
    <svg viewBox="0 0 340 340" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="sphereGrad" cx="38%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="hsl(158 42% 30%)" />
          <stop offset="60%"  stopColor="hsl(158 42% 20%)" />
          <stop offset="100%" stopColor="hsl(158 42% 12%)" />
        </radialGradient>
        <radialGradient id="shineGrad" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="sphereShadow">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="hsl(158 42% 15%)" floodOpacity="0.22" />
        </filter>
      </defs>
      {/* Main sphere */}
      <circle cx="170" cy="162" r="130" fill="url(#sphereGrad)" filter="url(#sphereShadow)" />
      {/* Shine */}
      <circle cx="170" cy="162" r="130" fill="url(#shineGrad)" />
      {/* Latitude lines */}
      {[-60,-30,0,30,60].map((offset, i) => (
        <ellipse key={i} cx="170" cy={162+offset} rx={Math.sqrt(130*130 - offset*offset)} ry={13}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: `drawPath 1.5s ${i*0.1}s ease forwards` }}
        />
      ))}
      {/* Longitude lines */}
      {[0,45,90,135].map((angle, i) => (
        <ellipse key={i} cx="170" cy="162" rx={16} ry={130}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"
          transform={`rotate(${angle} 170 162)`}
          style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: `drawPath 1.5s ${i*0.12}s ease forwards` }}
        />
      ))}
      {/* Cross-hair equator accent */}
      <ellipse cx="170" cy="162" rx="130" ry="18" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      {/* Pulse ring */}
      <circle cx="170" cy="162" r="145" fill="none" stroke="hsl(158 42% 40%)" strokeWidth="1"
        style={{ animation: 'fadeIn 1s 0.5s ease forwards', opacity: 0 }} />
      <circle cx="170" cy="162" r="158" fill="none" stroke="hsl(158 42% 40%)" strokeWidth="0.5" opacity="0.3" />
      {/* Floating data points */}
      {[
        { cx: 82,  cy: 105, label: '83%', sublabel: 'Accuracy' },
        { cx: 258, cy: 108, label: '88%', sublabel: 'Recall' },
        { cx: 78,  cy: 232, label: '70K', sublabel: 'Records' },
        { cx: 258, cy: 225, label: 'F1:0.78', sublabel: 'Score' },
      ].map((pt, i) => (
        <g key={i} style={{ opacity: 0, animation: `fadeUp 0.5s ${0.6+i*0.15}s ease forwards` }}>
          <rect x={pt.cx - 28} y={pt.cy - 22} width={56} height={34} rx="8"
            fill="white" stroke="hsl(34 18% 88%)"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
          />
          <text x={pt.cx} y={pt.cy - 5} textAnchor="middle"
            style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 600, fill: 'hsl(158 42% 22%)' }}>
            {pt.label}
          </text>
          <text x={pt.cx} y={pt.cy + 7} textAnchor="middle"
            style={{ fontFamily: 'DM Sans', fontSize: 8.5, fill: 'hsl(210 8% 58%)' }}>
            {pt.sublabel}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

// Subtle animated background
const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg style={{ position: 'absolute', top: -100, right: -100, opacity: 0.035, width: 600, height: 600 }} viewBox="0 0 600 600">
      <circle cx="300" cy="300" r="250" fill="none" stroke="hsl(158 42% 22%)" strokeWidth="60" />
      <circle cx="300" cy="300" r="150" fill="none" stroke="hsl(158 42% 22%)" strokeWidth="40" />
    </svg>
    <svg style={{ position: 'absolute', bottom: -80, left: -80, opacity: 0.03, width: 500, height: 500 }} viewBox="0 0 500 500">
      <circle cx="250" cy="250" r="200" fill="none" stroke="hsl(158 42% 22%)" strokeWidth="50" />
    </svg>
    {/* Dot grid */}
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
      <defs>
        <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="hsl(34 18% 82%)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const G = 'hsl(158 42% 22%)';
  const GOLD = 'hsl(38 85% 52%)';

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(34 25% 97%)', fontFamily: 'DM Sans, sans-serif', color: 'hsl(210 15% 12%)' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(253,251,248,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid hsl(34 18% 90%)',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: 16 }}>MediScan AI</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/login')} className="btn-outline" style={{ padding: '8px 18px', fontSize: 13 }}>Sign In</button>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <BgPattern />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '60px 40px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60, flexWrap: 'wrap' }}>
          
          {/* Left text */}
          <div style={{ flex: '1 1 440px', maxWidth: 520 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 14px', borderRadius: 99,
              background: 'hsl(158 42% 22% / 0.08)',
              border: '1px solid hsl(158 42% 22% / 0.18)',
              fontSize: 12, fontWeight: 500, color: G,
              marginBottom: 28,
              fontFamily: 'DM Mono, monospace', letterSpacing: '0.03em',
            }} className="anim-fade-up">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, display: 'inline-block' }} />
              Trained on 70,692 CDC Health Survey Records
            </div>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 5vw, 62px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 24px', animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0 }}>
              Clinical AI for<br />
              <span style={{ color: G }}>Diabetes Risk</span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'hsl(210 10% 42%)', marginBottom: 36, maxWidth: 440, animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0 }}>
              A stacking ensemble of Random Forest, XGBoost, LightGBM and Gradient Boosting predicting diabetes risk with <strong style={{ color: 'hsl(210 15% 12%)' }}>83% accuracy</strong> and <strong style={{ color: 'hsl(210 15% 12%)' }}>88% recall</strong>. Built for doctors.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.3s ease both', opacity: 0 }}>
              <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Register as Doctor <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/login')} className="btn-outline" style={{ padding: '13px 22px', fontSize: 15 }}>
                Sign In
              </button>
            </div>

            {/* Metric pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.4s ease both', opacity: 0 }}>
              {['ROC-AUC: 0.83', 'F1: 0.78', 'SMOTETomek', 'SHAP Values'].map(t => (
                <span key={t} style={{
                  padding: '4px 12px', borderRadius: 99,
                  background: 'hsl(0 0% 100%)', border: '1px solid hsl(34 18% 86%)',
                  fontSize: 11.5, fontFamily: 'DM Mono, monospace',
                  color: 'hsl(210 10% 38%)',
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right 3D sphere */}
          <div style={{ flex: '0 0 auto', animation: 'fadeIn 0.8s 0.4s ease both', opacity: 0 }}>
            <Sphere3D />
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'hsl(210 8% 62%)', fontSize: 12, animation: 'fadeIn 1s 1s ease both', opacity: 0 }}>
          <span>Scroll to explore</span>
          <ChevronDown size={16} style={{ animation: 'floatSlow 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '72px 40px', background: 'hsl(0 0% 100%)', borderTop: '1px solid hsl(34 18% 90%)', borderBottom: '1px solid hsl(34 18% 90%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 700, color: G, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210 15% 18%)', margin: '8px 0 4px' }}>{s.label}</div>
              <div style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'hsl(210 8% 58%)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Clinical Workflow</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 600, margin: '0 0 14px' }}>How MediScan Works</h2>
          <p style={{ color: 'hsl(210 10% 45%)', fontSize: 16, maxWidth: 420, margin: '0 auto' }}>Three steps from registration to AI-powered risk assessment</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 24 }}>
          {[
            { num: '01', title: 'Register Patient',   desc: 'Add patient demographics, medical history, blood group and contact details to the secure system.', accent: G },
            { num: '02', title: 'Enter Health Data',   desc: 'Submit 21 CDC health indicators including BMI, blood pressure, lifestyle factors and age category.', accent: GOLD },
            { num: '03', title: 'Get AI Prediction',   desc: 'Receive instant diabetes risk score, SHAP factor breakdown, ensemble analysis and clinical recommendations.', accent: 'hsl(14 80% 52%)' },
          ].map((step, i) => (
            <div key={i} className="card-3d" style={{ padding: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: step.accent + '15',
                border: `1.5px solid ${step.accent}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600,
                color: step.accent, marginBottom: 18,
              }}>{step.num}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>{step.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'hsl(210 10% 45%)', margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '60px 40px 80px', background: 'hsl(34 20% 95%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Platform Features</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 600, margin: 0 }}>Everything You Need</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover" style={{ padding: 24 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'hsl(158 42% 22% / 0.08)',
                  border: '1px solid hsl(158 42% 22% / 0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <f.icon size={18} color={G} />
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'hsl(210 10% 45%)', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ML MODEL CARD ── */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="card" style={{ padding: '44px 48px', background: G, borderColor: 'transparent', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative circle */}
            <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', right: 20, bottom: -80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>ML Architecture</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 600, color: 'white', margin: '0 0 28px' }}>Stacking Ensemble Model</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 32 }}>
                {[
                  { name: 'Random Forest', role: 'Base Learner' },
                  { name: 'XGBoost',       role: 'Base Learner' },
                  { name: 'LightGBM',      role: 'Base Learner' },
                  { name: 'Logistic Reg.', role: 'Meta Learner' },
                ].map(m => (
                  <div key={m.name} style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 3 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{m.role}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {[
                  { label: 'Accuracy', value: '84.4%' },
                  { label: 'ROC-AUC',  value: '0.830' },
                  { label: 'F1-Score', value: '0.775' },
                  { label: 'Recall',   value: '0.876' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'white' }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '60px 40px 80px', textAlign: 'center', background: 'hsl(34 20% 95%)', borderTop: '1px solid hsl(34 18% 90%)' }}>
        <div className="section-label" style={{ marginBottom: 16 }}>Get Started Today</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 700, margin: '0 0 16px' }}>
          Start Assessing Patient Risk
        </h2>
        <p style={{ color: 'hsl(210 10% 45%)', fontSize: 16, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
          Join doctors using MediScan AI to make faster, more accurate clinical decisions.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
            Register as Doctor <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')} className="btn-outline" style={{ padding: '14px 26px', fontSize: 15 }}>
            Sign In to Dashboard
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'hsl(0 0% 100%)', borderTop: '1px solid hsl(34 18% 90%)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={14} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: 14 }}>MediScan AI</span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'hsl(210 8% 58%)' }}>Built by <strong style={{ color: 'hsl(210 15% 18%)' }}>Daksh Trivedi</strong></span>
          <a href="mailto:dakshtrivedi2@gmail.com" style={{ fontSize: 13, color: 'hsl(210 8% 58%)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = G)} onMouseLeave={e => (e.currentTarget.style.color = 'hsl(210 8% 58%)')}>
            dakshtrivedi2@gmail.com
          </a>
          <a href="https://github.com/Daksh910" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'hsl(210 8% 58%)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = G)} onMouseLeave={e => (e.currentTarget.style.color = 'hsl(210 8% 58%)')}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/daksh-trivedi-68bab8259" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'hsl(210 8% 58%)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = G)} onMouseLeave={e => (e.currentTarget.style.color = 'hsl(210 8% 58%)')}>
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
