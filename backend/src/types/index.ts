export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface UserContext {
  userId: string;
  email: string;
  role: string;
}

export interface JsonData {
  [key: string]: any;
}

export interface RiskFactor {
  type: string;
  score: number;
  description: string;
  details?: JsonData;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  TRANSFER = 'transfer',
  EXCHANGE = 'exchange',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

// Automation and System Health Types
export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  type: 'backup' | 'cleanup' | 'optimization' | 'update' | 'security' | 'maintenance';
  enabled: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  schedule: string; // cron expression
  lastRun?: Date;
  nextRun?: Date;
  duration?: number; // in milliseconds
  result?: any;
  error?: string;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  status: 'good' | 'warning' | 'critical';
  lastChecked: Date;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface HealingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerConditions: any[];
  healingActions: any[];
  cooldownPeriod: number; // in minutes
  maxAttempts: number;
  successRate: number;
  triggerCount: number;
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  data?: any;
}

export interface AutomationSchedule {
  id: string;
  name: string;
  type: 'maintenance' | 'backup' | 'cleanup' | 'report' | 'optimization';
  cronExpression: string;
  enabled: boolean;
  status: 'active' | 'paused' | 'error';
  lastRun?: Date;
  nextRun?: Date;
  result?: any;
}
