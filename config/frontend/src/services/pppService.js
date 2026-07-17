import api from './api';

class PPPService {
  // Get PPP value for a country
  async getPPPValue(countryCode) {
    return api.ppp.getValue(countryCode);
  }

  // Get global PPP comparison
  async getGlobalPPP() {
    return api.ppp.getGlobal();
  }

  // Get basket prices for comparison
  async getBasketPrices(countries) {
    return api.ppp.getBasketPrices(countries);
  }

  // Get commodity prices for a country
  async getCommodityPrices(countryCode) {
    return api.ppp.getCommodityPrices(countryCode);
  }

  // Get stability ranking
  async getStabilityRanking() {
    return api.ppp.getStabilityRanking();
  }

  // Calculate token amount for basket value
  async calculateTokenAmount(countryCode, basketValue) {
    const ppp = await this.getPPPValue(countryCode);
    return {
      basketValue,
      tokenAmount: basketValue / ppp.tokenValue,
      tokenValue: ppp.tokenValue,
      countryCode
    };
  }

  // Get transactions
  async getTransactions(walletAddress, limit = 10) {
    return api.transactions.getRecent(walletAddress, limit);
  }

  // Create transaction
  async createTransaction(transactionData) {
    const token = localStorage.getItem('accessToken');
    return api.transactions.create(token, transactionData);
  }

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get stability status color
  getStabilityColor(score) {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  // Get stability status label
  getStabilityStatus(score) {
    if (score >= 80) return 'Stable';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Unstable';
    return 'Critical';
  }
}

export default new PPPService();
