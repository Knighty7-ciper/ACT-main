import { IsString, IsEnum, IsOptional, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MaintenanceTaskDto {
  @ApiProperty({ 
    example: 'Database Optimization', 
    description: 'Name of the maintenance task'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Perform weekly database optimization and index rebuilding', 
    description: 'Description of the maintenance task'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: 'maintenance', 
    enum: ['backup', 'optimization', 'cleanup', 'security_scan', 'update', 'maintenance'],
    description: 'Type of maintenance task'
  })
  @IsEnum(['backup', 'optimization', 'cleanup', 'security_scan', 'update', 'maintenance'])
  type: 'backup' | 'optimization' | 'cleanup' | 'security_scan' | 'update' | 'maintenance';

  @ApiProperty({ 
    example: 'medium', 
    enum: ['low', 'medium', 'high', 'critical'],
    required: false,
    description: 'Priority level of the maintenance task'
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ 
    example: '0 2 * * 0', 
    description: 'Cron expression for scheduling (e.g., weekly on Sunday at 2 AM)'
  })
  @IsString()
  schedule: string;

  @ApiProperty({ 
    example: false, 
    required: false,
    description: 'Whether the task is enabled'
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ 
    example: { 
      database: 'production', 
      tables: ['users', 'transactions'], 
      optimizationLevel: 'full' 
    },
    required: false,
    description: 'Configuration parameters for the task'
  })
  @IsOptional()
  config?: Record<string, any>;

  @ApiProperty({ 
    example: { 
      email: 'admin@example.com', 
      slack: '#alerts' 
    },
    required: false,
    description: 'Notification settings for task completion/failure'
  })
  @IsOptional()
  notifications?: Record<string, any>;

  @ApiProperty({ 
    example: '2025-11-01T02:00:00Z', 
    required: false,
    description: 'Next execution time'
  })
  @IsOptional()
  @IsDateString()
  nextRun?: string;

  @ApiProperty({ 
    example: 'admin_789', 
    required: false,
    description: 'ID of admin creating the task'
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ 
    example: { 
      timeout: 3600, 
      retries: 3, 
      rollbackPlan: true 
    },
    required: false,
    description: 'Execution settings and timeout configuration'
  })
  @IsOptional()
  executionSettings?: Record<string, any>;
}