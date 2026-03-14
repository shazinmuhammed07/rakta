import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(request, context) {
    try {
        const { params } = context;
        const { id } = await params;

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { status } = await request.json();

        if (!status || !['pending', 'fulfilled', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Fetch request by id (UUID from Supabase)
        const { data: targetRequest, error: fetchError } = await supabase
            .from('requests')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !targetRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Authorization: check if user owns the request or is admin
        const { data: userProfile } = await supabase.from('users').select('account_type').eq('id', user.id).single();

        if (targetRequest.requester_id !== user.id && userProfile?.account_type !== 'admin') {
            return NextResponse.json({ error: 'Not authorized to update this request' }, { status: 403 });
        }

        const { data: updatedRequest, error: updateError } = await supabase
            .from('requests')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ message: 'Request updated successfully', request: updatedRequest });
    } catch (error) {
        console.error('Update request error:', error);
        return NextResponse.json({ error: 'Failed to update blood request' }, { status: 500 });
    }
}

export async function GET(request, context) {
    try {
        const { params } = context;
        const { id } = await params;

        const supabase = await createClient();

        const { data: target, error } = await supabase
            .from('requests')
            .select(`
                *,
                requester:users(id, full_name, phone)
            `)
            .eq('id', id)
            .single();

        if (error || !target) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ request: target });
    } catch (error) {
        console.error('Fetch request error:', error);
        return NextResponse.json({ error: 'Failed to fetch blood request' }, { status: 500 });
    }
}
