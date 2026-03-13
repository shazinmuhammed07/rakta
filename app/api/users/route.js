import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const bloodGroup = searchParams.get('bloodGroup');
        const location = searchParams.get('location');

        let query = { role: 'donor', isAvailable: true };

        if (bloodGroup) {
            // Decode URL component to handle '+' properly e.g. 'A+'
            query.bloodGroup = decodeURIComponent(bloodGroup);
        }

        if (location) {
            query.location = { $regex: new RegExp(location, 'i') };
        }

        const donors = await User.find(query).select('-password -role -createdAt -updatedAt');

        return NextResponse.json({ donors });
    } catch (error) {
        console.error('Donors search error:', error);
        return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
    }
}
