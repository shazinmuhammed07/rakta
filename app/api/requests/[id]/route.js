import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import BloodRequest from '@/models/BloodRequest';

export async function PATCH(request, context) {
    try {
        const { params } = context;
        const { id } = await params; // Extracting params like this in Next.js 15+ App Router

        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        await connectToDatabase();
        const { status } = await request.json();

        if (!status || !['pending', 'fulfilled', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const bloodRequest = await BloodRequest.findById(id);

        if (!bloodRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Check authorization: only the creator or an admin can update the request
        if (bloodRequest.requester.toString() !== payload.id && payload.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized to update this request' }, { status: 403 });
        }

        bloodRequest.status = status;
        await bloodRequest.save();

        return NextResponse.json({ message: 'Request updated successfully', request: bloodRequest });
    } catch (error) {
        console.error('Update request error:', error);
        return NextResponse.json({ error: 'Failed to update blood request' }, { status: 500 });
    }
}

export async function GET(request, context) {
    try {
        const { params } = context;
        const { id } = await params;

        await connectToDatabase();
        const bloodRequest = await BloodRequest.findById(id).populate('requester', 'name phone email role');

        if (!bloodRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ request: bloodRequest });
    } catch (error) {
        console.error('Fetch request error:', error);
        return NextResponse.json({ error: 'Failed to fetch blood request' }, { status: 500 });
    }
}
