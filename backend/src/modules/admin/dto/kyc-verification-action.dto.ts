import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KYCVerificationActionDto {
  @ApiProperty({ 
    example: 'approve', 
    enum: ['approve', 'reject', 'request_additional_info'],
    description: 'Verification action to take'
  })
  @IsEnum(['approve', 'reject', 'request_additional_info'])
  action: 'approve' | 'reject' | 'request_additional_info';

  @ApiProperty({ 
    example: 'Document quality is clear and all information matches provided data', 
    required: false,
    description: 'Notes about the verification decision'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    example: 95, 
    required: false,
    description: 'Verification confidence score (0-100)'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  verificationScore?: number;

  @ApiProperty({ 
    example: 'admin_123', 
    required: false,
    description: 'ID of admin performing verification'
  })
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @ApiProperty({ 
    example: 'Image appears to be digitally altered', 
    required: false,
    description: 'Reason for rejection (required if action is reject)'
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ 
    example: ['Recent utility bill', 'Bank statement'], 
    required: false,
    description: 'Additional documents requested (required if action is request_additional_info)'
  })
  @IsOptional()
  @IsString({ each: true })
  additionalDocuments?: string[];
}