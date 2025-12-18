-- Seed data for country weights (PPP-based ACT calculation)
-- Based on 20 African countries representing 85% of continental GDP
-- Composite weights: (GDP_weight + Population_weight) / 2

-- Country weights for ACT calculation
INSERT INTO country_weights (country_code, country_name, region, gdp_weight, population_weight, composite_weight, economic_tier) VALUES
-- NORTH AFRICA
('DZA', 'Algeria', 'North Africa', 0.0250, 0.0450, 0.0350, 'emerging'),
('MAR', 'Morocco', 'North Africa', 0.0200, 0.0370, 0.0285, 'emerging'),
('TUN', 'Tunisia', 'North Africa', 0.0080, 0.0120, 0.0100, 'emerging'),
('LBY', 'Libya', 'North Africa', 0.0120, 0.0070, 0.0095, 'developing'),
('EGY', 'Egypt', 'North Africa', 0.0450, 0.1050, 0.0750, 'emerging'),

-- WEST AFRICA
('NGA', 'Nigeria', 'West Africa', 0.0500, 0.2150, 0.1325, 'emerging'),
('GHA', 'Ghana', 'West Africa', 0.0120, 0.0330, 0.0225, 'developing'),
('SEN', 'Senegal', 'West Africa', 0.0040, 0.0180, 0.0110, 'developing'),
('CIV', 'Côte d''Ivoire', 'West Africa', 0.0080, 0.0270, 0.0175, 'developing'),
('MLI', 'Mali', 'West Africa', 0.0025, 0.0210, 0.0118, 'developing'),
('BFA', 'Burkina Faso', 'West Africa', 0.0020, 0.0210, 0.0115, 'developing'),
('NER', 'Niger', 'West Africa', 0.0015, 0.0240, 0.0128, 'developing'),

-- EAST AFRICA
('ETH', 'Ethiopia', 'East Africa', 0.0150, 0.1200, 0.0675, 'developing'),
('KEN', 'Kenya', 'East Africa', 0.0150, 0.0560, 0.0355, 'developing'),
('TZA', 'Tanzania', 'East Africa', 0.0100, 0.0650, 0.0375, 'developing'),
('UGA', 'Uganda', 'East Africa', 0.0070, 0.0480, 0.0275, 'developing'),
('RWA', 'Rwanda', 'East Africa', 0.0020, 0.0130, 0.0075, 'developing'),

-- CENTRAL AFRICA
('COD', 'Democratic Republic of Congo', 'Central Africa', 0.0080, 0.0950, 0.0515, 'developing'),
('CMR', 'Cameroon', 'Central Africa', 0.0070, 0.0280, 0.0175, 'developing'),
('GAB', 'Gabon', 'Central Africa', 0.0030, 0.0025, 0.0028, 'emerging'),

-- SOUTHERN AFRICA
('ZAF', 'South Africa', 'Southern Africa', 0.0600, 0.0600, 0.0600, 'emerging'),
('ZMB', 'Zambia', 'Southern Africa', 0.0035, 0.0190, 0.0113, 'developing'),
('ZWE', 'Zimbabwe', 'Southern Africa', 0.0030, 0.0160, 0.0095, 'developing'),
('MOZ', 'Mozambique', 'Southern Africa', 0.0025, 0.0320, 0.0173, 'developing'),
('AGO', 'Angola', 'Central Africa', 0.0150, 0.0340, 0.0245, 'developing')
ON CONFLICT (country_code, calculated_at::date) DO NOTHING;