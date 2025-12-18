import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AlertStatusUpdateDto {
  @ApiProperty({ 
    example: 'investigating', 
    enum: ['open', 'investigating', 'resolved', 'closed'],
    description: 'New status for the compliance alert'
  })
  @IsEnum(['open', 'investigating', 'resolved', 'closed'])
  status: 'open' | 'investigating' | 'resolved' | 'closed';

  @ApiProperty({ 
    example: 'Initial investigation completed, reviewing transaction patterns', 
    required: false,
    description: 'Notes about the status update'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    example: 'admin_123', 
    required: false,
    description: 'ID of admin making the update'
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ 
    example: '2025-10-31T01:09:05Z', 
    required: false,
    description: 'Timestamp of the update'
  })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}