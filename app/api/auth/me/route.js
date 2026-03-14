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

        // Fall back to auth metadata if public.users row doesn't exist yet
        // (e.g. trigger hasn't run, or row was not created)
        const meta = user.user_metadata || {};

        return NextResponse.json({ 
            user: {
                id: user.id,
                _id: profile?.id || user.id,
                name: profile?.full_name || meta.name || '',
                email: user.email,
                phone: profile?.phone || meta.phone || '',
                bloodGroup: profile?.blood_group || meta.bloodGroup || '',
                role: profile?.account_type || meta.role || 'donor',
                lastDonationDate: profile?.last_donation_date || meta.lastDonationDate || null,
                latitude: profile?.latitude || meta.latitude || null,
                longitude: profile?.longitude || meta.longitude || null,
                isAvailable: profile?.is_available ?? true,
                fcmToken: profile?.fcm_token || null,
            } 
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
}
