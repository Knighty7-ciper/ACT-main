import { DataSource } from 'typeorm';
import { CountryEntity } from '../../backend/src/modules/country/entities/country.entity';

const countries = [
  { code: 'ZA', name: 'South Africa', region: 'Africa', subregion: 'Southern Africa', currencyCode: 'ZAR', phoneCode: '+27' },
  { code: 'NG', name: 'Nigeria', region: 'Africa', subregion: 'West Africa', currencyCode: 'NGN', phoneCode: '+234' },
  { code: 'KE', name: 'Kenya', region: 'Africa', subregion: 'East Africa', currencyCode: 'KES', phoneCode: '+254' },
  { code: 'GH', name: 'Ghana', region: 'Africa', subregion: 'West Africa', currencyCode: 'GHS', phoneCode: '+233' },
  { code: 'EG', name: 'Egypt', region: 'Africa', subregion: 'North Africa', currencyCode: 'EGP', phoneCode: '+20' },
  { code: 'MA', name: 'Morocco', region: 'Africa', subregion: 'North Africa', currencyCode: 'MAD', phoneCode: '+212' },
  { code: 'TZ', name: 'Tanzania', region: 'Africa', subregion: 'East Africa', currencyCode: 'TZS', phoneCode: '+255' },
  { code: 'UG', name: 'Uganda', region: 'Africa', subregion: 'East Africa', currencyCode: 'UGX', phoneCode: '+256' },
  { code: 'ET', name: 'Ethiopia', region: 'Africa', subregion: 'East Africa', currencyCode: 'ETB', phoneCode: '+251' },
  { code: 'CM', name: 'Cameroon', region: 'Africa', subregion: 'Central Africa', currencyCode: 'XAF', phoneCode: '+237' },
];

export async function seedCountries(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(CountryEntity);

  for (const country of countries) {
    const exists = await repository.findOne({
      where: { code: country.code },
    });

    if (!exists) {
      await repository.save(repository.create(country));
      console.log(`Seeded country: ${country.code}`);
    }
  }
}
