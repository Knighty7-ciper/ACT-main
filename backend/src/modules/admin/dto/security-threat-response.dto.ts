import { IsString, IsEnum, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SecurityThreatResponseDto {
  @ApiProperty({ 
    example: 'threat_123', 
    description: 'ID of the security threat'
  })
  @IsString()
  threatId: string;

  @ApiProperty({ 
    example: 'block_ip', 
    enum: ['block_ip', 'disable_account', 'escalate', 'monitor', 'investigate', 'whitelist'],
    description: 'Action to take in response to the threat'
  })
  @IsEnum(['block_ip', 'disable_account', 'escalate', 'monitor', 'investigate', 'whitelist'])
  action: 'block_ip' | 'disable_account' | 'escalate' | 'monitor' | 'investigate' | 'whitelist';

  @ApiProperty({ 
    example: '192.168.1.100', 
    required: false,
    description: 'Target IP address (required for IP blocking)'
  })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiProperty({ 
    example: 'user_456', 
    required: false,
    description: 'Target user ID (required for account actions)'
  })
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiProperty({ 
    example: 'Multiple failed login attempts from suspicious IP', 
    description: 'Reason for the security response'
  })
  @IsString()
  reason: string;

  @ApiProperty({ 
    example: 24, 
    required: false,
    description: 'Duration in hours for temporary actions'
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ 
    example: 'admin_789', 
    required: false,
    description: 'ID of admin taking the action'
  })
  @IsOptional()
  @IsString()
  performedBy?: string;

  @ApiProperty({ 
    example: ['security_team', 'compliance_officer'], 
    required: false,
    description: 'Additional recipients for escalation'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  escalateTo?: string[];

  @ApiProperty({ 
    example: { evidence: 'screenshot_123', logEntries: ['log_456'] }, 
    required: false,
    description: 'Supporting evidence for the response action'
  })
  @IsOptional()
  evidence?: Record<string, any>;
}