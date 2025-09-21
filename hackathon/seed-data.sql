-- Seed data for Houston CitizenVoice platform
-- Run this in Supabase SQL editor after setting up the schema

-- Insert sample profiles (these would normally be created by auth)
INSERT INTO profiles (author_id, full_name, address, zip, verified_resident) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', '1200 Main St, Houston, TX', '77002', true),
('550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', '2400 University Blvd, Houston, TX', '77025', true),
('550e8400-e29b-41d4-a716-446655440003', 'Emily Rodriguez', '800 Walker St, Houston, TX', '77002', true),
('550e8400-e29b-41d4-a716-446655440004', 'David Kim', '3000 Richmond Ave, Houston, TX', '77098', true),
('550e8400-e29b-41d4-a716-446655440005', 'Lisa Thompson', '1500 Louisiana St, Houston, TX', '77002', false),
('550e8400-e29b-41d4-a716-446655440006', 'James Wilson', '2100 Post Oak Blvd, Houston, TX', '77056', true);

-- Insert sample proposals
/* INSERT INTO proposals (id, author_id, title, summary, body_md, category, scope_verified, status, upvotes, location_hint) VALUES */
INSERT INTO proposals (id,created_at,author_id,title,summary,body_md,category,scope_verified,status,upvotes,location_hint,updated_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440001',
  'Fix Potholes on Main Street',
  'The stretch of Main Street between downtown and the medical center has numerous large potholes that are damaging vehicles and creating safety hazards for cyclists.',
  '# Problem Description

The potholes on Main Street have been growing worse over the past year. Multiple residents have reported:

- Damage to vehicle tires and suspension
- Safety concerns for cyclists
- Reduced property values in affected areas

## Proposed Solution

1. Immediate temporary patching of the worst potholes
2. Complete road resurfacing within 6 months
3. Regular maintenance schedule to prevent future deterioration

## Benefits

- Improved vehicle safety
- Better cycling infrastructure
- Enhanced neighborhood appeal
- Reduced long-term maintenance costs',
  'Roads',
  true,
  'published',
  45,
  'Main Street, Downtown to Medical Center'
),
(
  '22222222-2222-2222-2222-222222222222',
  '550e8400-e29b-41d4-a716-446655440002',
  'Increase Frequency of Recycling Pickup',
  'Many neighborhoods only have recycling pickup every two weeks, leading to overflowing bins and missed collections.',
  '# Current Situation

Houston''s recycling program currently serves most residential areas on a bi-weekly schedule. This creates several issues:

- Bins overflow between collections
- Residents miss pickup days due to the irregular schedule
- Recyclable materials end up in regular trash

## Proposal

Move to weekly recycling pickup city-wide, similar to regular trash collection.

## Implementation

- Phase 1: High-density neighborhoods
- Phase 2: Suburban areas
- Phase 3: Full city coverage

This aligns with Houston''s sustainability goals and would significantly increase recycling rates.',
  'Sanitation',
  true,
  'published',
  32,
  'City-wide'
),
(
  '33333333-3333-3333-3333-333333333333',
  '550e8400-e29b-41d4-a716-446655440003',
  'Create Dog Park in Memorial Area',
  'The Memorial area lacks dedicated off-leash dog areas, forcing pet owners to travel long distances or use inappropriate spaces.',
  '# Need for Dog Park

The Memorial area has a high concentration of dog owners but no dedicated off-leash facilities within reasonable distance.

## Proposed Location

The vacant lot at the corner of Memorial Drive and Gessner Road would be ideal:

- 2.5 acres of unused city property
- Easy parking access
- Good drainage
- Central location for the community

## Features

- Separate areas for large and small dogs
- Water fountains for pets and owners
- Waste stations throughout
- Benches and shade structures
- Security lighting

## Community Support

Over 200 residents have already signed a petition supporting this proposal.',
  'Parks',
  true,
  'petitioning',
  78,
  'Memorial Drive and Gessner Road'
),
(
  '44444444-4444-4444-4444-444444444444',
  '550e8400-e29b-41d4-a716-446655440004',
  'Install Speed Bumps in School Zones',
  'Several elementary schools lack adequate traffic calming measures, creating dangerous conditions during pickup and drop-off times.',
  '# Traffic Safety Concern

Parents and school officials have raised concerns about vehicle speeds in school zones, particularly:

- Lanier Elementary on West Gray
- Wilson Elementary on Sul Ross
- Field Elementary on Holman Street

## Current Issues

- Vehicles regularly exceed 20 mph speed limit
- Limited crossing guard coverage
- Poor visibility at some crossings
- Increased pedestrian traffic during school hours

## Proposed Solution

Install speed bumps at strategic locations:

1. 100 feet before each crosswalk
2. At mid-block crossing points
3. Near bus loading zones

## Additional Measures

- Enhanced signage
- Better crosswalk striping
- Consider adding crossing guards at high-traffic times

## Timeline

This should be implemented before the next school year begins.',
  'Safety',
  true,
  'published',
  56,
  'Multiple school zones'
),
(
  '55555555-5555-5555-5555-555555555555',
  '550e8400-e29b-41d4-a716-446655440005',
  'Allow Food Trucks in Residential Areas',
  'Current zoning restrictions prevent food trucks from operating in many residential neighborhoods, limiting food options for residents.',
  '# Current Zoning Limitations

Food trucks are currently restricted to:
- Commercial districts
- Special event permits
- Private property with business licenses

This limits access to diverse, affordable food options in residential areas.

## Proposal

Modify zoning code to allow food trucks in residential areas with basic regulations:

- Operating hours: 7 AM - 10 PM
- Noise restrictions
- Parking requirements (not blocking traffic/residents)
- Basic health permits
- Maximum stay: 4 hours per location

## Benefits

- Increased food access in underserved areas
- Support for small businesses
- More diverse dining options
- Economic development

## Safeguards

- Resident complaint process
- Regular health inspections
- Traffic impact assessments',
  'Zoning',
  false,
  'published',
  23,
  'Residential neighborhoods'
),
(
  '66666666-6666-6666-6666-666666666666',
  '550e8400-e29b-41d4-a716-446655440006',
  'Improve Street Lighting Downtown',
  'Many downtown streets have inadequate lighting, creating safety concerns for pedestrians and contributing to crime.',
  '# Lighting Assessment

A recent survey identified over 30 downtown blocks with insufficient street lighting:

- Burned out fixtures not being replaced promptly
- Outdated lighting technology
- Poor coverage at intersections
- Dark spots between buildings

## Safety Impact

Poor lighting contributes to:
- Increased pedestrian accidents
- Higher crime rates
- Reduced foot traffic for businesses
- General feeling of unease

## Proposed Improvements

1. **Immediate**: Replace all burned-out bulbs within 2 weeks
2. **Short-term**: Upgrade to LED lighting for better coverage and efficiency
3. **Long-term**: Add decorative lighting to enhance downtown appeal

## Funding

- Utility cost savings from LED conversion
- Potential federal infrastructure grants
- Business improvement district contributions

## Expected Outcomes

- 40% improvement in lighting coverage
- 25% reduction in energy costs
- Enhanced downtown safety and appeal',
  'Safety',
  true,
  'published',
  41,
  'Downtown Houston'
);

