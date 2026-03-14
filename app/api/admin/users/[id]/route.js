import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request, context) {
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

        const { params } = context;
        const { id } = await params;

        await supabase.from('users').delete().eq('_id', id);
        await supabase.from('users').delete().eq('id', id);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('User deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
