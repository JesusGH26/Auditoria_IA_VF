import React, { useState, useEffect } from 'react';
import Navbar from './frontend/components/Navbar';
import AuditInput from './frontend/components/AuditInput';
import AuditReportView from './frontend/components/AuditReportView';
import HistoryView from './frontend/components/HistoryView';
import { analyzeSecurityPlan } from './backend/auditService';
import { AuditState, AuditInputData, AuditRecord } from './types';
import { AlertCircle, FileKey, Terminal, Database } from 'lucide-react';
import { supabase } from './frontend/lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'history'>('home');
  const [auditState, setAuditState] = useState<AuditState>({
    status: 'idle',
    report: null,
    error: null,
  });
  
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!supabase) return; // Fallback si no está configurado
    
    setIsLoadingHistory(true);
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando historial:', error);
    } else if (data) {
      // Mapear los datos de SQL (snake_case) a nuestra interfaz TypeScript (camelCase)
      const formattedRecords: AuditRecord[] = data.map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at).getTime(),
        fileName: item.file_name,
        context: item.context || 'enterprise',
        report: item.report
      }));
      setHistory(formattedRecords);
    }
    setIsLoadingHistory(false);
  };

  const saveToHistory = async (record: AuditRecord) => {
    // Actualización optimista local
    setHistory([record, ...history]);

    if (!supabase) return;

    // Guardar en la nube
    const { error } = await supabase
      .from('audits')
      .insert([
        {
          id: record.id,
          created_at: new Date(record.timestamp).toISOString(),
          file_name: record.fileName,
          context: record.context,
          report: record.report
        }
      ]);

    if (error) {
      console.error('Error guardando en Supabase:', error);
      // Podríamos revertir el estado local si falla, pero por simplicidad solo logueamos
    }
  };

  const deleteRecord = async (id: string) => {
    // Actualización optimista
    setHistory(history.filter(r => r.id !== id));

    if (!supabase) return;

    const { error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando de Supabase:', error);
    }
  };

  const clearHistory = async () => {
    setHistory([]);

    if (!supabase) return;

    // Nota: Supabase no permite truncar tabla desde el cliente por defecto por seguridad,
    // así que borramos uno por uno o requerimos una política RLS permisiva.
    // Para este demo, asumimos que el usuario borra registros individualmente o implementamos un loop.
    // Una forma segura es borrar los que tenemos en memoria:
    const ids = history.map(h => h.id);
    if(ids.length > 0) {
        await supabase.from('audits').delete().in('id', ids);
    }
  };

  const handleAnalyze = async (data: AuditInputData) => {
    setAuditState({ status: 'analyzing', report: null, error: null });
    
    try {
      const report = await analyzeSecurityPlan(data);
      
      const newRecord: AuditRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fileName: data.type === 'pdf' ? 'Archivo PDF' : 'Plan de Texto Manual',
        context: data.context,
        report: report
      };

      await saveToHistory(newRecord);

      setAuditState({ status: 'complete', report, error: null });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setAuditState({ 
        status: 'error', 
        report: null, 
        error: errorMessage
      });
    }
  };

  const handleReset = () => {
    setAuditState({ status: 'idle', report: null, error: null });
    setView('home');
  };

  const handleSelectRecord = (record: AuditRecord) => {
    setAuditState({ status: 'complete', report: record.report, error: null });
    setView('home');
  };

  const isApiKeyError = auditState.error?.includes("API Key") || auditState.error?.includes("403");

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <Navbar 
        onShowHistory={() => setView('history')} 
        onShowHome={() => setView('home')}
        currentView={view}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {view === 'history' ? (
          <>
            {!supabase && (
              <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-center gap-3 text-yellow-400 text-sm">
                <Database className="w-5 h-5" />
                <span>
                  <strong>Modo Offline:</strong> No se ha configurado Supabase. Los datos no se guardarán permanentemente en la nube. 
                  Configura <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_KEY</code> en tu archivo .env.
                </span>
              </div>
            )}
            {isLoadingHistory ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <HistoryView 
                records={history} 
                onSelectRecord={handleSelectRecord}
                onDeleteRecord={deleteRecord}
                onClearAll={clearHistory}
              />
            )}
          </>
        ) : (
          <>
            {auditState.error && (
              <div className="max-w-3xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/50 p-6 rounded-xl flex flex-col gap-4 text-rose-200 shadow-lg animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-1">Error al procesar la auditoría</p>
                    <p>{auditState.error}</p>
                  </div>
                </div>

                {isApiKeyError && (
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-rose-500/20 mt-2 text-slate-300 text-sm">
                    <p className="font-semibold text-white mb-2 flex items-center gap-2">
                      <FileKey className="w-4 h-4" />
                      Cómo solucionar esto:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Crea un archivo llamado <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-400">.env</code> en la carpeta raíz.</li>
                      <li>
                        Pega tu clave: 
                        <div className="bg-black/50 p-2 rounded mt-1 font-mono text-xs select-all">
                          API_KEY=tu_clave_aqui
                        </div>
                      </li>
                      <li className="flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        <strong>Reinicia:</strong> <code className="bg-slate-800 px-1 rounded">Ctrl + C</code> luego <code className="bg-slate-800 px-1 rounded">npm run dev</code>.
                      </li>
                    </ol>
                  </div>
                )}

                <button 
                  onClick={() => setAuditState(s => ({ ...s, error: null, status: 'idle' }))}
                  className="self-end text-sm hover:underline px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors font-medium"
                >
                  Entendido, intentar de nuevo
                </button>
              </div>
            )}

            {auditState.status === 'idle' || auditState.status === 'analyzing' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <AuditInput 
                   onAnalyze={handleAnalyze} 
                   isAnalyzing={auditState.status === 'analyzing'} 
                 />
              </div>
            ) : (
              auditState.report && (
                <AuditReportView 
                  report={auditState.report} 
                  onReset={handleReset} 
                />
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;