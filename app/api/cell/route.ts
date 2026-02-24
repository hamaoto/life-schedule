import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST /api/cell — upsert a cell
export async function POST(req: NextRequest) {
    // Verify authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sheetId, categoryId, columnKey, content, checked } = body;

    // Verify the sheet belongs to this user
    const sheet = await prisma.sheet.findFirst({
        where: { id: sheetId, userId: user.id },
    });
    if (!sheet) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cell = await prisma.cell.upsert({
        where: {
            sheetId_categoryId_columnKey: {
                sheetId,
                categoryId,
                columnKey,
            },
        },
        update: { content, checked },
        create: { sheetId, categoryId, columnKey, content, checked },
    });

    return NextResponse.json(cell);
}
