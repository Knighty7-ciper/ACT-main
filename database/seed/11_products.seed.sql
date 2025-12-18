-- Seed data for products (PPP-based ACT calculation)
-- Based on ACT methodology with 13+ African countries and 50+ products

-- First, ensure category weights exist
INSERT INTO category_weights (category_name, weight, description, calculation_method, effective_from) VALUES
('Staples', 0.4500, 'Essential food items - largest household expense', 'household_survey', '2025-01-01'),
('Energy', 0.3000, 'Fuel and energy - critical for economic activity', 'household_survey', '2025-01-01'),
('Telecom', 0.1500, 'Communication services - growing importance', 'household_survey', '2025-01-01'),
('Transport', 0.1000, 'Transportation - basic infrastructure', 'household_survey', '2025-01-01')
ON CONFLICT (category_name) DO UPDATE SET 
    weight = EXCLUDED.weight,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Insert comprehensive product list for PPP calculation
INSERT INTO products (product_code, product_name, product_category, unit, description, international_standard) VALUES
-- STAPLES CATEGORY (45% weight)
('RICE_LONG_1KG', 'Long Grain Rice (1kg)', 'Staples', 'kg', 'Long grain white rice, 1kg package', 'ISO 24333:2009'),
('RICE_SHORT_1KG', 'Short Grain Rice (1kg)', 'Staples', 'kg', 'Short grain rice, 1kg package', 'ISO 24333:2009'),
('MAIZE_WHITE_1KG', 'White Maize (1kg)', 'Staples', 'kg', 'White maize grain, 1kg bag', 'ISO 24333:2009'),
('MAIZE_YELLOW_1KG', 'Yellow Maize (1kg)', 'Staples', 'kg', 'Yellow maize grain, 1kg bag', 'ISO 24333:2009'),
('WHEAT_FLOUR_1KG', 'Wheat Flour (1kg)', 'Staples', 'kg', 'Refined wheat flour, 1kg bag', 'ISO 7971-3:2019'),
('CASSAVA_FLOUR_1KG', 'Cassava Flour (1kg)', 'Staples', 'kg', 'Cassava flour, 1kg bag', 'ISO 5510:1984'),
('SORGHUM_1KG', 'Sorghum Grain (1kg)', 'Staples', 'kg', 'Sorghum grain, 1kg bag', 'ISO 24333:2009'),
('MILLET_1KG', 'Millet Grain (1kg)', 'Staples', 'kg', 'Pearl millet grain, 1kg bag', 'ISO 24333:2009'),

('COOKING_OIL_SUNFLOWER_1L', 'Sunflower Oil (1L)', 'Staples', 'L', 'Sunflower cooking oil, 1 liter bottle', 'ISO 6611:2004'),
('COOKING_OIL_PALM_1L', 'Palm Oil (1L)', 'Staples', 'L', 'Red palm oil, 1 liter bottle', 'ISO 6611:2004'),
('COCONUT_OIL_1L', 'Coconut Oil (1L)', 'Staples', 'L', 'Virgin coconut oil, 1 liter bottle', 'ISO 6611:2004'),

('SUGAR_WHITE_1KG', 'White Sugar (1kg)', 'Staples', 'kg', 'Granulated white sugar, 1kg package', 'ISO 2918:2003'),
('BROWN_SUGAR_1KG', 'Brown Sugar (1kg)', 'Staples', 'kg', 'Brown sugar, 1kg package', 'ISO 2918:2003'),

('SALT_IODIZED_1KG', 'Iodized Salt (1kg)', 'Staples', 'kg', 'Iodized table salt, 1kg package', 'ISO 544:2017'),

('BEANS_BLACK_1KG', 'Black Beans (1kg)', 'Staples', 'kg', 'Black beans, 1kg bag', 'ISO 6052:2004'),
('BEANS_RED_1KG', 'Red Kidney Beans (1kg)', 'Staples', 'kg', 'Red kidney beans, 1kg bag', 'ISO 6052:2004'),
('PEANUTS_1KG', 'Groundnuts (1kg)', 'Staples', 'kg', 'Roasted groundnuts, 1kg bag', 'ISO 7925:2016'),

('ONIONS_1KG', 'Onions (1kg)', 'Staples', 'kg', 'Yellow onions, 1kg', 'ISO 2151:2015'),
('TOMATOES_1KG', 'Tomatoes (1kg)', 'Staples', 'kg', 'Fresh tomatoes, 1kg', 'ISO 21667:2015'),
('POTATOES_1KG', 'Potatoes (1kg)', 'Staples', 'kg', 'Irish potatoes, 1kg', 'ISO 3934:2009'),

