import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: true,
    description: 'Whether email verification is required',
    required: false,
  })
  @IsBoolean()
  emailVerificationRequired?: boolean;
}
