import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { typeormConfig } from '../config/typeorm.config';
import { UserEntity } from '../modules/user/entities/user.entity';
import { WalletEntity } from '../modules/wallet/entities/wallet.entity';
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';
import { CurrencyEntity } from '../modules/currency/entities/currency.entity';
import { CountryEntity } from '../modules/country/entities/country.entity';
import { ExchangeRateEntity } from '../modules/exchange-rate/entities/exchange-rate.entity';
import { RoleEntity } from '../modules/role/entities/role.entity';
import { AdminEntity } from '../modules/admin/entities/admin.entity';

// Load environment variables
config();

class DatabaseSeeder {
  private dataSource: DataSource;

  constructor() {
    const configOptions = typeormConfig() as DataSourceOptions;
    this.dataSource = new DataSource(configOptions);
  }

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      await this.dataSource.initialize();
      console.log('✅ Database connection established');

      await this.seedCurrencies();
      await this.seedCountries();
      await this.seedRoles();
      await this.seedAdminUser();
      await this.seedExchangeRates();

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    } finally {
      await this.dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }

  private async seedCurrencies() {
    console.log('💰 Seeding currencies...');
    
    const currencies = [
      { code: 'ACT', name: 'African Currency Token', symbol: 'ACT', isActive: true, description: 'Basket-backed stable token' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', isActive: true, description: 'Nigerian national currency' },
      { code: 'KES', name: 'Kenyan Shilling', symbol: 'Ksh', isActive: true, description: 'Kenyan national currency' },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R', isActive: true, description: 'South African national currency' },
      { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', isActive: true, description: 'Ghanaian national currency' },
      { code: 'USD', name: 'US Dollar', symbol: '$', isActive: true, description: 'United States dollar' },
      { code: 'EUR', name: 'Euro', symbol: '€', isActive: true, description: 'European Union currency' },
      { code: 'GBP', name: 'British Pound', symbol: '£', isActive: true, description: 'British pound sterling' }
    ];

    const currencyRepository = this.dataSource.getRepository(CurrencyEntity);
    
    for (const currency of currencies) {
      const existing = await currencyRepository.findOne({ where: { code: currency.code } });
      if (existing) {
        Object.assign(existing, currency);
        await currencyRepository.save(existing);
        console.log(`   🔄 Updated currency: ${currency.code}`);
      } else {
        const newCurrency = currencyRepository.create(currency);
        await currencyRepository.save(newCurrency);
        console.log(`   ➕ Created currency: ${currency.code}`);
      }
    }
  }

  private async seedCountries() {
    console.log('🌍 Seeding countries...');
    
    const countries = [
      { code: 'NG', name: 'Nigeria', region: 'Africa', subregion: 'Western Africa', currencyCode: 'NGN', phoneCode: '+234', isActive: true },
      { code: 'KE', name: 'Kenya', region: 'Africa', subregion: 'Eastern Africa', currencyCode: 'KES', phoneCode: '+254', isActive: true },
      { code: 'ZA', name: 'South Africa', region: 'Africa', subregion: 'Southern Africa', currencyCode: 'ZAR', phoneCode: '+27', isActive: true },
      { code: 'GH', name: 'Ghana', region: 'Africa', subregion: 'Western Africa', currencyCode: 'GHS', phoneCode: '+233', isActive: true }
    ];

    const countryRepository = this.dataSource.getRepository(CountryEntity);
    
    for (const country of countries) {
      const existing = await countryRepository.findOne({ where: { code: country.code } });
      if (existing) {
        Object.assign(existing, country);
        await countryRepository.save(existing);
        console.log(`   🔄 Updated country: ${country.code}`);
      } else {
        const newCountry = countryRepository.create(country);
        await countryRepository.save(newCountry);
        console.log(`   ➕ Created country: ${country.code}`);
      }
    }
  }

  private async seedRoles() {
    console.log('👥 Seeding roles...');
    
    const roles = [
      { id: '1', name: 'user', description: 'Regular user role', permissions: ['read_own_data'] },
      { id: '2', name: 'admin', description: 'Administrator role', permissions: ['admin_access'] },
      { id: '3', name: 'super_admin', description: 'Super administrator role', permissions: ['full_access'] }
    ];

    const roleRepository = this.dataSource.getRepository(RoleEntity);
    
    for (const role of roles) {
      const existing = await roleRepository.findOne({ where: { id: role.id } });
      if (existing) {
        Object.assign(existing, role);
        await roleRepository.save(existing);
        console.log(`   🔄 Updated role: ${role.name}`);
      } else {
        const newRole = roleRepository.create(role);
        await roleRepository.save(newRole);
        console.log(`   ➕ Created role: ${role.name}`);
      }
    }
  }

  private async seedAdminUser() {
    console.log('🔧 Seeding admin user...');
    
    const adminRepository = this.dataSource.getRepository(AdminEntity);
    
    // Admin users are now created dynamically through the auto-admin system
    // No hardcoded admin credentials for security
    console.log('   ➕ Auto-admin system active (bknglabs.dev@gmail.com)');
    } else {
      console.log('   ℹ️  Admin user already exists');
    }
  }

  private async seedExchangeRates() {
    console.log('💱 Seeding exchange rates...');
    
    const exchangeRateRepository = this.dataSource.getRepository(ExchangeRateEntity);
    
    const rates = [
      { 
        fromCurrency: 'NGN', 
        toCurrency: 'USD', 
        rate: 0.0012, 
        isActive: true, 
        source: 'system_seed' 
      },
      { 
        fromCurrency: 'KES', 
        toCurrency: 'USD', 
        rate: 0.0078, 
        isActive: true, 
        source: 'system_seed' 
      },
      { 
        fromCurrency: 'ZAR', 
        toCurrency: 'USD', 
        rate: 0.056, 
        isActive: true, 
        source: 'system_seed' 
      },
      { 
        fromCurrency: 'GHS', 
        toCurrency: 'USD', 
        rate: 0.068, 
        isActive: true, 
        source: 'system_seed' 
      }
    ];

    for (const rate of rates) {
      const existing = await exchangeRateRepository.findOne({ 
        where: { fromCurrency: rate.fromCurrency, toCurrency: rate.toCurrency } 
      });
      
      if (existing) {
        Object.assign(existing, rate);
        await exchangeRateRepository.save(existing);
        console.log(`   🔄 Updated rate: ${rate.fromCurrency}/${rate.toCurrency}`);
      } else {
        const newRate = exchangeRateRepository.create(rate);
        await exchangeRateRepository.save(newRate);
        console.log(`   ➕ Created rate: ${rate.fromCurrency}/${rate.toCurrency}`);
      }
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.seed()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default DatabaseSeeder;