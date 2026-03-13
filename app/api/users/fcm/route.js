import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        await connectToDatabase();

        const { fcmToken } = await request.json();

        if (!fcmToken) {
            return NextResponse.json({ error: 'FCM Token is required' }, { status: 400 });
        }

        // Update the user's FCM token
        await User.findByIdAndUpdate(payload.id, { fcmToken }, { new: true });

        return NextResponse.json({ message: 'FCM Token updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Update FCM token error:', error);
        return NextResponse.json({ error: 'Failed to update FCM token' }, { status: 500 });
    }
}
