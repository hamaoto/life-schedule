import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && user) {
            // Data Migration Logic
            const cookieStore = await cookies();
            const guestId = cookieStore.get('guest-id')?.value;

            if (guestId) {
                try {
                    // 1. Find all guest sheets
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
                            // Conflict! Move cells from guestSheet to existingUserSheet
                            // only if existingUserSheet doesn't have cells for that category/column
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
                } catch (migrationError) {
                    console.error('Data migration error:', migrationError);
                    // Continue even if migration fails
                }
            }

            const isLocalEnv = process.env.NODE_ENV === 'development';
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
