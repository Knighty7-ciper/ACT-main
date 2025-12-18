export class GenerateReportDto {
  reportType: 'sar' | 'ctr' | 'monthly_summary' | 'quarterly_review';
  period?: {
    start: Date;
    end: Date;
  };
  filters?: any;
  adminId: string;
}