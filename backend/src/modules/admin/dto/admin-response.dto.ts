import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  adminLevel: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
