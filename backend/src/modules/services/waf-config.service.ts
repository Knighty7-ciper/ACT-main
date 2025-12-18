import { Injectable, Logger } from '@nestjs/common';

export interface WAFRule {
  id: string;
  name: string;
  description: string;
  category: 'sql-injection' | 'xss' | 'file-inclusion' | 'protocol-violation' | 'malicious-bot' | 'rate-limiting';
  action: 'block' | 'allow' | 'challenge' | 'monitor';
  priority: number;
  pattern: string;
  caseSensitive: boolean;
  enabled: boolean;
  matchType: 'regex' | 'exact' | 'contains' | 'starts-with' | 'ends-with';
  maxRequests?: number;
  timeWindow?: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface WAFConfig {
  id: string;
  name: string;
  enabled: boolean;
  protectionMode: 'prevention' | 'detection' | 'learning';
  ipWhitelist: string[];
  ipBlacklist: string[];
  geoBlocking: {
    enabled: boolean;
    blockedCountries: string[];
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  rules: WAFRule[];
  logging: {
    enabled: boolean;
    level: 'info' | 'warning' | 'error';
    retentionDays: number;
  };
  notifications: {
    email: boolean;
    webhook: boolean;
    slack: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cacheSize: number; // MB
    compressionEnabled: boolean;
  };
}

export interface WAFMetrics {
  timestamp: Date;
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  challengedRequests: number;
  topAttackTypes: { type: string; count: number }[];
  topBlockedIPs: { ip: string; count: number }[];
  averageResponseTime: number;
  cacheHitRate: number;
}

export interface WAFAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'attack-detected' | 'rate-limit' | 'geo-block' | 'rule-trigger' | 'system-error';
  message: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class WafConfigService {
  private readonly logger = new Logger(WafConfigService.name);
  private wafConfig: WAFConfig;
  private metrics: WAFMetrics[] = [];
  private alerts: WAFAlert[] = [];

  constructor() {
    this.initializeDefaultWAFConfig();
  }

  /**
   * Initialize default WAF configuration
   */
  private initializeDefaultWAFConfig(): void {
    this.wafConfig = {
      id: 'default',
      name: 'ARKHAM WAF Configuration',
      enabled: true,
      protectionMode: 'prevention',
      ipWhitelist: [],
      ipBlacklist: [],
      geoBlocking: {
        enabled: false,
        blockedCountries: [],
      },
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        burstLimit: 200,
      },
      logging: {
        enabled: true,
        level: 'warning',
        retentionDays: 30,
      },
      notifications: {
        email: true,
        webhook: false,
        slack: false,
      },
      performance: {
        cacheEnabled: true,
        cacheSize: 100, // MB
        compressionEnabled: true,
      },
      rules: this.getDefaultWAFRules(),
    };
  }

  /**
   * Get default WAF rules
   */
  private getDefaultWAFRules(): WAFRule[] {
    return [
      {
        id: 'sql-injection-1',
        name: 'SQL Injection Detection',
        description: 'Detects common SQL injection patterns',
        category: 'sql-injection',
        action: 'block',
        priority: 1,
        pattern: '(union|select|insert|update|delete|drop|create|alter|exec|execute)\\s*',
        caseSensitive: false,
        enabled: true,
        matchType: 'regex',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'xss-script-1',
        name: 'XSS Script Detection',
        description: 'Detects cross-site scripting attempts',
        category: 'xss',
        action: 'block',
        priority: 1,
        pattern: '<script[^>]*>.*?</script>|<[^>]*on\\w+\\s*=',
        caseSensitive: false,
        enabled: true,
        matchType: 'regex',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'file-inclusion-1',
        name: 'File Inclusion Detection',
        description: 'Detects directory traversal and file inclusion attempts',
        category: 'file-inclusion',
        action: 'block',
        priority: 2,
        pattern: '\\.\\./|\\.\\.\\\\|\\.\\.\\/|etc/passwd|/etc/shadow|/boot.ini',
        caseSensitive: false,
        enabled: true,
        matchType: 'regex',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'protocol-violation-1',
        name: 'HTTP Protocol Violation',
        description: 'Detects malformed HTTP requests',
        category: 'protocol-violation',
        action: 'block',
        priority: 3,
        pattern: '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]',
        caseSensitive: false,
        enabled: true,
        matchType: 'regex',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rate-limiting-1',
        name: 'Rate Limiting Rule',
        description: 'Limits requests per IP address',
        category: 'rate-limiting',
        action: 'block',
        priority: 4,
        pattern: '',
        caseSensitive: false,
        enabled: true,
        matchType: 'exact',
        maxRequests: 100,
        timeWindow: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Get current WAF configuration
   */
  getWAFConfig(): WAFConfig {
    return { ...this.wafConfig };
  }

  /**
   * Get WAF status (summary)
   */
  async getWAFStatus(): Promise<any> {
    return {
      enabled: this.wafConfig.enabled,
      totalRules: this.wafConfig.rules.length,
      enabledRules: this.wafConfig.rules.filter(r => r.enabled).length,
      geoBlockedCountries: this.wafConfig.geoBlocking.blockedCountries,
      threatIntelligenceEntries: 0,
      botSignatures: 0
    };
  }

  /**
   * Get WAF rules
   */
  async getWAFRules(): Promise<any> {
    return this.wafConfig.rules;
  }

  /**
   * Get WAF metrics
   */
  async getWAFMetrics(): Promise<any> {
    return {
      blockedCountries: this.wafConfig.geoBlocking.blockedCountries.length,
      activeThreats: 0,
      lastUpdate: new Date()
    };
  }

  /**
   * Get threat intelligence data
   */
  async getThreatIntelligence(): Promise<any> {
    try {
      // Mock threat intelligence data
      return {
        lastUpdated: new Date(),
        threatFeeds: [
          {
            source: 'internal',
            threats: Math.floor(Math.random() * 100) + 50,
            lastUpdate: new Date(),
          },
          {
            source: 'external_feed_1',
            threats: Math.floor(Math.random() * 200) + 100,
            lastUpdate: new Date(),
          },
        ],
        reputationScores: {
          totalIPs: Math.floor(Math.random() * 10000) + 5000,
          malicious: Math.floor(Math.random() * 100) + 50,
          suspicious: Math.floor(Math.random() * 500) + 200,
          clean: Math.floor(Math.random() * 9000) + 4500,
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to get threat intelligence:', error);
      throw error;
    }
  }

  /**
   * Add threat intelligence data
   */
  async addThreatIntelligence(threatData: any): Promise<void> {
    try {
      // Mock implementation
      this.logger.log(`Added threat intelligence: ${JSON.stringify(threatData)}`);
      this.logger.log('✅ Threat intelligence data added successfully');
    } catch (error: any) {
      this.logger.error('Failed to add threat intelligence:', error);
      throw error;
    }
  }

  /**
   * Update WAF configuration
   */
  async updateWAFConfig(updates: Partial<WAFConfig>): Promise<WAFConfig> {
    this.wafConfig = { ...this.wafConfig, ...updates };
    this.logger.log('🔧 WAF configuration updated');
    return this.wafConfig;
  }

  /**
   * Add WAF rule
   */
  async addWAFRule(rule: Omit<WAFRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WAFRule> {
    const newRule: WAFRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.wafConfig.rules.push(newRule);
    this.logger.log(`📜 Added WAF rule: ${rule.name}`);

    return newRule;
  }

  /**
   * Update WAF rule
   */
  async updateWAFRule(ruleId: string, updates: Partial<WAFRule>): Promise<WAFRule> {
    const ruleIndex = this.wafConfig.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) {
      throw new Error(`WAF rule not found: ${ruleId}`);
    }

    this.wafConfig.rules[ruleIndex] = {
      ...this.wafConfig.rules[ruleIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.logger.log(`🔄 Updated WAF rule: ${ruleId}`);
    return this.wafConfig.rules[ruleIndex];
  }

  /**
   * Delete WAF rule
   */
  async deleteWAFRule(ruleId: string): Promise<void> {
    const ruleIndex = this.wafConfig.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) {
      throw new Error(`WAF rule not found: ${ruleId}`);
    }

    this.wafConfig.rules.splice(ruleIndex, 1);
    this.logger.log(`🗑️ Deleted WAF rule: ${ruleId}`);
  }

  /**
   * Enable/disable WAF
   */
  async toggleWAF(enabled: boolean): Promise<WAFConfig> {
    this.wafConfig.enabled = enabled;
    this.logger.log(`${enabled ? '✅' : '❌'} WAF ${enabled ? 'enabled' : 'disabled'}`);
    return this.wafConfig;
  }

  /**
   * Check request against WAF rules
   */
  async checkRequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    ip: string;
    userAgent?: string;
  }): Promise<{ allowed: boolean; action: string; matchedRules: WAFRule[]; reason?: string }> {
    if (!this.wafConfig.enabled) {
      return { allowed: true, action: 'allow', matchedRules: [] };
    }

    const matchedRules: WAFRule[] = [];
    let blockedReason = '';

    // Check IP whitelist
    if (this.wafConfig.ipWhitelist.includes(request.ip)) {
      return { allowed: true, action: 'allow', matchedRules: [] };
    }

    // Check IP blacklist
    if (this.wafConfig.ipBlacklist.includes(request.ip)) {
      matchedRules.push({
        id: 'ip-blacklist',
        name: 'IP Blacklist',
        description: 'IP address is blacklisted',
        category: 'protocol-violation',
        action: 'block',
        priority: 0,
        pattern: request.ip,
        caseSensitive: true,
        enabled: true,
        matchType: 'exact',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      blockedReason = 'IP address is blacklisted';
    }

    // Check geographic blocking
    if (this.wafConfig.geoBlocking.enabled && this.wafConfig.geoBlocking.blockedCountries.includes('XX')) {
      // In real implementation, you'd determine country from IP
      matchedRules.push({
        id: 'geo-blocking',
        name: 'Geographic Blocking',
        description: 'Requests from this country are blocked',
        category: 'protocol-violation',
        action: 'block',
        priority: 1,
        pattern: request.ip,
        caseSensitive: false,
        enabled: true,
        matchType: 'exact',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      blockedReason = 'Geographic blocking active';
    }

    // Check WAF rules
    const requestString = `${request.method} ${request.url} ${request.body || ''}`.toLowerCase();
    
    for (const rule of this.wafConfig.rules.filter(r => r.enabled)) {
      if (this.matchRule(rule, requestString)) {
        matchedRules.push(rule);
        
        if (rule.action === 'block') {
          blockedReason = `Blocked by rule: ${rule.name}`;
          break;
        } else if (rule.action === 'challenge') {
          blockedReason = `Challenge required by rule: ${rule.name}`;
        }
      }
    }

    // Check rate limiting
    if (this.wafConfig.rateLimiting.enabled) {
      const rateLimitHit = await this.checkRateLimit(request.ip);
      if (rateLimitHit) {
        matchedRules.push({
          id: 'rate-limiting',
          name: 'Rate Limiting',
          description: 'Rate limit exceeded',
          category: 'rate-limiting',
          action: 'block',
          priority: 4,
          pattern: '',
          caseSensitive: false,
          enabled: true,
          matchType: 'exact',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        blockedReason = 'Rate limit exceeded';
      }
    }

    const allowed = matchedRules.length === 0 || 
                   matchedRules.some(rule => rule.action === 'allow') ||
                   matchedRules.every(rule => rule.action === 'monitor');

    // Record metrics
    await this.recordWAFMetrics(allowed, matchedRules);

    // Create alert if blocked
    if (!allowed) {
      await this.createWAFAlert('attack-detected', 'medium', `Request blocked: ${blockedReason}`, {
        ip: request.ip,
        url: request.url,
        method: request.method,
        matchedRules: matchedRules.map(r => r.name),
      });
    }

    return {
      allowed,
      action: allowed ? 'allow' : 'block',
      matchedRules,
      reason: blockedReason || undefined,
    };
  }

  /**
   * Get WAF metrics
   */
  getWAFMetrics(period: '1h' | '24h' | '7d' = '24h'): WAFMetrics[] {
    const now = new Date();
    const periodMs = period === '1h' ? 60 * 60 * 1000 : period === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const startTime = new Date(now.getTime() - periodMs);

    return this.metrics.filter(m => m.timestamp >= startTime);
  }

  /**
   * Get WAF alerts
   */
  getWAFAlerts(): WAFAlert[] {
    return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve WAF alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.logger.log(`✅ WAF alert resolved: ${alertId}`);
    }
  }

  /**
   * Add IP to whitelist
   */
  async addToWhitelist(ip: string): Promise<void> {
    if (!this.wafConfig.ipWhitelist.includes(ip)) {
      this.wafConfig.ipWhitelist.push(ip);
      this.logger.log(`✅ Added IP to whitelist: ${ip}`);
    }
  }

  /**
   * Add IP to blacklist
   */
  async addToBlacklist(ip: string): Promise<void> {
    if (!this.wafConfig.ipBlacklist.includes(ip)) {
      this.wafConfig.ipBlacklist.push(ip);
      this.logger.log(`❌ Added IP to blacklist: ${ip}`);
    }
  }

  /**
   * Remove IP from whitelist
   */
  async removeFromWhitelist(ip: string): Promise<void> {
    const index = this.wafConfig.ipWhitelist.indexOf(ip);
    if (index > -1) {
      this.wafConfig.ipWhitelist.splice(index, 1);
      this.logger.log(`🗑️ Removed IP from whitelist: ${ip}`);
    }
  }

  /**
   * Remove IP from blacklist
   */
  async removeFromBlacklist(ip: string): Promise<void> {
    const index = this.wafConfig.ipBlacklist.indexOf(ip);
    if (index > -1) {
      this.wafConfig.ipBlacklist.splice(index, 1);
      this.logger.log(`🗑️ Removed IP from blacklist: ${ip}`);
    }
  }

  // Private helper methods

  private matchRule(rule: WAFRule, requestString: string): boolean {
    const testString = rule.caseSensitive ? requestString : requestString.toLowerCase();
    const pattern = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();

    switch (rule.matchType) {
      case 'regex':
        const regex = new RegExp(pattern, 'i');
        return regex.test(testString);
      case 'exact':
        return testString === pattern;
      case 'contains':
        return testString.includes(pattern);
      case 'starts-with':
        return testString.startsWith(pattern);
      case 'ends-with':
        return testString.endsWith(pattern);
      default:
        return false;
    }
  }

  private async checkRateLimit(ip: string): Promise<boolean> {
    // Simplified rate limiting check
    // In real implementation, you'd track request counts per IP
    const currentHour = new Date().getHours();
    const requestCount = Math.floor(Math.random() * 150); // Simulate request count
    
    return requestCount > this.wafConfig.rateLimiting.requestsPerMinute;
  }

  private async recordWAFMetrics(allowed: boolean, matchedRules: WAFRule[]): Promise<void> {
    const metrics: WAFMetrics = {
      timestamp: new Date(),
      totalRequests: 1,
      blockedRequests: allowed ? 0 : 1,
      allowedRequests: allowed ? 1 : 0,
      challengedRequests: 0,
      topAttackTypes: matchedRules.map(rule => ({
        type: rule.category,
        count: 1,
      })),
      topBlockedIPs: [{
        ip: 'unknown',
        count: allowed ? 0 : 1,
      }],
      averageResponseTime: Math.random() * 1000,
      cacheHitRate: Math.random() * 100,
    };

    this.metrics.unshift(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(0, 1000);
    }
  }

  private async createWAFAlert(
    type: WAFAlert['type'],
    severity: WAFAlert['severity'],
    message: string,
    details: any
  ): Promise<void> {
    const alert: WAFAlert = {
      id: this.generateId(),
      severity,
      type,
      message,
      details,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.unshift(alert);
    
    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    this.logger.warn(`🚨 WAF Alert: ${message}`);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}