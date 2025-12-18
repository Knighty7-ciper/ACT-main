export class UpdateAlertStatusDto {
  status: 'open' | 'investigating' | 'resolved' | 'escalated' | 'false_positive';
  notes?: string;
}