import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EnterpriseSecurityService } from '../../services/enterprise-security.service';
import { WafConfigService } from '../../services/waf-config.service';
import { SecurityMonitoringService } from '../../services/security-monitoring.service';
import { AdminGuard } from '../../shared/guards/admin.guard';

interface SecurityConfig {
  rateLimitEnabled: boolean;
  ddosProtectionEnabled: boolean;
  xssProtectionEnabled: boolean;
  sqlInjectionProtectionEnabled: boolean;
  geoBlockingEnabled: boolean;
  botDetectionEnabled: boolean;
  threatIntelligenceEnabled: boolean;
}

interface ThreatIntelligenceRequest {
  ip: string;
  reputation: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  categories: string[];
}

interface ComplianceFilter {
  period?: string;
  category?: string;
  status?: string;
  limit?: number;
}

@Controller('security')
@UseGuards(AdminGuard)
export class SecurityController {
  constructor(
    private enterpriseSecurity: EnterpriseSecurityService,
    private wafConfig: WafConfigService,
    private securityMonitoring: SecurityMonitoringService
  ) {}

  // Security Dashboard Overview
  @Get('dashboard')
  async getSecurityDashboard(): Promise<any> {
    const [
      securityReport,
      wafConfig,
      securityDashboard,
      complianceScore,
      recentAlerts,
      threatLevel
    ] = await Promise.all([
      this.enterpriseSecurity.generateSecurityReport('daily'),
      this.wafConfig.getWAFStatus(),
      this.securityMonitoring.getSecurityDashboard(),
      this.enterpriseSecurity.getComplianceScore(),
      this.enterpriseSecurity.getSecurityAlerts(10),
      this.securityMonitoring.getSecurityMetrics('24h')
    ]);

    return {
      overview: {
        securityStatus: securityReport,
        wafStatus: wafConfig,
        monitoringStatus: securityDashboard,
        threatLevel: threatLevel.threatLevel,
        complianceScore: complianceScore,
      },
      metrics: {
        totalEvents: threatLevel.totalEvents,
        criticalEvents: threatLevel.criticalEvents,
        intrusionAttempts: threatLevel.intrusionAttempts,
        blockedIPs: threatLevel.blockedIPs
      },
      recentAlerts,
      lastUpdated: new Date()
    };
  }

  // Security Configuration Management
  @Get('config')
  async getSecurityConfig(): Promise<SecurityConfig> {
    const securityStatus = await this.enterpriseSecurity.getSecurityStatus();
    
    return {
      rateLimitEnabled: true,
      ddosProtectionEnabled: true,
      xssProtectionEnabled: true,
      sqlInjectionProtectionEnabled: true,
      geoBlockingEnabled: true,
      botDetectionEnabled: true,
      threatIntelligenceEnabled: true
    };
  }

  @Put('config')
  async updateSecurityConfig(@Body() config: SecurityConfig) {
    // In production, this would update actual security configuration
    return {
      success: true,
      message: 'Security configuration updated',
      config,
      timestamp: new Date()
    };
  }

  // WAF Rules Management
  @Get('waf/rules')
  async getWAFrules(): Promise<any> {
    return await this.wafConfig.getWAFRules();
  }

  @Put('waf/rules/:ruleId')
  async updateWAFrules(
    @Param('ruleId') ruleId: string,
    @Body() updates: { enabled?: boolean; action?: 'block' | 'allow' | 'challenge' | 'monitor'; description?: string; priority?: number; caseSensitive?: boolean; matchType?: 'regex' | 'exact' | 'contains' | 'starts-with' | 'ends-with' }
  ): Promise<any> {
    const updatedRule = await this.wafConfig.updateWAFRule(ruleId, updates);
    return {
      success: true,
      message: `WAF rule ${ruleId} updated`,
      rule: updatedRule,
      timestamp: new Date()
    };
  }

  @Get('waf/metrics')
  async getWAFMetrics(): Promise<any> {
    return await this.wafConfig.getWAFMetrics();
  }

  @Get('waf/geo-blocking')
  async getGeoBlockingStatus(): Promise<any> {
    const status = await this.wafConfig.getWAFStatus();
    return {
      enabled: true,
      blockedCountries: status.geoBlockedCountries,
      totalBlocked: status.geoBlockedCountries.length
    };
  }

  @Put('waf/geo-blocking')
  async updateGeoBlocking(@Body() data: { countries: string[]; action: 'add' | 'remove' }) {
    // In production, this would update actual geo-blocking rules
    return {
      success: true,
      message: `Geo-blocking ${data.action}ed for countries: ${data.countries.join(', ')}`,
      blockedCountries: data.countries,
      timestamp: new Date()
    };
  }

