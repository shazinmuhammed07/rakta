import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import BloodRequest from '@/models/BloodRequest';

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectToDatabase();

        const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
        const requests = await BloodRequest.find({}).populate('requester', 'name phone').sort({ createdAt: -1 });

        return NextResponse.json({ users, requests });
    } catch (error) {
        console.error('Admin data fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }
}
