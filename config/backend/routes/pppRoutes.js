import express from 'express';
import { param, body, query } from 'express-validator';
import * as pppController from '../controllers/pppController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get PPP value for a specific country
router.get('/value/:countryCode', [
  param('countryCode').isLength({ min: 2, max: 3 }).isUpperCase()
], pppController.getPPPValue);

// Get global PPP comparison
router.get('/global', [
  query('limit').optional().isInt({ min: 1, max: 100 })
], pppController.getGlobalPPP);

// Get basket prices for comparison
router.get('/basket', [
  query('countries').notEmpty().withMessage('Countries parameter is required')
], pppController.getBasketComparison);

// Get exchange rates for swap functionality
router.get('/rates', pppController.getExchangeRates);

// Get stability ranking
router.get('/stability', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('region').optional().isIn(['all', 'americas', 'europe', 'asia', 'africa'])
], pppController.getStabilityRanking);

// Calculate token amount for basket value
router.post('/calculate', [
  body('countryCode').isLength({ min: 2, max: 3 }).isUpperCase(),
  body('basketValue').isFloat({ min: 0 })
], pppController.calculateTokenAmount);

// Get PPP history for a country
router.get('/history/:countryCode', [
  param('countryCode').isLength({ min: 2, max: 3 }).isUpperCase(),
  query('days').optional().isInt({ min: 1, max: 365 })
], pppController.getPPPHistory);

// Get current commodity prices for a country
router.get('/commodities/:countryCode', [
  param('countryCode').isLength({ min: 2, max: 3 }).isUpperCase()
], pppController.getCommodityPrices);

// Get all available countries
router.get('/countries', pppController.getAvailableCountries);

export default router;
