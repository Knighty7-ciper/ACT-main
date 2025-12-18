import { ApiProperty } from '@nestjs/swagger';

export class TransactionStatusDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  completedAt?: Date;
}
