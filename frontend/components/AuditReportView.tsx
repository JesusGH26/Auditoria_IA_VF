import React from 'react';
import { 
  CheckCircle2, 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  FileCheck,
  Activity,
  Zap,
  LifeBuoy,
  BookLock,
  Flame, // Icono para vectores de ataque
  ShieldCheck // Icono para mitigación
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AuditReport, RiskLevel } from '../../types';

interface AuditReportViewProps {
  report: AuditReport;
  onReset: () => void;
}

const AuditReportView: React.FC<AuditReportViewProps> = ({ report, onReset }) => {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getRiskBadge = (level: RiskLevel) => {
    const styles = {
      [RiskLevel.CRITICAL]: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      [RiskLevel.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      [RiskLevel.MEDIUM]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      [RiskLevel.LOW]: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      [RiskLevel.SAFE]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[level] || styles[RiskLevel.MEDIUM]}`}>
        RIESGO {level}
      </span>
    );
  };

  const chartData = [
    { name: 'Score', value: report.overallScore },
    { name: 'Gap', value: 100 - report.overallScore },
  ];

  const COLORS = [
    report.overallScore >= 80 ? '#10b981' : report.overallScore >= 50 ? '#facc15' : '#f43f5e', 
    '#1e293b'
  ];

  // Helper icons for the 4 pillars
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('riesgo')) return <Activity className="w-5 h-5 text-cyan-400" />;
    if (lower.includes('impacto')) return <Zap className="w-5 h-5 text-orange-400" />;
    if (lower.includes('contingencia')) return <LifeBuoy className="w-5 h-5 text-emerald-400" />;
    if (lower.includes('política') || lower.includes('politica')) return <BookLock className="w-5 h-5 text-purple-400" />;
    return <Target className="w-5 h-5 text-slate-400" />;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Optimizado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Aceptable': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Deficiente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Crítico': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Summary Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex-1 space-y-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="text-cyan-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Informe de Auditoría</h2>
            {getRiskBadge(report.riskLevel)}
          </div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            {report.executiveSummary}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 inline-block">
            <Target className="w-4 h-4" />
            <span>Alineación: <span className="text-cyan-300 font-medium">{report.complianceAlignment}</span></span>
          </div>
        </div>

        {/* Score Chart */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
              {report.overallScore}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Puntuación</span>
          </div>
        </div>
      </div>

      {/* DETAILED PILLAR ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {report.detailedAnalysis && report.detailedAnalysis.map((item, idx) => (
          <div key={idx} className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl flex flex-col gap-3 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-slate-900 rounded-lg">
                {getCategoryIcon(item.category)}
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold mb-1">{item.category}</h4>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mb-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.score > 75 ? 'bg-emerald-500' : item.score > 40 ? 'bg-yellow-500' : 'bg-rose-500'}`} 
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 line-clamp-3">{item.observation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DASHBOARD LAYOUT: FIXED HEIGHT ON DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch lg:h-[800px]">
        
        {/* Vulnerabilities Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-full flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Vulnerabilidades Críticas
          </h3>
          {/* Eliminado max-h para que llene el contenedor padre h-full */}
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
            {report.weaknesses.map((weakness, idx) => (
              <div key={idx} className="bg-slate-900/50 border-l-4 border-rose-500 p-4 rounded-r-lg group hover:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="font-medium text-rose-200 text-sm">{weakness.title}</h4>
                  <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded flex-shrink-0">
                    {weakness.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{weakness.description}</p>
                
                {/* Attack Vectors Section - RED TEAM */}
                {weakness.attackVectors && weakness.attackVectors.length > 0 && (
                  <div className="bg-rose-950/30 rounded-lg p-3 border border-rose-500/20 mt-3">
                    <p className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5" />
                      Vectores de Ataque (Red Team):
                    </p>
                    <ul className="space-y-1.5 pl-1">
                      {weakness.attackVectors.map((attack, aIdx) => (
                        <li key={aIdx} className="text-xs text-rose-200/80 flex items-start gap-2 font-mono">
                          <span className="text-rose-500 mt-0.5">{'>'}</span>
                          {attack}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mitigation Steps Section - BLUE TEAM */}
                {weakness.mitigationSteps && weakness.mitigationSteps.length > 0 && (
                  <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-500/20 mt-3">
                    <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Solución (Blue Team):
                    </p>
                    <ul className="space-y-1.5 pl-1">
                      {weakness.mitigationSteps.map((step, sIdx) => (
                        <li key={sIdx} className="text-xs text-emerald-200/80 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">●</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {report.weaknesses.length === 0 && (
              <p className="text-slate-500 italic">No se detectaron debilidades críticas evidentes.</p>
            )}
          </div>
        </div>

        {/* Right Column (Strengths + Recommendations) */}
        <div className="space-y-8 flex flex-col h-full min-h-0">
          
          {/* Strengths Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Fortalezas Detectadas
            </h3>
            <ul className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {report.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{strength}</span>
                </li>
              ))}
              {report.strengths.length === 0 && (
                <p className="text-slate-500 italic">No se detectaron fortalezas claras.</p>
              )}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Recomendaciones Clave
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm"
        >
          Analizar otro documento
        </button>
      </div>
    </div>
  );
};

export default AuditReportView;
