import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-here',
    description: 'Password reset token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'New password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
