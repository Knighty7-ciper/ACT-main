import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WafRuleDto {
  @ApiProperty({ 
    example: 'SQL Injection Protection', 
    description: 'Name of the WAF rule'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Protect against SQL injection attacks', 
    description: 'Description of the rule'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: 'sql_injection', 
    enum: ['sql_injection', 'xss', 'csrf', 'rate_limiting', 'ip_whitelist', 'ip_blacklist', 'custom'],
    description: 'Type of security threat this rule protects against'
  })
  @IsEnum(['sql_injection', 'xss', 'csrf', 'rate_limiting', 'ip_whitelist', 'ip_blacklist', 'custom'])
  type: 'sql_injection' | 'xss' | 'csrf' | 'rate_limiting' | 'ip_whitelist' | 'ip_blacklist' | 'custom';

  @ApiProperty({ 
    example: 'block', 
    enum: ['block', 'allow', 'monitor', 'challenge'],
    description: 'Action to take when rule is triggered'
  })
  @IsEnum(['block', 'allow', 'log', 'captcha', 'challenge'])
  action: 'block' | 'allow' | 'log' | 'captcha' | 'challenge';

  @ApiProperty({ 
    example: [ 
      'union select', 
      'drop table', 
      'script>', 
      'javascript:' 
    ],
    description: 'Patterns to match against'
  })
  @IsArray()
  @IsString({ each: true })
  patterns: string[];

  @ApiProperty({ 
    example: [ 
      'request_body', 
      'query_params', 
      'headers' 
    ],
    description: 'Parts of request to inspect'
  })
  @IsArray()
  @IsString({ each: true })
  targets: string[];

  @ApiProperty({ 
    example: true, 
    required: false,
    description: 'Whether the rule is enabled'
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ 
    example: { 
      caseSensitive: false, 
      regexEnabled: true 
    },
    required: false,
    description: 'Matching options for patterns'
  })
  @IsOptional()
  matchOptions?: Record<string, any>;

  @ApiProperty({ 
    example: 100, 
    required: false,
    description: 'Requests per minute limit for rate limiting rules'
  })
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @ApiProperty({ 
    example: [ 
      '192.168.1.0/24', 
      '10.0.0.0/8' 
    ],
    required: false,
    description: 'IP addresses or ranges for IP-based rules'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipAddresses?: string[];

  @ApiProperty({ 
    example: { 
      redirectUrl: '/blocked', 
      responseCode: 403 
    },
    required: false,
    description: 'Response configuration for blocked requests'
  })
  @IsOptional()
  responseConfig?: Record<string, any>;

  @ApiProperty({ 
    example: { 
      admin: 'admin@example.com', 
      slack: '#security-alerts' 
    },
    required: false,
    description: 'Notification settings for rule triggers'
  })
  @IsOptional()
  notifications?: Record<string, any>;

  @ApiProperty({ 
    example: 'admin_789', 
    required: false,
    description: 'ID of admin creating the rule'
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ 
    example: { 
      hitCount: 1547, 
      lastTriggered: '2025-10-30T15:30:00Z' 
    },
    required: false,
    description: 'Usage statistics for the rule'
  })
  @IsOptional()
  statistics?: Record<string, any>;
}