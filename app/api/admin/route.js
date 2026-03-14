import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase.from('users').select('role').eq('phone', user.phone).single();

        if (profile?.role !== 'admin' && user?.user_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        const { data: requests } = await supabase.from('requests').select('*, requester:users(name, phone)').order('created_at', { ascending: false });

        return NextResponse.json({ users, requests });
    } catch (error) {
        console.error('Admin data fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }
}
