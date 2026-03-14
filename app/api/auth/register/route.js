import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const { name, email, phone, bloodGroup, location, locationName, password, role, lastDonationDate } = await request.json();

        // Validate inputs
        if (!name || !email || !phone || !bloodGroup || !location || !location.coordinates || !password) {
            return NextResponse.json({ error: 'All fields except last donation date are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Extract latitude and longitude from location object
        const longitude = Array.isArray(location?.coordinates) ? location.coordinates[0] : null;
        const latitude = Array.isArray(location?.coordinates) ? location.coordinates[1] : null;

        // Register user via Supabase Auth.
        // All profile data is stored in raw_user_meta_data.
        // A database trigger (on_auth_user_created) will automatically
        // insert a matching row into public.users using this metadata.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                    bloodGroup,
                    role: role || 'donor',
                    latitude: latitude?.toString(),
                    longitude: longitude?.toString(),
                    lastDonationDate: lastDonationDate || null,
                }
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Registration successful',
            user: {
                id: authData.user.id,
                full_name: name,
                account_type: role || 'donor',
                blood_group: bloodGroup,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
