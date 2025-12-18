import { IsString, IsArray, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ComplianceReportRequestDto {
  @ApiProperty({ 
    example: 'user_456', 
    required: false,
    description: 'User ID for SAR reports'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ 
    example: ['txn_123', 'txn_456', 'txn_789'], 
    description: 'Array of transaction IDs to include in report'
  })
  @IsArray()
  @IsString({ each: true })
  transactionIds: string[];

  @ApiProperty({ 
    example: 'Unusual transaction pattern detected - multiple large transfers to high-risk jurisdictions', 
    description: 'Reason for generating the report'
  })
  @IsString()
  reason: string;

  @ApiProperty({ 
    example: 10000.00, 
    required: false,
    description: 'Threshold amount for CTR reports (USD)'
  })
  @IsOptional()
  @IsNumber()
  thresholdAmount?: number;

  @ApiProperty({ 
    example: '2025-10-01', 
    required: false,
    description: 'Start date for report period'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    example: '2025-10-31', 
    required: false,
    description: 'End date for report period'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    example: 'admin_789', 
    required: false,
    description: 'ID of admin generating the report'
  })
  @IsOptional()
  @IsString()
  generatedBy?: string;
}