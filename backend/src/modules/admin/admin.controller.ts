import { 
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Query, Patch, BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

// Import additional services for enhanced admin capabilities
import { ComplianceAuditService } from '../../services/compliance-audit.service';
import { AMLTransactionMonitorService } from '../../services/aml-transaction-monitor.service';
import { RegulatoryReportingService } from '../../services/regulatory-reporting.service';
import { KYCVerificationService } from '../../services/kyc-verification.service';
import { SystemAutomationService } from '../automation/services/system-automation.service';
import { PerformanceMonitorService } from '../automation/services/performance-monitor.service';
import { MaintenanceSchedulerService } from '../automation/services/maintenance-scheduler.service';
import { SelfHealingSystemService } from '../automation/services/self-healing-system.service';
import { EnterpriseSecurityService } from '../../services/enterprise-security.service';
import { WafConfigService } from '../../services/waf-config.service';
import { SecurityMonitoringService } from '../../services/security-monitoring.service';
import { FraudDetectionService } from '../../modules/fraud-detection/fraud-detection.service';
// import { RiskAssessmentService } from '../fraud-detection/services/risk-assessment.service';

// Import additional entities
import { ComplianceAlertEntity } from '../../entities/compliance-alert.entity';
import { ComplianceEventEntity } from '../../entities/compliance-event.entity';
import { ComplianceReportEntity } from '../../entities/compliance-report.entity';
import { KYCDocumentEntity } from '../../entities/kyc-document.entity';
import { SystemHealthEntity } from '../../entities/system-health.entity';
import { PerformanceMetricEntity } from '../../entities/performance-metric.entity';
import { SecurityEventEntity } from '../../entities/security-event.entity';
import { FraudAlert } from '../../modules/fraud-detection/entities/fraud-alert.entity';
import { UserRiskProfile } from '../../modules/fraud-detection/entities/user-risk-profile.entity';
import { TransactionRiskAnalysis } from '../../modules/fraud-detection/entities/transaction-risk-analysis.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { TransactionEntity } from '../../modules/transaction/entities/transaction.entity';

// Import DTOs for new endpoints
import { AlertStatusUpdateDto } from './dto/alert-status-update.dto';
import { ComplianceReportRequestDto } from './dto/compliance-report-request.dto';
import { KYCVerificationActionDto } from './dto/kyc-verification-action.dto';
import { BulkOperationDto } from './dto/bulk-operation.dto';
import { SecurityThreatResponseDto } from './dto/security-threat-response.dto';
import { MaintenanceTaskDto } from './dto/maintenance-task.dto';
import { HealingRuleDto } from './dto/healing-rule.dto';
import { WafRuleDto } from './dto/waf-rule.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly complianceAuditService: ComplianceAuditService,
    private readonly amlTransactionMonitorService: AMLTransactionMonitorService,
    private readonly regulatoryReportingService: RegulatoryReportingService,
    private readonly kycVerificationService: KYCVerificationService,
    private readonly systemAutomationService: SystemAutomationService,
    private readonly performanceMonitorService: PerformanceMonitorService,
    private readonly maintenanceSchedulerService: MaintenanceSchedulerService,
    private readonly selfHealingSystemService: SelfHealingSystemService,
    private readonly enterpriseSecurityService: EnterpriseSecurityService,
    private readonly wafConfigService: WafConfigService,
    private readonly securityMonitoringService: SecurityMonitoringService,
    private readonly fraudDetectionService: FraudDetectionService,
    // private readonly riskAssessmentService: RiskAssessmentService,
  ) {}

  // === EXISTING BASIC ADMIN ENDPOINTS ===

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all admins (Super admin only)' })
  @ApiResponse({ status: 200, description: 'Admins retrieved' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adminService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin found', type: AdminResponseDto })
  async findOne(@Param('id') id: string): Promise<AdminResponseDto> {
    return this.adminService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create admin (Super admin only)' })
  @ApiResponse({ status: 201, description: 'Admin created', type: AdminResponseDto })
  async create(@Body() createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    return this.adminService.create(createAdminDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin (Super admin only)' })
  @ApiResponse({ status: 200, description: 'Admin updated', type: AdminResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<AdminResponseDto> {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete admin (Super admin only)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.adminService.remove(id);
  }

  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate admin' })
  @ApiResponse({ status: 200, description: 'Admin deactivated', type: AdminResponseDto })
  async deactivate(@Param('id') id: string): Promise<AdminResponseDto> {
    return this.adminService.deactivate(id);
  }

  // === COMPLIANCE MANAGEMENT ENDPOINTS ===

  @Get('compliance/alerts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance alerts' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'investigating', 'resolved', 'closed'] })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'alertType', required: false })
  @ApiResponse({ status: 200, description: 'Compliance alerts retrieved' })
  async getComplianceAlerts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('alertType') alertType?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (severity) filters.severity = severity;
    if (alertType) filters.alertType = alertType;
    
    return this.amlTransactionMonitorService.getAlerts(page, limit, filters);
  }

  @Get('compliance/alerts/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance alert by ID' })
  @ApiResponse({ status: 200, description: 'Alert details retrieved' })
  async getComplianceAlert(@Param('id') id: string): Promise<ComplianceAlertEntity> {
    return this.amlTransactionMonitorService.getAlertById(id);
  }

  @Put('compliance/alerts/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update compliance alert status' })
  @ApiResponse({ status: 200, description: 'Alert status updated' })
  async updateAlertStatus(
    @Param('id') id: string,
    @Body() updateDto: AlertStatusUpdateDto
  ) {
    return this.amlTransactionMonitorService.updateAlertStatus(id, updateDto.status, updateDto.notes);
  }

  @Post('compliance/reports/sar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate Suspicious Activity Report (SAR)' })
  @ApiResponse({ status: 201, description: 'SAR report generated' })
  async generateSAR(@Body() reportRequest: ComplianceReportRequestDto) {
    if (!reportRequest.userId || !reportRequest.transactionIds || !reportRequest.reason) {
      throw new Error('Missing required fields: userId, transactionIds, or reason');
    }
    
    return this.regulatoryReportingService.generateSAR(
      reportRequest.userId,
      reportRequest.transactionIds,
      reportRequest.reason,
      req.admin?.id || 'system' // Get current admin ID from request context
    );
  }

  @Post('compliance/reports/ctr')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate Currency Transaction Report (CTR)' })
  @ApiResponse({ status: 201, description: 'CTR report generated' })
  async generateCTR(@Body() reportRequest: ComplianceReportRequestDto) {
    if (!reportRequest.transactionIds || reportRequest.thresholdAmount === undefined) {
      throw new Error('Missing required fields: transactionIds or thresholdAmount');
    }
    
    return this.regulatoryReportingService.generateCTR(
      reportRequest.transactionIds,
      reportRequest.thresholdAmount,
      req.admin?.id || 'system' // Get current admin ID from request context
    );
  }

  @Get('compliance/reports')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance reports' })
  @ApiQuery({ name: 'reportType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Compliance reports retrieved' })
  async getComplianceReports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('reportType') reportType?: string,
    @Query('status') status?: string,
  ) {
    return this.regulatoryReportingService.getReports(page, limit, { reportType, status } as any);
  }

  @Get('compliance/kyc/documents')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KYC documents for verification' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected', 'expired'] })
  @ApiQuery({ name: 'documentType', required: false })
  @ApiResponse({ status: 200, description: 'KYC documents retrieved' })
  async getKYCDocuments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.kycVerificationService.getPendingDocuments(page, limit, { status, documentType });
  }

  @Put('compliance/kyc/documents/:id/verify')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject KYC document' })
  @ApiResponse({ status: 200, description: 'KYC document verification completed' })
  async verifyKYCDocument(
    @Param('id') documentId: string,
    @Body() action: KYCVerificationActionDto
  ) {
    return this.kycVerificationService.verifyDocument(
      documentId,
      action.action,
      action.notes,
      action.verificationScore
    );
  }

  @Get('compliance/audit/events')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance audit events' })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Audit events retrieved' })
  async getAuditEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.complianceAuditService.getAuditEvents(page, limit, {
      eventType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // === AUTOMATION & SYSTEM HEALTH ENDPOINTS ===

  @Get('automation/health')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health metrics retrieved' })
  async getSystemHealth(): Promise<SystemHealthEntity[]> {
    return this.selfHealingSystemService.assessSystemHealth();
  }

  @Post('automation/health/refresh')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually refresh system health check' })
  @ApiResponse({ status: 200, description: 'System health check initiated' })
  async refreshSystemHealth(): Promise<any> {
    return this.systemAutomationService.monitorSystemHealth();
  }

  @Get('automation/performance')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiQuery({ name: 'period', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'metricName', required: false })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  async getPerformanceMetrics(
    @Query('period') period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('metricName') metricName?: string,
  ) {
    const periodMap = {
      'hourly': 'hour',
      'daily': 'day', 
      'weekly': 'week',
      'monthly': 'month'
    } as const;
    
    return this.performanceMonitorService.generatePerformanceReport(periodMap[period] || 'day');
  }

  @Post('automation/maintenance/tasks')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create maintenance task' })
  @ApiResponse({ status: 201, description: 'Maintenance task created' })
  async createMaintenanceTask(@Body() taskDto: MaintenanceTaskDto) {
    return this.maintenanceSchedulerService.scheduleMaintenanceTask({
      name: taskDto.name,
      description: taskDto.description,
      type: taskDto.type as any,
      schedule: taskDto.schedule,
      priority: taskDto.priority || 'medium',
      enabled: true
    });
  }

  @Get('automation/maintenance/tasks')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get maintenance tasks' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'running', 'completed', 'failed'] })
  @ApiResponse({ status: 200, description: 'Maintenance tasks retrieved' })
  async getMaintenanceTasks(@Query('status') status?: string) {
    return this.maintenanceSchedulerService.getMaintenanceTasks();
  }

  @Post('automation/maintenance/tasks/:id/execute')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute maintenance task manually' })
  @ApiResponse({ status: 200, description: 'Maintenance task executed' })
  async executeMaintenanceTask(@Param('id') taskId: string) {
    return this.maintenanceSchedulerService.executeTask(taskId);
  }

  @Get('automation/healing/rules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get self-healing rules' })
  @ApiResponse({ status: 200, description: 'Healing rules retrieved' })
  async getHealingRules(): Promise<any> {
    return this.selfHealingSystemService.getHealingRules();
  }

  @Post('automation/healing/rules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create self-healing rule' })
  @ApiResponse({ status: 201, description: 'Healing rule created' })
  async createHealingRule(@Body() ruleDto: HealingRuleDto) {
    return this.selfHealingSystemService.createHealingRule({
      name: ruleDto.name,
      description: ruleDto.description,
      condition: JSON.stringify(ruleDto.triggerConditions),
      action: JSON.stringify(ruleDto.actions),
      priority: 'medium',
      cooldown: 300, // 5 minutes
      enabled: true
    });
  }

  @Post('automation/healing/scan')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger system healing scan' })
  @ApiResponse({ status: 200, description: 'Healing scan initiated' })
  async triggerHealingScan(): Promise<any> {
    const health = await this.selfHealingSystemService.assessSystemHealth();
    return this.selfHealingSystemService.detectSystemIssues(health);
  }

  // === SECURITY MANAGEMENT ENDPOINTS ===

  @Get('security/events')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security events' })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Security events retrieved' })
  async getSecurityEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('severity') severity?: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.securityMonitoringService.getSecurityEvents(page, limit, {
      severity,
      eventType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Post('security/threats/respond')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Respond to security threat' })
  @ApiResponse({ status: 200, description: 'Threat response initiated' })
  async respondToThreat(@Body() responseDto: SecurityThreatResponseDto) {
    return this.enterpriseSecurityService.respondToThreat({
      type: 'security_threat',
      severity: 'high',
      source: responseDto.target || 'manual',
      target: responseDto.target,
      description: responseDto.reason,
      action: responseDto.action,
    });
  }

  @Get('security/waf/rules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get WAF rules' })
  @ApiResponse({ status: 200, description: 'WAF rules retrieved' })
  async getWafRules(): Promise<any> {
    return this.wafConfigService.getWAFRules();
  }

  @Post('security/waf/rules')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create WAF rule' })
  @ApiResponse({ status: 201, description: 'WAF rule created' })
  async createWafRule(@Body() ruleDto: WafRuleDto) {
    return this.wafConfigService.createRule(ruleDto);
  }

  @Put('security/waf/rules/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update WAF rule' })
  @ApiResponse({ status: 200, description: 'WAF rule updated' })
  async updateWafRule(@Param('id') ruleId: string, @Body() ruleDto: WafRuleDto) {
    return this.wafConfigService.updateWAFRule(ruleId, ruleDto);
  }

  @Delete('security/waf/rules/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete WAF rule' })
  async deleteWafRule(@Param('id') ruleId: string) {
    return this.wafConfigService.deleteRule(ruleId);
  }

  @Post('security/compliance/audit')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run compliance audit' })
  @ApiQuery({ name: 'framework', required: true, enum: ['ISO27001', 'PCI-DSS', 'GDPR', 'SOX'] })
  @ApiResponse({ status: 200, description: 'Compliance audit completed' })
  async runComplianceAudit(@Query('framework') framework: 'ISO27001' | 'PCI-DSS' | 'GDPR' | 'SOX') {
    return this.enterpriseSecurityService.enforceCompliance(framework);
  }

  @Get('security/incidents')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security incidents' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'investigating', 'resolved', 'closed'] })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiResponse({ status: 200, description: 'Security incidents retrieved' })
  async getSecurityIncidents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.securityMonitoringService.getIncidents(page, limit, { status, severity });
  }

  // === FRAUD DETECTION ENDPOINTS ===

  @Get('fraud/alerts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fraud alerts' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'investigating', 'resolved', 'false_positive'] })
  @ApiQuery({ name: 'riskLevel', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiResponse({ status: 200, description: 'Fraud alerts retrieved' })
  async getFraudAlerts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
  ) {
    return this.fraudDetectionService.getAlerts(page, limit, { status, riskLevel });
  }

  @Put('fraud/alerts/:id/investigate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Investigate fraud alert' })
  @ApiResponse({ status: 200, description: 'Fraud investigation completed' })
  async investigateFraudAlert(@Param('id') alertId: string, @Body() investigationNotes: any) {
    return this.fraudDetectionService.investigateAlert(alertId, investigationNotes);
  }



  @Get('fraud/analytics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fraud analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiResponse({ status: 200, description: 'Fraud analytics retrieved' })
  async getFraudAnalytics(@Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    return this.fraudDetectionService.generateAnalytics(period);
  }

  // === BULK OPERATIONS ENDPOINTS ===

  @Post('bulk/users/kyc-approval')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk approve KYC for users' })
  @ApiResponse({ status: 200, description: 'Bulk KYC approval completed' })
  async bulkApproveKYC(@Body() bulkOperation: BulkOperationDto) {
    if (!bulkOperation.userIds || bulkOperation.userIds.length === 0) {
      throw new BadRequestException('User IDs are required for bulk approval');
    }
    return this.kycVerificationService.bulkApproveDocuments(bulkOperation.userIds);
  }

  @Post('bulk/users/kyc-rejection')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk reject KYC for users' })
  @ApiResponse({ status: 200, description: 'Bulk KYC rejection completed' })
  async bulkRejectKYC(@Body() bulkOperation: BulkOperationDto) {
    if (!bulkOperation.userIds || bulkOperation.userIds.length === 0) {
      throw new BadRequestException('User IDs are required for bulk rejection');
    }
    if (!bulkOperation.reason) {
      throw new BadRequestException('Reason is required for bulk rejection');
    }
    return this.kycVerificationService.bulkRejectDocuments(bulkOperation.userIds, bulkOperation.reason);
  }

  @Post('bulk/alerts/resolve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk resolve compliance alerts' })
  @ApiResponse({ status: 200, description: 'Bulk alert resolution completed' })
  async bulkResolveAlerts(@Body() bulkOperation: BulkOperationDto) {
    if (!bulkOperation.alertIds || bulkOperation.alertIds.length === 0) {
      throw new BadRequestException('Alert IDs are required for bulk resolution');
    }
    return this.amlTransactionMonitorService.bulkResolveAlerts(bulkOperation.alertIds, bulkOperation.action || 'resolve');
  }

  @Post('bulk/transactions/review')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk review transactions' })
  @ApiResponse({ status: 200, description: 'Bulk transaction review completed' })
  async bulkReviewTransactions(@Body() bulkOperation: BulkOperationDto) {
    if (!bulkOperation.transactionIds || bulkOperation.transactionIds.length === 0) {
      throw new BadRequestException('Transaction IDs are required for bulk review');
    }
    return this.fraudDetectionService.bulkReviewTransactions(bulkOperation.transactionIds, bulkOperation.action || 'review');
  }

  // === ADVANCED ANALYTICS ENDPOINTS ===

  @Get('analytics/revenue')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'currency', required: false })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved' })
  async getRevenueAnalytics(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('currency') currency?: string,
  ) {
    const periodMap = {
      'daily': 'day',
      'weekly': 'week', 
      'monthly': 'month'
    } as const;
    
    // Get revenue analytics from transaction data
    const revenueData = await this.getRevenueAnalytics(period, currency);
    return {
      success: true,
      data: {
        period: period,
        currency: currency,
        totalRevenue: revenueData.total || 0,
        revenueGrowth: revenueData.growth || 0,
        transactionCount: revenueData.count || 0,
        periodRevenue: revenueData.periodBreakdown || []
      },
      timestamp: new Date()
    };
  }

  @Get('analytics/compliance-trends')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance trends' })
  @ApiQuery({ name: 'period', required: false, enum: ['weekly', 'monthly', 'quarterly'] })
  @ApiResponse({ status: 200, description: 'Compliance trends retrieved' })
  async getComplianceTrends(@Query('period') period: 'weekly' | 'monthly' | 'quarterly' = 'weekly') {
    return this.complianceAuditService.generateTrendsReport(period);
  }

  @Get('analytics/security-overview')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security overview dashboard' })
  @ApiQuery({ name: 'period', required: false, enum: ['hourly', 'daily', 'weekly'] })
  @ApiResponse({ status: 200, description: 'Security overview retrieved' })
  async getSecurityOverview(@Query('period') period: 'hourly' | 'daily' | 'weekly' = 'daily') {
    return this.securityMonitoringService.generateSecurityReport(period);
  }

  @Get('analytics/system-performance')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system performance analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiResponse({ status: 200, description: 'System performance analytics retrieved' })
  async getSystemPerformanceAnalytics(@Query('period') period: 'hour' | 'day' | 'week' | 'month' = 'day') {
    return this.performanceMonitorService.generatePerformanceReport(period);
  }

  @Get('analytics/kpi-dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KPI dashboard data' })
  @ApiResponse({ status: 200, description: 'KPI dashboard data retrieved' })
  async getKPIDashboard(): Promise<any> {
    // Comprehensive dashboard combining all systems
    const [healthMetrics, securityMetrics, complianceMetrics, fraudMetrics] = await Promise.all([
      this.selfHealingSystemService.assessSystemHealth(),
      this.securityMonitoringService.generateSecurityReport('daily'),
      this.complianceAuditService.generateTrendsReport('weekly'),
      this.fraudDetectionService.generateAnalytics('daily'),
    ]);

    return {
      systemHealth: healthMetrics,
      securityStatus: securityMetrics,
      complianceStatus: complianceMetrics,
      fraudStatus: fraudMetrics,
      timestamp: new Date(),
    };
  }

  // === USER MANAGEMENT ENHANCEMENTS ===

  @Get('users/requests')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user assistance requests' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'in_progress', 'resolved', 'closed'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'urgent'] })
  @ApiResponse({ status: 200, description: 'User requests retrieved' })
  async getUserRequests(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.adminService.getUserRequests(page, limit, { status, priority });
  }

  @Put('users/requests/:id/assign')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign user request to admin' })
  @ApiResponse({ status: 200, description: 'Request assigned successfully' })
  async assignUserRequest(@Param('id') requestId: string, @Body() assignment: any) {
    return this.adminService.assignUserRequest(requestId, assignment.adminId);
  }

  @Put('users/requests/:id/resolve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve user request' })
  @ApiResponse({ status: 200, description: 'Request resolved successfully' })
  async resolveUserRequest(@Param('id') requestId: string, @Body() resolution: any) {
    return this.adminService.resolveUserRequest(requestId, resolution);
  }

  @Get('users/summary')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users summary statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getUsersSummary(): Promise<any> {
    return this.adminService.getUsersSummary();
  }

  @Get('transactions/summary')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transactions summary statistics' })
  @ApiResponse({ status: 200, description: 'Transaction statistics retrieved' })
  async getTransactionsSummary(): Promise<any> {
    return this.adminService.getTransactionsSummary();
  }

  /**
   * Get admin access question (no auth required)
   */
  @Get('admin-access/question')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get admin access question' })
  @ApiResponse({ status: 200, description: 'Admin access question retrieved' })
  async getAdminAccessQuestion() {
    return this.adminService.getAdminAccessQuestion();
  }

  /**
   * Validate admin access answer (no auth required)
   */
  @Post('admin-access/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate admin access answer' })
  @ApiResponse({ status: 200, description: 'Admin access validated' })
  async validateAdminAccess(@Body() body: { answer: string }) {
    return this.adminService.validateAdminAccess(body.answer);
  }

  /**
   * Get revenue analytics data
   */
  private async getRevenueAnalytics(period: string, currency?: string): Promise<{
    total: number;
    growth: number;
    count: number;
    periodBreakdown: any[];
  }> {
    // TODO: This would integrate with the existing transaction service
    // For now, return structured data with placeholder values
    return {
      total: 0,
      growth: 0,
      count: 0,
      periodBreakdown: []
    };
  }
}