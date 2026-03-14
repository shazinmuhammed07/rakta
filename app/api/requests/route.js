import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        const { data: requests, error } = await supabase
            .from('requests')
            .select(`
                *,
                requester:users (
                    _id,
                    id,
                    name,
                    phone
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Fetch requests error:', error);
        return NextResponse.json({ error: 'Failed to fetch blood requests' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { patientName, bloodGroup, unitsRequired, hospitalName, location, locationName, urgencyLevel } = body;

        if (!patientName || !bloodGroup || !unitsRequired || !hospitalName || !location || !location.coordinates) {
            return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
        }

        const isEmergency = urgencyLevel === 'Emergency';

        // Fetch User record to link as requester properly
        const { data: userProfile } = await supabase.from('users').select('id, _id').eq('email', user.email).single();
        const requesterId = userProfile?.id || userProfile?._id || user.id;

        // Insert new request
        const { data: newRequestArray, error: insertError } = await supabase
            .from('requests')
            .insert([{
                patient_name: patientName,
                blood_group: bloodGroup,
                units_required: unitsRequired,
                hospital_name: hospitalName,
                location: location, // Storing as JSON or as appropriate schema type
                location_name: locationName,
                urgency_level: urgencyLevel || 'Normal',
                status: 'pending',
                requester_id: requesterId // Map to proper ID column based on requester ref
            }])
            .select();

        if (insertError) throw insertError;
        const newRequest = newRequestArray?.[0];

        // Find available donors to notify (not filtering by pure distance yet to avoid PostGIS failures)
        const { data: nearbyDonors, error: donorsError } = await supabase
            .from('users')
            .select('fcmToken')
            .eq('bloodGroup', bloodGroup)
            .eq('isAvailable', true)
            .not('fcmToken', 'is', null);

        let notificationsSent = 0;
        if (!donorsError && nearbyDonors && nearbyDonors.length > 0) {
            const recipientTokens = nearbyDonors.map(d => d.fcmToken);
            try {
                const admin = (await import('@/lib/firebaseAdmin')).default;
                const message = {
                    notification: {
                        title: isEmergency ? "🔴 EMERGENCY: Blood Request!" : "Urgent Blood Needed nearby",
                        body: `${unitsRequired} units of ${bloodGroup} needed at ${hospitalName}. Can you help?`
                    },
                    tokens: recipientTokens,
                };
                const response = await admin.messaging().sendEachForMulticast(message);
                notificationsSent = response.successCount;
            } catch (fcmError) {
                console.error("Error sending FCM notifications:", fcmError);
            }
        }

        return NextResponse.json({
            message: 'Blood request created successfully',
            request: newRequest,
            nearbyDonorsFound: nearbyDonors?.length || 0,
            notificationsSent
        }, { status: 201 });
    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: 'Failed to create blood request' }, { status: 500 });
    }
}
