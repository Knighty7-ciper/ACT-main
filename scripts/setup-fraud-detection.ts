import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runFraudDetectionSetup() {
  console.log('Setting up fraud detection database schema...\n')

  try {
    // Read the fraud detection schema
    const schemaPath = join(__dirname, '../database/schema/19_fraud_detection.sql')
    const sql = readFileSync(schemaPath, 'utf-8')
    
    console.log('Running fraud detection schema migration...')
    
    // Execute the SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()

    if (error) {
      console.error('Error creating fraud detection schema:', error)
      return false
    }

    console.log('✓ Fraud detection schema created successfully!')

    // Verify tables were created
    console.log('\nVerifying fraud detection tables...')
    
    const tables = ['fraud_alerts', 'user_risk_profiles', 'transaction_risk_analysis', 'fraud_patterns', 'transaction_monitoring_rules']
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ Table ${table} might not exist or error: ${error.message}`)
      } else {
        console.log(`✅ Table ${table} exists`)
      }
    }

    console.log('\n🎉 Fraud detection system setup completed!')
    console.log('\nThe system now supports:')
    console.log('  • Real-time transaction fraud analysis')
    console.log('  • User risk profiling')
    console.log('  • Automated fraud alert generation')
    console.log('  • Pattern-based fraud detection')
    console.log('  • Geographic and behavioral risk assessment')

    return true
    
  } catch (error) {
    console.error('Setup failed:', error)
    return false
  }
}

// Run if called directly
if (require.main === module) {
  runFraudDetectionSetup().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export { runFraudDetectionSetup }