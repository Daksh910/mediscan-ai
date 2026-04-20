import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/GlassCard';
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

const G = 'hsl(158 42% 22%)';

const BulkImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/api/patients/bulk-import/template/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'patient_import_template.csv'; a.click();
      toast.success('Template downloaded!');
    } catch { toast.error('Failed to download template'); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
    else toast.error('Please upload a CSV file');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const { data } = await api.post('/api/patients/bulk-import/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      if (data.created_count > 0) toast.success(`${data.created_count} patients imported!`);
      if (data.error_count > 0) toast.error(`${data.error_count} rows had errors`);
    } catch { toast.error('Import failed. Please check your CSV format.'); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, margin: '0 0 4px' }}>Bulk Import</h1>
            <p style={{ fontSize: 13, color: 'hsl(210 10% 52%)' }}>Upload a CSV to add multiple patients at once</p>
          </div>
          <button onClick={downloadTemplate} className="btn-outline" style={{ fontSize: 13, padding: '9px 16px' }}>
            <Download size={14} /> Download Template
          </button>
        </div>

        {/* CSV format guide */}
        <GlassCard className="p-5">
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={15} color={G} /> CSV Format
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(34 18% 90%)' }}>
                  {['first_name*', 'last_name*', 'date_of_birth*', 'gender*', 'blood_group', 'contact', 'email', 'address'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: G, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {['Rahul', 'Sharma', '1985-06-15', 'M', 'A+', '9876543210', 'rahul@email.com', 'Mumbai'].map((v, i) => (
                    <td key={i} style={{ padding: '6px 10px', color: 'hsl(210 10% 48%)', whiteSpace: 'nowrap' }}>{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11.5, color: 'hsl(210 8% 60%)', marginTop: 12 }}>* Required fields · Gender: M/F/O · Date format: YYYY-MM-DD</p>
        </GlassCard>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed`,
            borderColor: dragging ? G : file ? '#2d9b6b' : 'hsl(34 18% 82%)',
            borderRadius: 14, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
            background: dragging ? 'hsl(158 42% 22% / 0.04)' : file ? 'hsl(158 55% 38% / 0.04)' : 'transparent',
            transition: 'all 0.15s',
          }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
          <Upload size={32} style={{ margin: '0 auto 14px', display: 'block', color: file ? '#2d9b6b' : G, opacity: 0.7 }} />
          {file ? (
            <div>
              <p style={{ fontWeight: 600, color: '#2d9b6b', fontSize: 14 }}>{file.name}</p>
              <p style={{ fontSize: 12, color: 'hsl(210 8% 58%)', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Ready to import</p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Drop your CSV file here</p>
              <p style={{ fontSize: 13, color: 'hsl(210 10% 54%)' }}>or click to browse</p>
            </div>
          )}
        </div>

        {file && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleUpload} disabled={loading} className="btn-primary" style={{ flex: 1, padding: 12 }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Importing…</> : <><Upload size={15} /> Import {file.name}</>}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="btn-outline" style={{ padding: '12px 18px' }}>Clear</button>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  { label: 'Created', value: result.created_count, color: '#2d9b6b', icon: CheckCircle },
                  { label: 'Skipped', value: result.skipped_count, color: '#d97706', icon: AlertTriangle },
                  { label: 'Errors',  value: result.error_count,   color: '#e05c3a', icon: XCircle },
                ].map(s => (
                  <GlassCard key={s.label} className="p-4" style={{ textAlign: 'center' }}>
                    <s.icon size={22} style={{ color: s.color, margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'hsl(210 8% 58%)', marginTop: 4 }}>{s.label}</div>
                  </GlassCard>
                ))}
              </div>
              {result.created?.length > 0 && (
                <GlassCard className="p-5">
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#2d9b6b', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                    <CheckCircle size={15} /> Successfully Created
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {result.created.map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 10px', borderRadius: 8, background: 'hsl(158 42% 38% / 0.05)' }}>
                        <span>{p.name}</span>
                        <span style={{ fontFamily: 'DM Mono, monospace', color: 'hsl(210 8% 58%)' }}>#{p.id}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
              {result.errors?.length > 0 && (
                <GlassCard className="p-5">
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e05c3a', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                    <XCircle size={15} /> Errors
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.errors.map((e: any, i: number) => (
                      <div key={i} style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'hsl(14 80% 52% / 0.05)', border: '1px solid hsl(14 80% 52% / 0.12)' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', color: '#e05c3a' }}>Row {e.row}:</span>
                        <span style={{ color: 'hsl(210 10% 40%)', marginLeft: 8 }}>{e.error}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
              {result.created_count > 0 && (
                <button onClick={() => navigate('/patients')} className="btn-primary" style={{ width: '100%', padding: 12 }}>
                  View All Patients →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default BulkImport;
