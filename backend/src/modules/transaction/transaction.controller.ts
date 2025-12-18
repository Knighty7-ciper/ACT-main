import { Controller, Get, Post, Put, Param, Body, UseGuards, HttpCode, HttpStatus, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created',
    type: TransactionResponseDto,
  })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() request: Request & { user?: { userId: string } },
  ): Promise<TransactionResponseDto> {
    const userId = request.user?.userId || '';
    return this.transactionService.create(userId, createTransactionDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  async getHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() request: Request & { user?: { userId: string } },
  ) {
    const userId = request.user?.userId || '';
    return this.transactionService.getHistory(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found', type: TransactionResponseDto })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionService.findOne(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get transaction status' })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  async getStatus(@Param('id') id: string) {
    return this.transactionService.getStatus(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated', type: TransactionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.update(id, updateTransactionDto);
  }
}
