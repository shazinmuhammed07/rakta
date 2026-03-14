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

        // Handle email update separately using Supabase Auth
        const emailUpdate = updateData.email;
        delete updateData.email;

        if (emailUpdate && emailUpdate !== user.email) {
            const { error: emailError } = await supabase.auth.updateUser({ email: emailUpdate });
            if (emailError) {
                console.error('Email update failed:', emailError);
                return NextResponse.json({ error: 'Failed to update email' }, { status: 400 });
            }
        }

        // Ensure we update using the correct ID 
        // We map frontend camelCase to snake_case db columns
        const dbUpdate = { ...updateData };
        if (dbUpdate.isAvailable !== undefined) {
            dbUpdate.is_available = dbUpdate.isAvailable;
            delete dbUpdate.isAvailable;
        }

        if (dbUpdate.lastDonationDate !== undefined) {
            dbUpdate.last_donation_date = dbUpdate.lastDonationDate;
            delete dbUpdate.lastDonationDate;
        }

        if (dbUpdate.name !== undefined) {
            dbUpdate.full_name = dbUpdate.name;
            delete dbUpdate.name;
        }

        if (dbUpdate.bloodGroup !== undefined) {
            dbUpdate.blood_group = dbUpdate.bloodGroup;
            delete dbUpdate.bloodGroup;
        }

        if (dbUpdate.locationName !== undefined) {
            delete dbUpdate.locationName;
        }

        const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update(dbUpdate)
            .eq('id', user.id) // safer than phone update if they change phone
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