  // Threat Intelligence Management
  @Get('threat-intelligence')
  async getThreatIntelligence(): Promise<any> {
    return await this.wafConfig.getThreatIntelligence();
  }

  @Post('threat-intelligence')
  async addThreatIntelligence(@Body() threatData: ThreatIntelligenceRequest) {
    await this.wafConfig.addThreatIntelligence(threatData);

    return {
      success: true,
      message: `Threat intelligence added for IP: ${threatData.ip}`,
      data: threatData,
      timestamp: new Date()
    };
  }

  @Delete('threat-intelligence/:ip')
  async removeThreatIntelligence(@Param('ip') ip: string) {
    // In production, this would remove from threat intelligence database
    return {
      success: true,
      message: `Threat intelligence removed for IP: ${ip}`,
      timestamp: new Date()
    };
  }

  // Security Events and Alerts
  @Get('events')
  async getSecurityEvents(@Query('limit') limit?: number, @Query('severity') severity?: string) {
    const events = await this.securityMonitoring.getSecurityAlerts(limit || 100);
    
    if (severity) {
      return events.filter(event => event.severity === severity);
    }
    
    return events;
  }

  @Get('events/:id')
  async getSecurityEvent(@Param('id') id: string) {
    const events = await this.securityMonitoring.getSecurityAlerts();
    const event = events.find(e => e.id === id);
    
    if (!event) {
      return { error: 'Security event not found' };
    }
    
    return event;
  }

  @Post('events/:id/resolve')
  async resolveSecurityEvent(
    @Param('id') id: string,
    @Body() data: { notes?: string; resolvedBy: string }
  ) {
    // In production, this would update the security event status in database
    return {
      success: true,
      message: `Security event ${id} marked as resolved`,
      resolvedBy: data.resolvedBy,
      notes: data.notes,
      timestamp: new Date()
    };
  }

  // Real-time Security Monitoring
  @Get('monitoring/status')
  async getMonitoringStatus(): Promise<any> {
    const status = await this.securityMonitoring.getSecurityStatus();
    return status;
  }

  @Get('monitoring/metrics')
  async getSecurityMetrics(): Promise<any> {
    return await this.securityMonitoring.getSecurityMetrics('24h');
  }

  @Get('monitoring/intrusion-patterns')
  async getIntrusionPatterns(): Promise<any> {
    // In production, this would return actual intrusion detection patterns
    return [
      {
        name: 'SQL Injection - Union Based',
        pattern: 'union select',
        severity: 'critical',
        category: 'sql_injection',
        action: 'block',
        description: 'Detects Union-based SQL injection attempts'
      },
      {
        name: 'SQL Injection - Time-based',
        pattern: 'sleep()/benchmark()',
        severity: 'critical',
        category: 'sql_injection',
        action: 'block',
        description: 'Detects time-based blind SQL injection'
      },
      {
        name: 'XSS - Script Injection',
        pattern: '<script>...</script>',
        severity: 'high',
        category: 'xss',
        action: 'block',
        description: 'Detects script injection attempts'
      },
      {
        name: 'Directory Traversal',
        pattern: '../',
        severity: 'high',
        category: 'path_traversal',
        action: 'block',
        description: 'Detects directory traversal attempts'
      }
    ];
  }

  // Compliance Reporting
  @Get('compliance/metrics')
  async getComplianceMetrics(): Promise<any> {
    return await this.securityMonitoring.getComplianceMetrics();
  }

  @Get('compliance/reports')
  async getComplianceReports(@Query() filters: ComplianceFilter) {
    const reports = await this.securityMonitoring.getComplianceReports(filters.limit || 10);
    
    if (filters.period) {
      return reports.filter(report => report.period === filters.period);
    }
    
    return reports;
  }

  @Get('compliance/reports/:id')
  async getComplianceReport(@Param('id') id: string) {
    const reports = await this.securityMonitoring.getComplianceReports(100);
    const report = reports.find(r => r.id === id);
    
    if (!report) {
      return { error: 'Compliance report not found' };
    }
    
    return report;
  }

  @Post('compliance/reports/generate')
  async generateComplianceReport(@Body() data: { period: 'daily' | 'weekly' | 'monthly' }) {
    // In production, this would trigger report generation
    return {
      success: true,
      message: `${data.period} compliance report generation initiated`,
      period: data.period,
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      timestamp: new Date()
    };
  }

