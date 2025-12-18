-- Products table for ACT PPP calculation
-- Represents standardized products across African markets

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(20) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(50) NOT NULL, -- 'Staples', 'Energy', 'Telecom', 'Transport'
    unit VARCHAR(20) NOT NULL, -- 'kg', 'L', 'GB', 'kWh', 'minute', 'km'
    description TEXT,
    international_standard VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_category ON products(product_category);
CREATE INDEX idx_products_active ON products(is_active);

-- Insert sample products based on ACT methodology
INSERT INTO products (product_code, product_name, product_category, unit, description, international_standard) VALUES
-- Staples (45% weight)
('RICE_1KG', 'Rice (1kg)', 'Staples', 'kg', 'Long grain white rice, 1kg package', 'ISO 24333:2009'),
('MAIZE_1KG', 'Maize (1kg)', 'Staples', 'kg', 'White maize grain, 1kg bag', 'ISO 24333:2009'),
('FLOUR_1KG', 'Wheat Flour (1kg)', 'Staples', 'kg', 'Refined wheat flour, 1kg bag', 'ISO 7971-3:2019'),
('OIL_1L', 'Cooking Oil (1L)', 'Staples', 'L', 'Vegetable cooking oil, 1 liter bottle', 'ISO 6611:2004'),
('SUGAR_1KG', 'Sugar (1kg)', 'Staples', 'kg', 'Granulated white sugar, 1kg package', 'ISO 2918:2003'),

-- Energy (30% weight) 
('PETROL_1L', 'Petrol (1L)', 'Energy', 'L', 'Regular gasoline, 1 liter', 'EN 228:2012'),
('DIESEL_1L', 'Diesel (1L)', 'Energy', 'L', 'Automotive diesel fuel, 1 liter', 'EN 590:2013'),
('KEROSENE_1L', 'Kerosene (1L)', 'Energy', 'L', 'Household kerosene, 1 liter', 'ASTM D3699:2013'),
('ELECTRICITY_1KWH', 'Electricity (1 kWh)', 'Energy', 'kWh', 'Residential electricity, 1 kilowatt hour', 'IEC 60050:2017'),

-- Telecom (15% weight)
('MOBILE_DATA_1GB', 'Mobile Data (1GB)', 'Telecom', 'GB', 'Mobile internet data, 1 gigabyte', 'ITU-T E.164'),
('VOICE_CALL_1MIN', 'Voice Calls (1 min)', 'Telecom', 'minute', 'Mobile voice call, per minute', 'ITU-T E.164'),
('SMS_1MSG', 'SMS (1 message)', 'Telecom', 'message', 'SMS text message, per message', 'ITU-T E.164'),

-- Transport (10% weight)
('PUBLIC_TRANS_10KM', 'Public Transport (10km)', 'Transport', 'km', 'Bus fare for 10km journey', 'UN/ECE R155'),
('TAXI_10KM', 'Taxi/Ride-hailing (10km)', 'Transport', 'km', 'Taxi fare for 10km journey', 'UN/ECE R155')
ON CONFLICT (product_code) DO NOTHING;