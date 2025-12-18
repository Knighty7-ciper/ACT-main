import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { AddUserKYCFields1730353456000 } from './migrations/1730353456000-AddUserKYCFields';
import { CreateComplianceAlertsTable1730353460000 } from './migrations/1730353460000-CreateComplianceAlertsTable';
import { CreateComplianceEventsTable1730353465000 } from './migrations/1730353465000-CreateComplianceEventsTable';
import { CreateKYCDocumentsTable1730353470000 } from './migrations/1730353470000-CreateKYCDocumentsTable';
import { EnhanceComplianceReportsTable1730353475000 } from './migrations/1730353475000-EnhanceComplianceReportsTable';
import { CreateAdminAccessTable1734486000000 } from './migrations/1734486000000-CreateAdminAccessTable';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const dataSource = app.get(DataSource);
    
    console.log('Starting Phase 7 Compliance migrations...');
    
    // Run migrations in order
    console.log('1. Running AddUserKYCFields migration...');
    await dataSource.runMigrations([AddUserKYCFields1730353456000]);
    console.log('✅ User KYC fields added successfully');
    
    console.log('2. Running CreateComplianceAlertsTable migration...');
    await dataSource.runMigrations([CreateComplianceAlertsTable1730353460000]);
    console.log('✅ Compliance alerts table created successfully');
    
    console.log('3. Running CreateComplianceEventsTable migration...');
    await dataSource.runMigrations([CreateComplianceEventsTable1730353465000]);
    console.log('✅ Compliance events table created successfully');
    
    console.log('4. Running CreateKYCDocumentsTable migration...');
    await dataSource.runMigrations([CreateKYCDocumentsTable1730353470000]);
    console.log('✅ KYC documents table created successfully');
    
    console.log('5. Running EnhanceComplianceReportsTable migration...');
    await dataSource.runMigrations([EnhanceComplianceReportsTable1730353475000]);
    console.log('✅ Compliance reports table enhanced successfully');
    
    console.log('6. Running CreateAdminAccessTable migration...');
    await dataSource.runMigrations([CreateAdminAccessTable1734486000000]);
    console.log('✅ Admin access table created successfully');
    
    console.log('🎉 All migrations completed successfully!');
    console.log('');
    console.log('Database schema updated with:');
    console.log('  • 48 new KYC compliance fields added to users table');
    console.log('  • compliance_alerts table created (97 fields)');
    console.log('  • compliance_events table created (90 fields)');
    console.log('  • kyc_documents table created (116 fields)');
    console.log('  • compliance_reports table enhanced (118 fields)');
    console.log('  • admin_access table created (secret admin access system)');
    console.log('');
    console.log('Phase 7: Compliance Madness + Secret Admin Access is ready!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

runMigrations().catch(console.error);