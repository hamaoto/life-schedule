import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSheetLabel, SheetLevel, decodeWeekPeriod } from '@/types/sheet';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/sheet?level=week&year=2026&period=8
export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth error:', authError?.message || 'No user');
            return NextResponse.json({ error: 'Unauthorized', detail: authError?.message }, { status: 401 });
        }
        const userId = user.id;

        const { searchParams } = new URL(req.url);
        const level = (searchParams.get('level') || 'week') as SheetLevel;
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const period = parseInt(searchParams.get('period') || '0');

        // Parallelize independent initial queries
        const [existingSheet, categories, profile] = await Promise.all([
            prisma.sheet.findUnique({
                where: { userId_level_year_period: { userId, level, year, period } },
                include: { cells: true },
            }),
            prisma.category.findMany({
                orderBy: { sortOrder: 'asc' },
            }),
            prisma.userProfile.findUnique({
                where: { userId },
                select: { birthYear: true },
            }),
        ]);

        let sheet = existingSheet;

        if (!sheet) {
            // Find parent sheet ID if it doesn't exist
            let parentId: string | null = null;
            if (level === 'phase') {
                const parent = await prisma.sheet.findUnique({
                    where: { userId_level_year_period: { userId, level: 'life', year: 0, period: 0 } },
                });
                parentId = parent?.id || null;
            } else if (level === 'year') {
                const baseYear = new Date().getFullYear();
                const phaseStart = year - ((year - baseYear) % 3 + 3) % 3;
                const parent = await prisma.sheet.findUnique({
                    where: { userId_level_year_period: { userId, level: 'phase', year: phaseStart, period: 0 } },
                });
                parentId = parent?.id || null;
            } else if (level === 'quarter') {
                const parent = await prisma.sheet.findUnique({
                    where: { userId_level_year_period: { userId, level: 'year', year, period: 0 } },
                });
                parentId = parent?.id || null;
            } else if (level === 'month') {
                const quarter = Math.ceil(period / 4);
                const parent = await prisma.sheet.findUnique({
                    where: { userId_level_year_period: { userId, level: 'quarter', year, period: quarter } },
                });
                parentId = parent?.id || null;
            } else if (level === 'week') {
                const { month } = decodeWeekPeriod(period);
                const parent = await prisma.sheet.findUnique({
                    where: { userId_level_year_period: { userId, level: 'month', year, period: month } },
                });
                parentId = parent?.id || null;
            }

            sheet = await prisma.sheet.create({
                data: { userId, level, year, period, parentId },
                include: { cells: true },
            });
        }

        // Get parent plan content
        let parentPlan = null;
        let parentSheetPromise = null;

        if (level === 'phase') {
            parentSheetPromise = prisma.sheet.findUnique({
                where: { userId_level_year_period: { userId, level: 'life', year: 0, period: 0 } },
                include: { cells: { where: { columnKey: 'indicator' } } },
            });
        } else if (level === 'year') {
            const baseYear = new Date().getFullYear();
            const phaseStart = year - ((year - baseYear) % 3 + 3) % 3;
            parentSheetPromise = prisma.sheet.findUnique({
                where: { userId_level_year_period: { userId, level: 'phase', year: phaseStart, period: 0 } },
                include: { cells: { where: { columnKey: 'indicator' } } },
            });
        } else if (level === 'quarter') {
            parentSheetPromise = prisma.sheet.findUnique({
                where: { userId_level_year_period: { userId, level: 'year', year, period: 0 } },
                include: { cells: { where: { columnKey: 'indicator' } } },
            });
        } else if (level === 'month') {
            const quarter = Math.ceil(period / 4);
            parentSheetPromise = prisma.sheet.findUnique({
                where: { userId_level_year_period: { userId, level: 'quarter', year, period: quarter } },
                include: { cells: { where: { columnKey: 'indicator' } } },
            });
        } else if (level === 'week') {
            const { month } = decodeWeekPeriod(period);
            parentSheetPromise = prisma.sheet.findUnique({
                where: { userId_level_year_period: { userId, level: 'month', year, period: month } },
                include: { cells: { where: { columnKey: 'indicator' } } },
            });
        }

        const parentSheet = parentSheetPromise ? await parentSheetPromise : null;

        if (parentSheet) {
            parentPlan = {
                level: parentSheet.level,
                label: getSheetLabel(parentSheet.level as SheetLevel, parentSheet.year, parentSheet.period),
                plans: parentSheet.cells.map((c: any) => ({
                    categoryId: c.categoryId,
                    content: c.content,
                })),
            };
        }

        return NextResponse.json({
            sheet,
            categories,
            parentPlan,
            birthYear: profile?.birthYear || null
        });
    } catch (error) {
        console.error('Sheet API error:', error);
        return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
    }
}
