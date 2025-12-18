import { Module } from '@nestjs/common';
import { ACTStellarService } from '../../services/act-stellar.service';
import { ACTStellarController } from '../../controllers/act-stellar.controller';

/**
 * ACT Stellar Module
 * 
 * Comprehensive module for African Currency Token (ACT) operations on Stellar blockchain.
 * Handles:
 * - ACT token creation and management
 * - User wallet creation with ACT trustlines
 * - P2P ACT transfers
 * - Admin treasury operations (issue/burn)
 * - Multi-signature treasury security
 * - Platform statistics and monitoring
 */
@Module({
  providers: [
    ACTStellarService,
  ],
  controllers: [
    ACTStellarController,
  ],
  exports: [
    ACTStellarService, // Export service for use in other modules
  ],
})
export class ACTStellarModule {
  // Module configuration complete
}