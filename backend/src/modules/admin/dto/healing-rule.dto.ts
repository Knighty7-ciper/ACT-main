import { IsString, IsEnum, IsOptional, IsArray, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HealingRuleDto {
  @ApiProperty({ 
    example: 'High Database Latency Recovery', 
    description: 'Name of the healing rule'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Automatically resolve high database latency issues', 
    description: 'Description of what the rule does'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: 'high_latency', 
    enum: ['high_latency', 'memory_overflow', 'service_down', 'error_spike', 'connection_issue'],
    description: 'Type of issue this rule addresses'
  })
  @IsEnum(['high_latency', 'memory_overflow', 'service_down', 'error_spike', 'connection_issue'])
  issueType: 'high_latency' | 'memory_overflow' | 'service_down' | 'error_spike' | 'connection_issue';

  @ApiProperty({ 
    example: { 
      databaseLatency: 2000, 
      duration: 300 
    },
    description: 'Conditions that trigger the healing rule'
  })
  @IsObject()
  triggerConditions: Record<string, any>;

  @ApiProperty({ 
    example: [ 
      'refresh_connection_pool', 
      'clear_cache', 
      'restart_slow_queries' 
    ],
    description: 'Actions to take when rule is triggered'
  })
  @IsArray()
  @IsString({ each: true })
  actions: string[];

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
      maxAttempts: 3, 
      delayBetweenAttempts: 60, 
      escalationAfter: 3 
    },
    required: false,
    description: 'Configuration for retry attempts and escalation'
  })
  @IsOptional()
  retryConfig?: Record<string, any>;

  @ApiProperty({ 
    example: { 
      admin: 'admin@example.com', 
      slack: '#system-alerts' 
    },
    required: false,
    description: 'Notification settings for rule triggers'
  })
  @IsOptional()
  notifications?: Record<string, any>;

  @ApiProperty({ 
    example: { 
      requireApproval: false, 
      autoExecute: true 
    },
    required: false,
    description: 'Execution policy for the healing rule'
  })
  @IsOptional()
  executionPolicy?: Record<string, any>;

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
      successRate: 85, 
      avgResolutionTime: 120 
    },
    required: false,
    description: 'Performance metrics for this rule'
  })
  @IsOptional()
  performance?: Record<string, any>;
}