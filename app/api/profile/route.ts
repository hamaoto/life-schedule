import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/profile — get user profile
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
    });

    if (!profile) {
        profile = await prisma.userProfile.create({
            data: { userId: user.id },
        });
    }

    return NextResponse.json({ profile, email: user.email });
}

// PUT /api/profile — update user profile
export async function PUT(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { birthYear } = body;

    const profile = await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: { birthYear: birthYear || null },
        create: { userId: user.id, birthYear: birthYear || null },
    });

    return NextResponse.json({ profile });
}
