export enum RiskLevel {
  CRITICAL = "CRITICO",
  HIGH = "ALTO",
  MEDIUM = "MEDIO",
  LOW = "BAJO",
  SAFE = "SEGURO"
}

export interface AuditIssue {
  title: string;
  description: string;
  severity: string;
  attackVectors: string[];
  mitigationSteps: string[]; // Nuevo campo para pasos de mitigación
}

export interface CategoryAnalysis {
  category: string;
  score: number;
  status: 'Optimizado' | 'Aceptable' | 'Deficiente' | 'Crítico';
  observation: string;
}

export interface AuditReport {
  overallScore: number;
  riskLevel: RiskLevel;
  executiveSummary: string;
  complianceAlignment: string;
  detailedAnalysis: CategoryAnalysis[];
  strengths: string[];
  weaknesses: AuditIssue[];
  recommendations: string[];
}

export type AuditContext = 'university' | 'enterprise';

export interface AuditInputData {
  type: 'text' | 'pdf';
  content: string;
  context: AuditContext;
}

// Nueva interfaz para cumplir con el requisito de "Estructura de Base de Datos"
// Incluye ID, Timestamp (fecha) y los datos del reporte.
export interface AuditRecord {
  id: string;
  timestamp: number; // Requisito de la rúbrica
  fileName?: string; // Nombre del archivo o "Texto Manual"
  context: AuditContext;
  report: AuditReport;
}

export interface AuditState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  report: AuditReport | null;
  error: string | null;
}