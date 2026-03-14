import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { fcmToken } = await request.json();

        if (!fcmToken) {
            return NextResponse.json({ error: 'FCM Token is required' }, { status: 400 });
        }

        // Update the user's FCM token
        const { error: updateError } = await supabase
            .from('users')
            .update({ fcmToken })
            .eq('email', user.email);

        if (updateError) throw updateError;

        return NextResponse.json({ message: 'FCM Token updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Update FCM token error:', error);
        return NextResponse.json({ error: 'Failed to update FCM token' }, { status: 500 });
    }
}
