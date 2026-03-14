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
                    id,
                    full_name,
                    phone
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Normalize the data to match frontend expectations (camelCase)
        const normalizedRequests = (requests || []).map(req => ({
            ...req,
            patientName: req.patient_name,
            bloodGroup: req.blood_group,
            unitsRequired: req.units_required,
            hospitalName: req.hospital_name,
            locationName: req.location_name,
            urgencyLevel: req.urgency_level,
            requester: req.requester ? {
                ...req.requester,
                _id: req.requester.id,
                name: req.requester.full_name,
            } : null,
        }));

        return NextResponse.json({ requests: normalizedRequests });
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

        // Use the authenticated user's ID directly (it matches the users table 'id' column)
        const requesterId = user.id;

        // Insert new request using correct snake_case column names
        const { data: newRequestArray, error: insertError } = await supabase
            .from('requests')
            .insert([{
                patient_name: patientName,
                blood_group: bloodGroup,
                units_required: unitsRequired,
                hospital_name: hospitalName,
                location: location,
                location_name: locationName || '',
                urgency_level: urgencyLevel || 'Normal',
                status: 'pending',
                requester_id: requesterId,
            }])
            .select();

        if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
        }
        const newRequest = newRequestArray?.[0];

        // Find available donors to notify (using correct snake_case column names)
        const { data: nearbyDonors, error: donorsError } = await supabase
            .from('users')
            .select('fcm_token')
            .eq('blood_group', bloodGroup)
            .eq('is_available', true)
            .not('fcm_token', 'is', null);

        let notificationsSent = 0;
        if (!donorsError && nearbyDonors && nearbyDonors.length > 0) {
            const recipientTokens = nearbyDonors.map(d => d.fcm_token).filter(Boolean);
            if (recipientTokens.length > 0) {
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
        }

        return NextResponse.json({
            message: 'Blood request created successfully',
            request: newRequest,
            nearbyDonorsFound: nearbyDonors?.length || 0,
            notificationsSent
        }, { status: 201 });
    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create blood request' }, { status: 500 });
    }
}
