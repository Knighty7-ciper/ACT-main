import { IsArray, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkOperationDto {
  @ApiProperty({ 
    example: ['user_123', 'user_456', 'user_789'], 
    description: 'Array of user IDs for KYC operations'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiProperty({ 
    example: ['alert_123', 'alert_456'], 
    description: 'Array of alert IDs for alert operations'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alertIds?: string[];

  @ApiProperty({ 
    example: ['txn_123', 'txn_456'], 
    description: 'Array of transaction IDs for transaction operations'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transactionIds?: string[];

  @ApiProperty({ 
    example: 'Bulk approval based on compliance review', 
    description: 'Reason for bulk operation'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ 
    example: 'approve', 
    enum: ['approve', 'reject', 'investigate', 'resolve', 'review'],
    required: false,
    description: 'Action to perform on bulk items'
  })
  @IsOptional()
  @IsEnum(['approve', 'reject', 'investigate', 'resolve', 'review'])
  action?: 'approve' | 'reject' | 'investigate' | 'resolve' | 'review';

  @ApiProperty({ 
    example: 'admin_789', 
    required: false,
    description: 'ID of admin performing bulk operation'
  })
  @IsOptional()
  @IsString()
  performedBy?: string;

  @ApiProperty({ 
    example: { verificationLevel: 'enhanced', notes: 'Verified through automated checks' }, 
    required: false,
    description: 'Additional metadata for the bulk operation'
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ 
    example: false, 
    required: false,
    description: 'Whether to send notifications to affected users'
  })
  @IsOptional()
  sendNotifications?: boolean;
}