-- Insert sample votes (all upvotes for demonstration)
INSERT INTO votes (proposal_id, author_id, vote_type) VALUES
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440002', 'up'),
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440003', 'up'),
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440004', 'up'),
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', 'up'),
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440003', 'up'),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', 'up'),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440002', 'up'),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440004', 'up'),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440006', 'up'),
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', 'up'),
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440002', 'up'),
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440003', 'up'),
('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440002', 'up'),
('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440006', 'up'),
('66666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440001', 'up'),
('66666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440003', 'up'),
('66666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440004', 'up');

-- Insert sample road reports (using approximate coordinates for Houston)
INSERT INTO road_reports (id, author_id, geom, street_name, description, media_urls) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440001',
  ST_SetSRID(ST_MakePoint(-95.3698, 29.7604), 4326),
  'Main Street',
  'Large pothole causing traffic to swerve into adjacent lane',
  ARRAY['https://example.com/pothole1.jpg']
),
(
  'a2222222-2222-2222-2222-222222222222',
  '550e8400-e29b-41d4-a716-446655440002',
  ST_SetSRID(ST_MakePoint(-95.3876, 29.7589), 4326),
  'Louisiana Street',
  'Flooding occurs here during heavy rain, making street impassable',
  ARRAY['https://example.com/flooding1.jpg', 'https://example.com/flooding2.jpg']
),
(
  'a3333333-3333-3333-3333-333333333333',
  '550e8400-e29b-41d4-a716-446655440003',
  ST_SetSRID(ST_MakePoint(-95.3712, 29.7654), 4326),
  'McKinney Street',
  'Broken water main has created a sinkhole approximately 3 feet across',
  ARRAY['https://example.com/sinkhole1.jpg']
),
(
  'a4444444-4444-4444-4444-444444444444',
  '550e8400-e29b-41d4-a716-446655440004',
  ST_SetSRID(ST_MakePoint(-95.4193, 29.7749), 4326),
  'Richmond Avenue',
  'Multiple potholes between Gessner and Hillcroft, damage to vehicle tires reported',
  null
),
(
  'a5555555-5555-5555-5555-555555555555',
  '550e8400-e29b-41d4-a716-446655440006',
  ST_SetSRID(ST_MakePoint(-95.3890, 29.7340), 4326),
  'Westheimer Road',
  'Uneven pavement and road debris near shopping center entrance',
  ARRAY['https://example.com/debris1.jpg']
),
(
  'a6666666-6666-6666-6666-666666666666',
  '550e8400-e29b-41d4-a716-446655440001',
  ST_SetSRID(ST_MakePoint(-95.3445, 29.8016), 4326),
  'North Shepherd Drive',
  'Road surface deteriorating, multiple small potholes forming',
  null
),
(
  'a7777777-7777-7777-7777-777777777777',
  '550e8400-e29b-41d4-a716-446655440002',
  ST_SetSRID(ST_MakePoint(-95.3963, 29.7372), 4326),
  'Bissonnet Street',
  'Traffic light intersection has standing water that does not drain',
  ARRAY['https://example.com/water1.jpg']
),
(
  'a8888888-8888-8888-8888-888888888888',
  '550e8400-e29b-41d4-a716-446655440003',
  ST_SetSRID(ST_MakePoint(-95.3518, 29.7792), 4326),
  'Washington Avenue',
  'Manhole cover has shifted, creating a hazardous bump in the road',
  ARRAY['https://example.com/manhole1.jpg']
);

-- Update proposal upvote counts to match vote records
UPDATE proposals SET upvotes = (
  SELECT COUNT(*) FROM votes WHERE proposal_id = proposals.id
);

-- Add some sample comments or additional metadata if needed
-- (This would require additional tables for comments, but keeping it simple for now)

-- Display summary of seeded data
SELECT 
  'Profiles' as table_name, COUNT(*) as record_count 
FROM profiles
UNION ALL
SELECT 
  'Proposals' as table_name, COUNT(*) as record_count 
FROM proposals
UNION ALL
SELECT 
  'Votes' as table_name, COUNT(*) as record_count 
FROM votes
UNION ALL
SELECT 
  'Road Reports' as table_name, COUNT(*) as record_count 
FROM road_reports
ORDER BY table_name;
