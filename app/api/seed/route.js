import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Seed logic removed during migration from MongoDB to Supabase. Re-implement using Supabase CLI if necessary.' }, { status: 200 });
}