-- ENERGY CATEGORY (30% weight)
('PETROL_REGULAR_1L', 'Regular Petrol (1L)', 'Energy', 'L', 'Regular gasoline, 1 liter', 'EN 228:2012'),
('PETROL_PREMIUM_1L', 'Premium Petrol (1L)', 'Energy', 'L', 'Premium gasoline, 1 liter', 'EN 228:2012'),
('DIESEL_1L', 'Diesel Fuel (1L)', 'Energy', 'L', 'Automotive diesel fuel, 1 liter', 'EN 590:2013'),
('KEROSENE_HOUSEHOLD_1L', 'Kerosene (1L)', 'Energy', 'L', 'Household kerosene, 1 liter', 'ASTM D3699:2013'),
('LPG_1KG', 'LPG Gas (1kg)', 'Energy', 'kg', 'Liquefied petroleum gas, 1kg cylinder', 'ISO 15500:2012'),

('ELECTRICITY_RESIDENTIAL_1KWH', 'Residential Electricity (1kWh)', 'Energy', 'kWh', 'Residential electricity, 1 kilowatt hour', 'IEC 60050:2017'),
('ELECTRICITY_COMMERCIAL_1KWH', 'Commercial Electricity (1kWh)', 'Energy', 'kWh', 'Commercial electricity, 1 kilowatt hour', 'IEC 60050:2017'),

('CHARCOAL_1KG', 'Charcoal (1kg)', 'Energy', 'kg', 'Cooking charcoal, 1kg bag', 'ISO 147:2013'),
('FIREWOOD_1KG', 'Firewood (1kg)', 'Energy', 'kg', 'Dried firewood, 1kg', 'ISO 147:2013'),

-- TELECOM CATEGORY (15% weight)
('MOBILE_DATA_1GB', 'Mobile Data (1GB)', 'Telecom', 'GB', 'Mobile internet data, 1 gigabyte', 'ITU-T E.164'),
('MOBILE_DATA_5GB', 'Mobile Data (5GB)', 'Telecom', 'GB', 'Mobile internet data, 5 gigabytes', 'ITU-T E.164'),
('VOICE_CALL_LOCAL_1MIN', 'Local Voice Call (1min)', 'Telecom', 'minute', 'Local mobile voice call, per minute', 'ITU-T E.164'),
('VOICE_CALL_INTL_1MIN', 'International Voice Call (1min)', 'Telecom', 'minute', 'International voice call, per minute', 'ITU-T E.164'),
('SMS_LOCAL_1', 'Local SMS (1)', 'Telecom', 'message', 'Local SMS text message', 'ITU-T E.164'),
('SMS_INTL_1', 'International SMS (1)', 'Telecom', 'message', 'International SMS text message', 'ITU-T E.164'),
('MOBILE_AIRTIME_10USD', 'Mobile Airtime ($10)', 'Telecom', 'USD', 'Mobile airtime credit equivalent to $10', 'ITU-T E.164'),

('BROADBAND_10MBPS_1MONTH', 'Broadband Internet (10Mbps/month)', 'Telecom', 'month', 'Fixed broadband internet, 10 Mbps', 'ISO/IEC 11172:1993'),
('MOBILE_MONEY_1USD_FEE', 'Mobile Money Transfer Fee (1USD)', 'Telecom', 'USD', 'Fee for $1 mobile money transfer', 'ISO 20022:2019'),

-- TRANSPORT CATEGORY (10% weight)
('BUS_LOCAL_10KM', 'Local Bus (10km)', 'Transport', 'km', 'Public city bus fare for 10km', 'UN/ECE R155'),
('BUS_INTERCITY_10KM', 'Intercity Bus (10km)', 'Transport', 'km', 'Intercity bus fare for 10km', 'UN/ECE R155'),
('TAXI_URBAN_10KM', 'Urban Taxi (10km)', 'Transport', 'km', 'Urban taxi fare for 10km', 'UN/ECE R155'),
('TAXI_INTERCITY_10KM', 'Intercity Taxi (10km)', 'Transport', 'km', 'Intercity taxi fare for 10km', 'UN/ECE R155'),
('MOTORCYCLE_TAXI_10KM', 'Motorcycle Taxi (10km)', 'Transport', 'km', 'Motorcycle taxi (boda-boda) fare for 10km', 'UN/ECE R155'),
('FUEL_SURCHARGE_10KM', 'Transport Fuel Surcharge (10km)', 'Transport', 'km', 'Fuel cost for 10km transport', 'UN/ECE R155'),

('TRAIN_LOCAL_10KM', 'Local Train (10km)', 'Transport', 'km', 'Local commuter train fare for 10km', 'UIC Standards'),
('AIRLINE_DOMESTIC_10KM', 'Domestic Flight (per 10km)', 'Transport', 'km', 'Domestic airline fare per 10km distance', 'IATA Standards')
ON CONFLICT (product_code) DO NOTHING;