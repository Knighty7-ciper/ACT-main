import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'moderator' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Moderator role with limited admin access', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['news:create', 'news:edit', 'users:view'], required: false })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}
