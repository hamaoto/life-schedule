import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest-id')?.value;

    if (!guestId) {
        return NextResponse.json({ message: 'No guest data to sync' });
    }

    try {
        // Find all guest sheets
        const guestSheets = await prisma.sheet.findMany({
            where: { userId: guestId },
            include: { cells: true },
        });

        for (const guestSheet of guestSheets) {
            // Check if real user already has this sheet
            const existingUserSheet = await prisma.sheet.findUnique({
                where: {
                    userId_level_year_period: {
                        userId: user.id,
                        level: guestSheet.level,
                        year: guestSheet.year,
                        period: guestSheet.period,
                    },
                },
            });

            if (!existingUserSheet) {
                // No conflict, just update the userId
                await prisma.sheet.update({
                    where: { id: guestSheet.id },
                    data: { userId: user.id },
                });
            } else {
                // Conflict! Merge cells (non-destructively)
                for (const guestCell of guestSheet.cells) {
                    await prisma.cell.upsert({
                        where: {
                            sheetId_categoryId_columnKey: {
                                sheetId: existingUserSheet.id,
                                categoryId: guestCell.categoryId,
                                columnKey: guestCell.columnKey,
                            },
                        },
                        update: {}, // Don't overwrite existing user data
                        create: {
                            sheetId: existingUserSheet.id,
                            categoryId: guestCell.categoryId,
                            columnKey: guestCell.columnKey,
                            content: guestCell.content,
                            checked: guestCell.checked,
                        },
                    });
                }
                // Delete the guest sheet after merging its cells
                await prisma.sheet.delete({ where: { id: guestSheet.id } });
            }
        }

        // Also migrate DocLinks
        await prisma.docLink.updateMany({
            where: { userId: guestId },
            data: { userId: user.id },
        });

        // Delete guest-id cookie after successful sync
        const response = NextResponse.json({ message: 'Sync successful' });
        response.cookies.delete('guest-id');
        return response;

    } catch (error) {
        console.error('Manual sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
