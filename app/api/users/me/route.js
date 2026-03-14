import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const updateData = await request.json();

        // Prevent password/role updates through this route
        delete updateData.password;
        delete updateData.role;

        // Ensure we update using the correct ID 
        // We match auth user phone in case public.users id differs
        const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('phone', user.phone)
            .select()
            .single();

        if (updateError) {
            console.error('Update DB error:', updateError);
            return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({ user: updatedProfile });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
