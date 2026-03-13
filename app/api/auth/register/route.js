import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';

export async function POST(request) {
    try {
        await connectToDatabase();
        const { name, phone, bloodGroup, location, locationName, password, role } = await request.json();

        // Validate inputs
        if (!name || !phone || !bloodGroup || !location || !location.coordinates || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            phone,
            bloodGroup,
            location,
            locationName,
            password: hashedPassword,
            role: role || 'donor',
        });

        // Create JWT Token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ id: user._id, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(secret);

        const response = NextResponse.json({
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                bloodGroup: user.bloodGroup,
            }
        }, { status: 201 });

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
