import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const bloodGroup = searchParams.get('bloodGroup');
        const location = searchParams.get('location');

        const supabase = await createClient();

        let query = supabase
            .from('users')
            .select(`id, full_name, phone, blood_group, account_type, latitude, longitude, last_donation_date`)
            .eq('account_type', 'donor'); // Map role to account_type in table

        if (bloodGroup) {
            query = query.eq('blood_group', decodeURIComponent(bloodGroup));
        }

        // Location filtering by name isn't directly supported if the table only has lat/lng, 
        // but currently we don't have a locationName column in the schema example. 
        // So we'll skip DB location filter here and just fetch all or we'd need PostGIS.

        const { data: dbDonors, error } = await query;

        if (error) {
            throw error;
        }

        // Filter out donors who are ineligible (donated within the last 56 days)
        const eligibleDonors = dbDonors.filter(donor => {
            if (!donor.last_donation_date) return true; // Eligible if they've never donated
            
            const lastDate = new Date(donor.last_donation_date);
            const today = new Date();
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays >= 56;
        });

        // Map to expected format
        const donors = eligibleDonors.map(d => ({
            _id: d.id, // For compatibility
            id: d.id,
            name: d.full_name,
            phone: d.phone,
            bloodGroup: d.blood_group,
            location: d.latitude && d.longitude ? 'Unknown (Location available)' : 'Not specified', // Placeholder without reverse geocoding
            isAvailable: true // Assuming true as there's no isAvailable column provided in schema
        }));

        // Very basic mock client side filter for location text since it's hard without names in DB
        const filteredDonors = location ? 
            donors.filter(d => true) // Placeholder: real logic would need Reverse Geocoding or keeping locationName in DB
            : donors;

        return NextResponse.json({ donors: filteredDonors });
    } catch (error) {
        console.error('Donors search error:', error);
        return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
    }
}
