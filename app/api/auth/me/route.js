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
        const meta = user.user_metadata || {};

        const lat = profile?.latitude ?? (meta.latitude ? parseFloat(meta.latitude) : null);
        const lng = profile?.longitude ?? (meta.longitude ? parseFloat(meta.longitude) : null);
        // Build a human-readable location label from coordinates
        const locationName = (lat && lng)
            ? `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`
            : null;

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
                latitude: lat,
                longitude: lng,
                locationName: locationName,
                isAvailable: profile?.is_available ?? true,
                fcmToken: profile?.fcm_token || null,
            } 
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
}
