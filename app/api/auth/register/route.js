import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const { name, email, phone, bloodGroup, location, locationName, password, role } = await request.json();

        // Validate inputs
        if (!name || !email || !phone || !bloodGroup || !location || !location.coordinates || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Register user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                    bloodGroup,
                    role: role || 'donor'
                }
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // Extract latitude and longitude from location object
        const longitude = Array.isArray(location?.coordinates) ? location.coordinates[0] : null;
        const latitude = Array.isArray(location?.coordinates) ? location.coordinates[1] : null;

        // Insert into public.users table exactly matching the schema
        const { data: profile, error: dbError } = await supabase
            .from('users')
            .insert([{
                id: authData.user.id,
                full_name: name,
                phone,
                blood_group: bloodGroup,
                account_type: role || 'donor',
                latitude,
                longitude
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Insert error details:', dbError);
            return NextResponse.json({ error: dbError.message || 'Failed to finish user profile creation.' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Registration successful',
            user: {
                id: authData.user.id,
                full_name: profile?.full_name || name,
                account_type: profile?.account_type || role || 'donor',
                blood_group: profile?.blood_group || bloodGroup,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