  @Get('compliance/score')
  async getComplianceScore(): Promise<any> {
    const metrics = await this.securityMonitoring.getComplianceMetrics();
    const compliantMetrics = metrics.filter((m: any) => m.status === 'compliant').length;
    const totalMetrics = metrics.length;
    const score = Math.round((compliantMetrics / totalMetrics) * 100);

    return {
      overallScore: score,
      compliantMetrics,
      totalMetrics,
      breakdown: metrics.reduce((acc: any, metric: any) => {
        acc[metric.category] = acc[metric.category] || { compliant: 0, total: 0 };
        acc[metric.category].total++;
        if (metric.status === 'compliant') {
          acc[metric.category].compliant++;
        }
        return acc;
      }, {} as Record<string, { compliant: number; total: number }>),
      lastUpdated: new Date()
    };
  }

  // Security Analytics
  @Get('analytics/threat-trends')
  async getThreatTrends(@Query('period') period: string = '24h') {
    // In production, this would analyze historical threat data
    const periods = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };
    
    const hours = periods[period as keyof typeof periods] || 24;
    
    return {
      period,
      trends: {
        intrusionAttempts: Math.floor(Math.random() * 50) + 10,
        blockedIPs: Math.floor(Math.random() * 20) + 5,
        securityAlerts: Math.floor(Math.random() * 30) + 8,
        complianceViolations: Math.floor(Math.random() * 5) + 1
      },
      topThreats: [
        { type: 'SQL Injection', attempts: 45, percentage: 35 },
        { type: 'XSS Attempts', attempts: 32, percentage: 25 },
        { type: 'Brute Force', attempts: 28, percentage: 22 },
        { type: 'Directory Traversal', attempts: 23, percentage: 18 }
      ],
      geographicDistribution: [
        { country: 'United States', attempts: 156 },
        { country: 'China', attempts: 89 },
        { country: 'Russia', attempts: 67 },
        { country: 'Unknown', attempts: 45 }
      ],
      lastUpdated: new Date()
    };
  }

  @Get('analytics/security-score')
  async getSecurityScore(): Promise<any> {
    const metrics = await this.securityMonitoring.getSecurityMetrics('24h');
    
    // Calculate security score based on various factors
    const factors = {
      threatDetection: Math.min(100, 100 - (metrics.intrusionAttempts * 2)),
      incidentResponse: Math.min(100, 100 - (metrics.criticalEvents * 5)),
      compliance: metrics.complianceScore,
      systemSecurity: 95 // Would be calculated from security config
    };
    
    const overallScore = Math.round(
      Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length
    );

    return {
      overallScore,
      factors,
      grade: this.getSecurityGrade(overallScore),
      recommendations: this.getSecurityRecommendations(overallScore),
      lastUpdated: new Date()
    };
  }

  // Emergency Security Controls
  @Post('emergency/lockdown')
  async initiateEmergencyLockdown(@Body() data: { reason: string; duration: number }) {
    // In production, this would initiate emergency security measures
    return {
      success: true,
      message: 'Emergency lockdown initiated',
      reason: data.reason,
      duration: data.duration,
      actions: [
        'Blocking all non-admin access',
        'Increasing security monitoring',
        'Altering all active sessions',
        'Notifying security team'
      ],
      timestamp: new Date()
    };
  }

  @Post('emergency/unlock')
  async disableEmergencyLockdown(@Body() data: { reason: string; authorizedBy: string }) {
    // In production, this would disable emergency lockdown
    return {
      success: true,
      message: 'Emergency lockdown disabled',
      reason: data.reason,
      authorizedBy: data.authorizedBy,
      timestamp: new Date()
    };
  }

  @Post('emergency/block-ip')
  async emergencyBlockIP(@Body() data: { ip: string; reason: string; duration: number }) {
    // In production, this would block IP at firewall level
    return {
      success: true,
      message: `IP ${data.ip} blocked for ${data.duration} seconds`,
      ip: data.ip,
      reason: data.reason,
      timestamp: new Date()
    };
  }

  // Utility Methods
  private getSecurityGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  private getSecurityRecommendations(score: number): string[] {
    if (score >= 90) {
      return ['Security posture is excellent', 'Continue current security measures'];
    } else if (score >= 70) {
      return ['Review and strengthen weak areas', 'Update security configurations', 'Conduct security training'];
    } else {
      return ['Immediate security review required', 'Implement additional security measures', 'Consider security audit'];
    }
  }
}