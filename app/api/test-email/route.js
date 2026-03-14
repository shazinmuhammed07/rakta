import { NextResponse } from 'next/server';
import { sendDonorNotificationEmail } from '@/lib/resend';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');

    if (!to) {
        return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 });
    }

    const result = await sendDonorNotificationEmail({
        donorEmail: to,
        donorName: 'Test Donor',
        bloodGroup: 'A+',
        patientName: 'Test Patient',
        unitsRequired: 2,
        hospitalName: 'City Hospital',
        locationName: 'Kalamassery',
        urgencyLevel: 'Emergency',
        requesterPhone: '9999999999',
    });

    if (result) {
        return NextResponse.json({ success: true, message: `Test email sent to ${to}` });
    } else {
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to send. Check server logs.',
            resendKey: process.env.RESEND_API_KEY ? 'SET ✅' : 'MISSING ❌',
            fromEmail: process.env.RESEND_FROM_EMAIL || 'NOT SET',
        }, { status: 500 });
    }
}
