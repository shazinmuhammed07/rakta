import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
        }

        const supabase = await createClient();
        
        // Supabase sign-in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Supabase auth error:', error.message);
            // It could be that users exist in public.users but not auth.users if not fully migrated.
            // But we must rely on Supabase Auth.
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        // Fetch user profile from public.users table
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: data.user.id,
                _id: profile?.id || data.user.id, // Supabase id is the id
                name: profile?.full_name || data.user.user_metadata?.name,
                role: profile?.account_type || data.user.user_metadata?.role || 'donor',
                bloodGroup: profile?.blood_group || data.user.user_metadata?.bloodGroup,
                phone: profile?.phone || data.user.phone,
                locationName: profile?.locationName,
                isAvailable: profile?.isAvailable
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
