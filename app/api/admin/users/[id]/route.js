import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function DELETE(request, context) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { params } = context;
        const { id } = await params;

        await connectToDatabase();
        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('User deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
