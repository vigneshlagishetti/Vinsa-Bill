import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database fix for orders table...')

    // SQL to add missing columns
    const addColumnsSQL = `
      -- Add missing customer detail columns
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos';
    `

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: addColumnsSQL
    })

    if (error) {
      console.error('Database fix error:', error)
      
      // Try alternative approach using individual queries
      const fixes = [
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0", 
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos'"
      ]

      const results = []
      for (const sql of fixes) {
        try {
          const { error: fixError } = await supabase.rpc('exec_sql', { sql })
          if (fixError) {
            results.push(`❌ ${sql}: ${fixError.message}`)
          } else {
            results.push(`✅ ${sql}: Success`)
          }
        } catch (err) {
          results.push(`❌ ${sql}: ${err}`)
        }
      }

      return NextResponse.json({
        success: false,
        error: error.message,
        individualResults: results,
        message: 'Some fixes may have succeeded. Check individual results.'
      })
    }

    // Verify the columns were added
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'orders')
      .eq('table_schema', 'public')

    if (columnsError) {
      console.warn('Could not verify columns:', columnsError)
    }

    return NextResponse.json({
      success: true,
      message: 'Database fix completed successfully!',
      columnsAdded: [
        'customer_address',
        'subtotal', 
        'tax_amount',
        'order_type'
      ],
      currentColumns: columns || []
    })

  } catch (error) {
    console.error('Database fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      manualFix: {
        message: 'You can run this SQL manually in your Supabase SQL Editor:',
        sql: `
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos';
        `
      }
    }, { status: 500 })
  }
}
