import { IsOptional, IsBoolean, IsString, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWalletDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1000.50, required: false })
  @IsOptional()
  balance?: number;
}
