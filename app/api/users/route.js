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
            .select(`id, _id, name, phone, bloodGroup, locationName, isAvailable`)
            .eq('role', 'donor')
            .eq('isAvailable', true);

        if (bloodGroup) {
            query = query.eq('bloodGroup', decodeURIComponent(bloodGroup));
        }

        if (location) {
            query = query.ilike('locationName', `%${location}%`);
        }

        const { data: donors, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({ donors });
    } catch (error) {
        console.error('Donors search error:', error);
        return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
    }
}
