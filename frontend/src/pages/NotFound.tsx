import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(34 25% 97%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'hsl(158 42% 22% / 0.1)', border: '1px solid hsl(158 42% 22% / 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <Activity size={26} color="hsl(158 42% 22%)" />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 72, fontWeight: 700, color: 'hsl(158 42% 22%)', lineHeight: 1, margin: '0 0 12px' }}>404</h1>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, margin: '0 0 12px' }}>Page Not Found</h2>
        <p style={{ fontSize: 14, color: 'hsl(210 10% 52%)', marginBottom: 32, lineHeight: 1.6 }}>The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding: '11px 28px' }}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default NotFound;
