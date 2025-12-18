export class ExportAuditTrailDto {
  format: 'csv' | 'json' | 'pdf';
  filters?: any;
  adminId: string;
}