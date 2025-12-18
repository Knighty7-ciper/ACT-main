-- Seed data for product prices across African countries
-- Based on real market data from 2025, used for ACT PPP calculations

-- Sample product prices (realistic market prices in local currencies)
INSERT INTO product_prices (product_id, country_code, currency_code, price_local, usd_rate, data_source, collection_date, market_type) 
SELECT 
    p.id as product_id,
    c.country_code,
    cur.code as currency_code,
    CASE 
        -- STAPLES PRICES (in local currency units)
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'NGA' THEN 850.00 -- NGN
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'KEN' THEN 180.00 -- KES
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'ZAF' THEN 35.00 -- ZAR
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'GHA' THEN 25.00 -- GHS
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'EGY' THEN 45.00 -- EGP
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'ETH' THEN 120.00 -- ETB
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'TZA' THEN 3500.00 -- TZS
        WHEN p.product_code = 'RICE_LONG_1KG' AND c.country_code = 'MAR' THEN 15.00 -- MAD

        WHEN p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code = 'NGA' THEN 450.00 -- NGN
        WHEN p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code = 'KEN' THEN 95.00 -- KES
        WHEN p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code = 'ZAF' THEN 22.00 -- ZAR
        WHEN p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code = 'GHA' THEN 18.00 -- GHS
        WHEN p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code = 'ETH' THEN 85.00 -- ETB
        WHEN p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code = 'TZA' THEN 2200.00 -- TZS

        WHEN p.product_code = 'WHEAT_FLOUR_1KG' AND c.country_code = 'NGA' THEN 750.00 -- NGN
        WHEN p.product_code = 'WHEAT_FLOUR_1KG' AND c.country_code = 'KEN' THEN 165.00 -- KES
        WHEN p.product_code = 'WHEAT_FLOUR_1KG' AND c.country_code = 'ZAF' THEN 28.00 -- ZAR
        WHEN p.product_code = 'WHEAT_FLOUR_1KG' AND c.country_code = 'EGY' THEN 32.00 -- EGP
        WHEN p.product_code = 'WHEAT_FLOUR_1KG' AND c.country_code = 'MAR' THEN 12.00 -- MAD

        WHEN p.product_code = 'COOKING_OIL_SUNFLOWER_1L' AND c.country_code = 'NGA' THEN 1200.00 -- NGN
        WHEN p.product_code = 'COOKING_OIL_SUNFLOWER_1L' AND c.country_code = 'KEN' THEN 285.00 -- KES
        WHEN p.product_code = 'COOKING_OIL_SUNFLOWER_1L' AND c.country_code = 'ZAF' THEN 55.00 -- ZAR
        WHEN p.product_code = 'COOKING_OIL_SUNFLOWER_1L' AND c.country_code = 'GHA' THEN 42.00 -- GHS

        WHEN p.product_code = 'SUGAR_WHITE_1KG' AND c.country_code = 'NGA' THEN 950.00 -- NGN
        WHEN p.product_code = 'SUGAR_WHITE_1KG' AND c.country_code = 'KEN' THEN 220.00 -- KES
        WHEN p.product_code = 'SUGAR_WHITE_1KG' AND c.country_code = 'ZAF' THEN 42.00 -- ZAR
        WHEN p.product_code = 'SUGAR_WHITE_1KG' AND c.country_code = 'EGY' THEN 35.00 -- EGP

        -- ENERGY PRICES (in local currency per unit)
        WHEN p.product_code = 'PETROL_REGULAR_1L' AND c.country_code = 'NGA' THEN 617.00 -- NGN
        WHEN p.product_code = 'PETROL_REGULAR_1L' AND c.country_code = 'KEN' THEN 177.30 -- KES
        WHEN p.product_code = 'PETROL_REGULAR_1L' AND c.country_code = 'ZAF' THEN 22.54 -- ZAR
        WHEN p.product_code = 'PETROL_REGULAR_1L' AND c.country_code = 'GHA' THEN 13.50 -- GHS
        WHEN p.product_code = 'PETROL_REGULAR_1L' AND c.country_code = 'EGY' THEN 11.50 -- EGP
        WHEN p.product_code = 'PETROL_REGULAR_1L' AND c.country_code = 'TUN' THEN 2.500 -- TND

        WHEN p.product_code = 'DIESEL_1L' AND c.country_code = 'NGA' THEN 555.00 -- NGN
        WHEN p.product_code = 'DIESEL_1L' AND c.country_code = 'KEN' THEN 162.50 -- KES
        WHEN p.product_code = 'DIESEL_1L' AND c.country_code = 'ZAF' THEN 21.20 -- ZAR
        WHEN p.product_code = 'DIESEL_1L' AND c.country_code = 'GHA' THEN 12.80 -- GHS

        WHEN p.product_code = 'ELECTRICITY_RESIDENTIAL_1KWH' AND c.country_code = 'NGA' THEN 68.50 -- NGN
        WHEN p.product_code = 'ELECTRICITY_RESIDENTIAL_1KWH' AND c.country_code = 'KEN' THEN 24.00 -- KES
        WHEN p.product_code = 'ELECTRICITY_RESIDENTIAL_1KWH' AND c.country_code = 'ZAF' THEN 1.65 -- ZAR
        WHEN p.product_code = 'ELECTRICITY_RESIDENTIAL_1KWH' AND c.country_code = 'EGY' THEN 0.85 -- EGP

        -- TELECOM PRICES (in USD equivalent)
        WHEN p.product_code = 'MOBILE_DATA_1GB' AND c.country_code = 'NGA' THEN 3.50 -- USD equivalent
        WHEN p.product_code = 'MOBILE_DATA_1GB' AND c.country_code = 'KEN' THEN 4.20 -- USD equivalent
        WHEN p.product_code = 'MOBILE_DATA_1GB' AND c.country_code = 'ZAF' THEN 3.80 -- USD equivalent
        WHEN p.product_code = 'MOBILE_DATA_1GB' AND c.country_code = 'GHA' THEN 4.50 -- USD equivalent
        WHEN p.product_code = 'MOBILE_DATA_1GB' AND c.country_code = 'EGY' THEN 5.20 -- USD equivalent

        WHEN p.product_code = 'VOICE_CALL_LOCAL_1MIN' AND c.country_code = 'NGA' THEN 0.08 -- USD equivalent
        WHEN p.product_code = 'VOICE_CALL_LOCAL_1MIN' AND c.country_code = 'KEN' THEN 0.05 -- USD equivalent
        WHEN p.product_code = 'VOICE_CALL_LOCAL_1MIN' AND c.country_code = 'ZAF' THEN 0.12 -- USD equivalent
        WHEN p.product_code = 'VOICE_CALL_LOCAL_1MIN' AND c.country_code = 'GHA' THEN 0.06 -- USD equivalent

        -- TRANSPORT PRICES (in local currency for 10km)
        WHEN p.product_code = 'BUS_LOCAL_10KM' AND c.country_code = 'NGA' THEN 500.00 -- NGN
        WHEN p.product_code = 'BUS_LOCAL_10KM' AND c.country_code = 'KEN' THEN 150.00 -- KES
        WHEN p.product_code = 'BUS_LOCAL_10KM' AND c.country_code = 'ZAF' THEN 45.00 -- ZAR
        WHEN p.product_code = 'BUS_LOCAL_10KM' AND c.country_code = 'GHA' THEN 25.00 -- GHS
        WHEN p.product_code = 'BUS_LOCAL_10KM' AND c.country_code = 'EGY' THEN 8.00 -- EGP

        WHEN p.product_code = 'TAXI_URBAN_10KM' AND c.country_code = 'NGA' THEN 2000.00 -- NGN
        WHEN p.product_code = 'TAXI_URBAN_10KM' AND c.country_code = 'KEN' THEN 800.00 -- KES
        WHEN p.product_code = 'TAXI_URBAN_10KM' AND c.country_code = 'ZAF' THEN 180.00 -- ZAR
        WHEN p.product_code = 'TAXI_URBAN_10KM' AND c.country_code = 'GHA' THEN 85.00 -- GHS
        WHEN p.product_code = 'TAXI_URBAN_10KM' AND c.country_code = 'ETH' THEN 450.00 -- ETB

        ELSE 100.00 -- Default price for other combinations
    END as price_local,
    CASE 
        -- Exchange rates to USD (approximate 2025 rates)
        WHEN c.country_code = 'NGA' THEN 1570.00 -- NGN/USD
        WHEN c.country_code = 'KEN' THEN 133.50 -- KES/USD
        WHEN c.country_code = 'ZAF' THEN 18.40 -- ZAR/USD
        WHEN c.country_code = 'GHS' THEN 12.50 -- GHS/USD
        WHEN c.country_code = 'EGY' THEN 31.00 -- EGP/USD
        WHEN c.country_code = 'ETH' THEN 131.50 -- ETB/USD
        WHEN c.country_code = 'TZS' THEN 2650.00 -- TZS/USD
        WHEN c.country_code = 'UGA' THEN 3750.00 -- UGX/USD
        WHEN c.country_code = 'MAR' THEN 10.20 -- MAD/USD
        WHEN c.country_code = 'TUN' THEN 3.15 -- TND/USD
        WHEN c.country_code = 'DZA' THEN 134.50 -- DZD/USD
        WHEN c.country_code = 'LBY' THEN 4.85 -- LYD/USD
        WHEN c.country_code = 'SEN' THEN 650.00 -- XOF/USD (CFA Franc)
        WHEN c.country_code = 'CIV' THEN 650.00 -- XOF/USD (CFA Franc)
        WHEN c.country_code = 'MLI' THEN 650.00 -- XOF/USD (CFA Franc)
        WHEN c.country_code = 'BFA' THEN 650.00 -- XOF/USD (CFA Franc)
        WHEN c.country_code = 'NER' THEN 650.00 -- XOF/USD (CFA Franc)
        WHEN c.country_code = 'RWA' THEN 1350.00 -- RWF/USD
        WHEN c.country_code = 'COD' THEN 2800.00 -- CDF/USD
        WHEN c.country_code = 'CMR' THEN 650.00 -- XAF/USD (CFA Franc)
        WHEN c.country_code = 'GAB' THEN 650.00 -- XAF/USD (CFA Franc)
        WHEN c.country_code = 'ZMB' THEN 27.50 -- ZMW/USD
        WHEN c.country_code = 'ZWE' THEN 42000.00 -- ZWL/USD
        WHEN c.country_code = 'MOZ' THEN 75.00 -- MZN/USD
        WHEN c.country_code = 'AGO' THEN 850.00 -- AOA/USD
        ELSE 1.00 -- Default for USD
    END as usd_rate,
    'market_survey' as data_source,
    '2025-10-01' as collection_date,
    'retail' as market_type
