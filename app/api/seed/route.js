import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import BloodRequest from '@/models/BloodRequest';

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    try {
        await connectToDatabase();

        // Clear existing
        await User.deleteMany({});
        await BloodRequest.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash('password123', salt);

        // Create Admin
        const admin = await User.create({
            name: 'System Admin',
            phone: '9999999999',
            bloodGroup: 'O+',
            location: 'System',
            password: defaultPassword,
            role: 'admin'
        });

        // Create Donors
        const donors = await User.insertMany([
            { name: 'Rahul Sharma', phone: '9876543210', bloodGroup: 'A+', location: 'Mumbai', password: defaultPassword, role: 'donor', isAvailable: true },
            { name: 'Priya Patel', phone: '9876543211', bloodGroup: 'O-', location: 'Delhi', password: defaultPassword, role: 'donor', isAvailable: true },
            { name: 'Amit Kumar', phone: '9876543212', bloodGroup: 'B+', location: 'Bangalore', password: defaultPassword, role: 'donor', isAvailable: false },
            { name: 'Neha Singh', phone: '9876543213', bloodGroup: 'AB+', location: 'Mumbai', password: defaultPassword, role: 'donor', isAvailable: true },
        ]);

        // Create Requesters
        const requesters = await User.insertMany([
            { name: 'Hospital A Coordinator', phone: '8888888881', bloodGroup: 'A+', location: 'Mumbai', password: defaultPassword, role: 'requester' },
            { name: 'Patient Relative B', phone: '8888888882', bloodGroup: 'O-', location: 'Delhi', password: defaultPassword, role: 'requester' },
        ]);

        // Create Blood Requests
        await BloodRequest.insertMany([
            {
                patientName: 'Anil Gupta',
                bloodGroup: 'A+',
                unitsRequired: 2,
                hospitalName: 'City Care Hospital',
                location: 'Mumbai',
                urgencyLevel: 'Emergency',
                requester: requesters[0]._id,
                status: 'pending'
            },
            {
                patientName: 'Sunita Devi',
                bloodGroup: 'O-',
                unitsRequired: 1,
                hospitalName: 'Fortis Memorial',
                location: 'Delhi',
                urgencyLevel: 'Urgent',
                requester: requesters[1]._id,
                status: 'pending'
            },
            {
                patientName: 'Vihaan Verma',
                bloodGroup: 'B+',
                unitsRequired: 3,
                hospitalName: 'Apollo Hospital',
                location: 'Bangalore',
                urgencyLevel: 'Normal',
                requester: requesters[0]._id,
                status: 'fulfilled'
            }
        ]);

        return NextResponse.json({
            message: 'Sample data generated successfully!',
            credentials: {
                admin: '9999999999 / password123',
                donor: '9876543210 / password123',
                requester: '8888888881 / password123'
            }
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
    }
}
