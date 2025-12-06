import React from 'react';
import { AuditRecord, RiskLevel } from '../../types';
import { Trash2, Calendar, FileText, ArrowRight, Database } from 'lucide-react';

interface HistoryViewProps {
  records: AuditRecord[];
  onSelectRecord: (record: AuditRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ records, onSelectRecord, onDeleteRecord, onClearAll }) => {
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskColor = (level: RiskLevel) => {
    switch(level) {
      case RiskLevel.CRITICAL: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case RiskLevel.HIGH: return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case RiskLevel.MEDIUM: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-in fade-in">
        <div className="bg-slate-800/50 p-6 rounded-full mb-4">
          <Database className="w-12 h-12 opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">Base de Datos Vacía</h3>
        <p>No hay auditorías registradas en el almacenamiento local.</p>
        <p className="text-sm mt-2 text-slate-600">Realiza un análisis para guardar datos.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            Historial de Auditorías
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Registro persistente de análisis realizados (Local Storage)
          </p>
        </div>
        <button 
          onClick={() => {
            if(window.confirm('¿Estás seguro de borrar todo el historial?')) onClearAll();
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
        >
          <Trash2 className="w-4 h-4" />
          Borrar BD
        </button>
      </div>

      <div className="grid gap-4">
        {records.sort((a, b) => b.timestamp - a.timestamp).map((record) => (
          <div 
            key={record.id}
            className="bg-slate-800 border border-slate-700 hover:border-cyan-500/30 rounded-xl p-4 transition-all hover:bg-slate-800/80 group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg border ${getRiskColor(record.report.riskLevel)}`}>
                  <span className="font-bold text-lg">{record.report.overallScore}</span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-200">
                      {record.fileName || "Análisis de Texto"}
                    </h3>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                      record.context === 'university' 
                        ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
                        : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                    }`}>
                      {record.context === 'university' ? 'Académico' : 'Empresarial'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(record.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      ID: {record.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={() => onSelectRecord(record)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors text-sm font-medium"
                >
                  Ver Informe
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.id); }}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;