import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created', type: WalletResponseDto })
  async create(
    @Body() createWalletDto: CreateWalletDto,
    @Req() request: Request & { user?: { userId: string } },
  ): Promise<WalletResponseDto> {
    const userId = request.user?.userId || '';
    return this.walletService.create(userId, createWalletDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wallets for user' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved', type: [WalletResponseDto] })
  async findAll(@Req() request: Request & { user?: { userId: string } }): Promise<WalletResponseDto[]> {
    const userId = request.user?.userId || '';
    return this.walletService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, description: 'Wallet found', type: WalletResponseDto })
  async findOne(@Param('id') id: string): Promise<WalletResponseDto> {
    return this.walletService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update wallet' })
  @ApiResponse({ status: 200, description: 'Wallet updated', type: WalletResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateWalletDto: UpdateWalletDto,
  ): Promise<WalletResponseDto> {
    return this.walletService.update(id, updateWalletDto);
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify wallet' })
  @ApiResponse({ status: 200, description: 'Wallet verified', type: WalletResponseDto })
  async verify(@Param('id') id: string): Promise<WalletResponseDto> {
    return this.walletService.verify(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete wallet' })
  @ApiResponse({ status: 204, description: 'Wallet deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.walletService.delete(id);
  }
}
