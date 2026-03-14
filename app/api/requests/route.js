import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendDonorNotificationEmail } from '@/lib/resend';

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

        if (error) throw error;

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
        const requesterId = user.id;

        // Extract request coordinates [lng, lat]
        const reqLng = location.coordinates[0];
        const reqLat = location.coordinates[1];

        // Insert new blood request
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

        // Fetch the requester's phone number for the email
        const { data: requesterProfile } = await supabase
            .from('users')
            .select('phone, full_name')
            .eq('id', requesterId)
            .single();
        const requesterPhone = requesterProfile?.phone || user.user_metadata?.phone || '';

        // ----------------------------------------------------------------
        // Find donors within 10km radius with matching blood group
        // Uses the get_donors_within_radius() Haversine SQL function
        // ----------------------------------------------------------------
        const RADIUS_KM = 10;
        const { data: nearbyDonors, error: donorsError } = await supabase
            .rpc('get_donors_within_radius', {
                req_lat: reqLat,
                req_lng: reqLng,
                radius_km: RADIUS_KM,
                req_blood_group: bloodGroup,
            });

        if (donorsError) {
            console.error('Error finding nearby donors:', donorsError);
        }

        let emailsSent = 0;
        let notificationsSent = 0;

        // ----------------------------------------------------------------
        // Send email notifications to each nearby donor
        // ----------------------------------------------------------------
        if (nearbyDonors && nearbyDonors.length > 0) {
            const emailPromises = nearbyDonors
                .filter(donor => donor.email && donor.id !== requesterId) // skip requester themselves
                .map(donor =>
                    sendDonorNotificationEmail({
                        donorEmail: donor.email,
                        donorName: donor.full_name,
                        bloodGroup,
                        patientName,
                        unitsRequired,
                        hospitalName,
                        locationName: locationName || '',
                        urgencyLevel: urgencyLevel || 'Normal',
                        requesterPhone,
                    })
                );

            const results = await Promise.allSettled(emailPromises);
            emailsSent = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
        }

        // ----------------------------------------------------------------
        // Also send FCM push notifications (existing logic, kept as bonus)
        // ----------------------------------------------------------------
        try {
            const { data: fcmDonors } = await supabase
                .from('users')
                .select('fcm_token')
                .eq('blood_group', bloodGroup)
                .not('fcm_token', 'is', null);

            if (fcmDonors && fcmDonors.length > 0) {
                const tokens = fcmDonors.map(d => d.fcm_token).filter(Boolean);
                if (tokens.length > 0) {
                    const admin = (await import('@/lib/firebaseAdmin')).default;
                    const response = await admin.messaging().sendEachForMulticast({
                        notification: {
                            title: isEmergency ? "🔴 EMERGENCY: Blood Request!" : "🩸 Blood Needed Nearby",
                            body: `${unitsRequired} units of ${bloodGroup} needed at ${hospitalName}. Can you help?`
                        },
                        tokens,
                    });
                    notificationsSent = response.successCount;
                }
            }
        } catch (fcmError) {
            console.error("FCM notification error:", fcmError);
        }

        return NextResponse.json({
            message: 'Blood request created successfully',
            request: newRequest,
            nearbyDonorsFound: nearbyDonors?.length || 0,
            emailsSent,
            notificationsSent,
        }, { status: 201 });

    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create blood request' }, { status: 500 });
    }
}
