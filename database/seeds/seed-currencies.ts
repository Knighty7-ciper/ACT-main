import { DataSource } from 'typeorm';
import { CurrencyEntity } from '../../backend/src/modules/currency/entities/currency.entity';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', countryCode: 'US' },
  { code: 'EUR', name: 'Euro', symbol: '€', countryCode: 'EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', countryCode: 'GB' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', countryCode: 'ZA' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', countryCode: 'NG' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', countryCode: 'KE' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', countryCode: 'GH' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', countryCode: 'EG' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', countryCode: 'MA' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', countryCode: 'TZ' },
];

export async function seedCurrencies(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(CurrencyEntity);

  for (const currency of currencies) {
    const exists = await repository.findOne({
      where: { code: currency.code },
    });

    if (!exists) {
      await repository.save(repository.create(currency));
      console.log(`Seeded currency: ${currency.code}`);
    }
  }
}
