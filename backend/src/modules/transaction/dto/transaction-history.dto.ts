import { ApiProperty } from '@nestjs/swagger';

export class TransactionHistoryDto {
  @ApiProperty()
  transactions: any[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