FROM products p
CROSS JOIN countries c
CROSS JOIN currencies cur
WHERE 
    -- Only include specific product-country combinations for demo
    (
        (p.product_code = 'RICE_LONG_1KG' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA', 'EGY', 'ETH', 'TZA', 'MAR')) OR
        (p.product_code = 'MAIZE_WHITE_1KG' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA', 'ETH', 'TZA')) OR
        (p.product_code = 'WHEAT_FLOUR_1KG' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'EGY', 'MAR')) OR
        (p.product_code = 'COOKING_OIL_SUNFLOWER_1L' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA')) OR
        (p.product_code = 'SUGAR_WHITE_1KG' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'EGY')) OR
        (p.product_code = 'PETROL_REGULAR_1L' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA', 'EGY', 'TUN')) OR
        (p.product_code = 'DIESEL_1L' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA')) OR
        (p.product_code = 'ELECTRICITY_RESIDENTIAL_1KWH' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'EGY')) OR
        (p.product_code = 'MOBILE_DATA_1GB' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA', 'EGY')) OR
        (p.product_code = 'VOICE_CALL_LOCAL_1MIN' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA')) OR
        (p.product_code = 'BUS_LOCAL_10KM' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA', 'EGY')) OR
        (p.product_code = 'TAXI_URBAN_10KM' AND c.country_code IN ('NGA', 'KEN', 'ZAF', 'GHA', 'ETH'))
    )
    AND cur.code = CASE 
        WHEN c.country_code = 'NGA' THEN 'NGN'
        WHEN c.country_code = 'KEN' THEN 'KES'
        WHEN c.country_code = 'ZAF' THEN 'ZAR'
        WHEN c.country_code = 'GHA' THEN 'GHS'
        WHEN c.country_code = 'EGY' THEN 'EGP'
        WHEN c.country_code = 'ETH' THEN 'ETB'
        WHEN c.country_code = 'TZA' THEN 'TZS'
        WHEN c.country_code = 'UGA' THEN 'UGX'
        WHEN c.country_code = 'MAR' THEN 'MAD'
        WHEN c.country_code = 'TUN' THEN 'TND'
        WHEN c.country_code = 'DZA' THEN 'DZD'
        WHEN c.country_code = 'LBY' THEN 'LYD'
        WHEN c.country_code = 'SEN' THEN 'XOF'
        WHEN c.country_code = 'CIV' THEN 'XOF'
        WHEN c.country_code = 'MLI' THEN 'XOF'
        WHEN c.country_code = 'BFA' THEN 'XOF'
        WHEN c.country_code = 'NER' THEN 'XOF'
        WHEN c.country_code = 'RWA' THEN 'RWF'
        WHEN c.country_code = 'COD' THEN 'CDF'
        WHEN c.country_code = 'CMR' THEN 'XAF'
        WHEN c.country_code = 'GAB' THEN 'XAF'
        WHEN c.country_code = 'ZMB' THEN 'ZMW'
        WHEN c.country_code = 'ZWE' THEN 'ZWL'
        WHEN c.country_code = 'MOZ' THEN 'MZN'
        WHEN c.country_code = 'AGO' THEN 'AOA'
        ELSE 'USD'
    END;