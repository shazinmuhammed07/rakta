import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        
        // This clears the Supabase auth cookies natively.
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Logout error:', error.message);
            // Even on error, we might want to tell the client it was successful to clear state locally
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const response = NextResponse.json({ message: 'Logout successful' });

        // Optionally clear the old JWT token just in case
        response.cookies.set('token', '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
