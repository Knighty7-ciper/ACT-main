import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  profileImage?: string;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  countryCode?: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  createdAt: Date;
}
