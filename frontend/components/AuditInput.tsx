import React, { useState, useRef } from 'react';
import { FileText, Search, Loader2, UploadCloud, X, FileType, GraduationCap, Briefcase } from 'lucide-react';
import { AuditInputData, AuditContext } from '../../types';

interface AuditInputProps {
  onAnalyze: (data: AuditInputData) => void;
  isAnalyzing: boolean;
}

const AuditInput: React.FC<AuditInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState<AuditContext>('enterprise'); // Por defecto Empresarial
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      processFile(file);
    } else if (text.trim().length > 20) {
      // Enviamos el contexto seleccionado junto con el texto
      onAnalyze({ type: 'text', content: text, context });
    }
  };

  const processFile = (fileToProcess: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      // Enviamos el contexto seleccionado junto con el archivo PDF
      onAnalyze({ type: 'pdf', content: base64Data, context });
    };
    reader.readAsDataURL(fileToProcess);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setText('');
      } else {
        alert("Por favor sube solo archivos PDF.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setText('');
      } else {
        alert("Solo se aceptan archivos PDF.");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadExample = () => {
    setFile(null);
    const example = `PLAN DE SEGURIDAD INFORMÁTICA - EMPRESA X
1. Control de Acceso: Todos los empleados deben tener usuario y contraseña. Las contraseñas se cambian anualmente.
2. Antivirus: Se instalará antivirus gratuito en los servidores.
3. Copias de Seguridad: Se harán copias manuales los viernes en un disco duro externo que guarda el gerente.
4. Red Wi-Fi: La contraseña es "12345678" para facilitar el acceso a invitados.`;
    setText(example);
  };

  const isButtonDisabled = isAnalyzing || (!file && text.trim().length < 20);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Auditoría de Planes de Seguridad</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Selecciona el enfoque, sube tu documento y obtén un análisis detallado con IA.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleTextSubmit} className="space-y-6">
          
          {/* Selector de Contexto (Universitario vs Empresarial) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setContext('university')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                context === 'university'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750 hover:border-slate-600'
              }`}
            >
              <GraduationCap className={`w-6 h-6 ${context === 'university' ? 'text-purple-400' : 'text-slate-500'}`} />
              <span className="font-medium text-sm">Proyecto Universitario</span>
            </button>
            <button
              type="button"
              onClick={() => setContext('enterprise')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                context === 'enterprise'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750 hover:border-slate-600'
              }`}
            >
              <Briefcase className={`w-6 h-6 ${context === 'enterprise' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="font-medium text-sm">Auditoría Empresarial</span>
            </button>
          </div>

          {/* Área de carga de archivos */}
          <div 
            className={`
              relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group
              ${isDragging 
                ? 'border-cyan-400 bg-cyan-400/10' 
                : file 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              disabled={isAnalyzing}
            />
            
            {file ? (
              <div className="flex items-center gap-4 w-full max-w-md bg-slate-800 p-4 rounded-lg border border-slate-700 relative z-10 shadow-lg">
                <div className="bg-rose-500/20 p-2 rounded text-rose-400">
                  <FileType className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="bg-slate-700/50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-slate-300 font-medium text-lg">Arrastra tu PDF aquí</p>
                <p className="text-slate-500 text-sm mt-1">o haz clic para explorar archivos</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <div className="h-px bg-slate-700 flex-1"></div>
            <span>O escribe manualmente</span>
            <div className="h-px bg-slate-700 flex-1"></div>
          </div>

          {/* Área de texto */}
          <div className="relative opacity-100 transition-opacity duration-300" style={{ opacity: file ? 0.5 : 1, pointerEvents: file ? 'none' : 'auto' }}>
            <textarea
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none font-mono text-sm disabled:opacity-50"
              placeholder={file ? "Archivo PDF seleccionado. Elimínalo para escribir texto." : "Pega aquí el texto del plan de seguridad..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isAnalyzing || !!file}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={loadExample}
              disabled={isAnalyzing || !!file}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Cargar ejemplo texto
            </button>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                ${isButtonDisabled
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {file ? 'Auditar PDF' : 'Auditar Texto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuditInput;