import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch user details from public.users table
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        return NextResponse.json({ 
            user: {
                ...profile,
                name: profile?.full_name,
                email: user.email,
                role: profile?.account_type,
                bloodGroup: profile?.blood_group,
                lastDonationDate: profile?.last_donation_date,
                locationName: profile?.location_name,
                id: user.id,
                _id: profile?.id || user.id,
            } 
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
}
