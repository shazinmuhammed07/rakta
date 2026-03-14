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

        // Fetch request
        const { data: bloodRequest, error: fetchError } = await supabase
            .from('requests')
            .select('*')
            .eq('_id', id) // support frontend sending legacy _id
            .single();
            
        // If not found by _id, try uuid
        let targetRequest = bloodRequest;
        if (fetchError || !targetRequest) {
            const { data: reqByUuid } = await supabase.from('requests').select('*').eq('id', id).single();
            targetRequest = reqByUuid;
        }

        if (!targetRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Fetch user profile to get roles
        // Fetch user profile to get roles
        const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
        const userId = userProfile?._id || userProfile?.id || user.id;

        // Authorization checks
        if (targetRequest.requester_id !== userId && userProfile?.account_type !== 'admin') {
            return NextResponse.json({ error: 'Not authorized to update this request' }, { status: 403 });
        }

        const { data: updatedRequest, error: updateError } = await supabase
            .from('requests')
            .update({ status })
            .eq('id', targetRequest.id)
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
        
        let query = supabase.from('requests').select('*, requester:users(id, _id, name, phone, email, role)');
        
        // try querying by _id first, then by id
        const { data: bloodRequestByOldId } = await query.eq('_id', id).maybeSingle();
        const { data: bloodRequestByNewId } = await query.eq('id', id).maybeSingle();
        
        const target = bloodRequestByOldId || bloodRequestByNewId;

        if (!target) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ request: target });
    } catch (error) {
        console.error('Fetch request error:', error);
        return NextResponse.json({ error: 'Failed to fetch blood request' }, { status: 500 });
    }
}
