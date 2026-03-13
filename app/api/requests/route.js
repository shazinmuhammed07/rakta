import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import BloodRequest from '@/models/BloodRequest';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        const requests = await BloodRequest.find({ status })
            .populate('requester', 'name phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Fetch requests error:', error);
        return NextResponse.json({ error: 'Failed to fetch blood requests' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        await connectToDatabase();

        const { patientName, bloodGroup, unitsRequired, hospitalName, location, locationName, urgencyLevel } = await request.json();

        if (!patientName || !bloodGroup || !unitsRequired || !hospitalName || !location || !location.coordinates) {
            return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
        }

        // Determine radius based on urgency
        const isEmergency = urgencyLevel === 'Emergency';
        const searchRadius = isEmergency ? 5000 : 10000; // 5km or 10km

        // Find nearby available donors matching blood group
        const nearbyDonors = await connectToDatabase().then(() => mongoose.model('User').find({
            bloodGroup: bloodGroup,
            isAvailable: true,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: location.coordinates
                    },
                    $maxDistance: searchRadius
                }
            }
        }));

        const newRequest = await BloodRequest.create({
            patientName,
            bloodGroup,
            unitsRequired,
            hospitalName,
            location,
            locationName,
            urgencyLevel: urgencyLevel || 'Normal',
            requester: payload.id, // Authenticated user
        });

        // Trigger FCM Notifications to nearby donors
        let notificationsSent = 0;
        const recipientTokens = nearbyDonors
            .filter(donor => donor.fcmToken) // Only users with tokens
            .map(donor => donor.fcmToken);

        if (recipientTokens.length > 0) {
            try {
                // We'll import dynamically so module loads aren't blocked if env variables are missing
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
                console.log(response.successCount + ' messages were sent successfully');
            } catch (fcmError) {
                console.error("Error sending FCM notifications:", fcmError);
                // Don't fail the request completely if notifications fail
            }
        }

        return NextResponse.json({
            message: 'Blood request created successfully',
            request: newRequest,
            nearbyDonorsFound: nearbyDonors.length,
            notificationsSent
        }, { status: 201 });
    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: 'Failed to create blood request' }, { status: 500 });
    }
}
