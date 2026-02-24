'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LifeSheetGrid from '@/components/LifeSheetGrid/LifeSheetGrid';
import {
    PDCA_COLUMNS,
    LEVEL_LABELS,
    CHILD_LEVEL,
    SheetLevel,
    SheetData,
    RowDef,
    CellData,
    ParentPlanData,
    DrillDownOption,
    getSheetLabel,
    encodeWeekPeriod,
    decodeWeekPeriod,
} from '@/types/sheet';

// Helper: get current date info
function getNow() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const weekOfMonth = Math.min(Math.ceil(now.getDate() / 7), 5);
    return {
        year: now.getFullYear(),
        month,
        quarter: Math.ceil(month / 4),
        weekPeriod: encodeWeekPeriod(month, weekOfMonth),
    };
}

interface PeriodNavItem {
    label: string;
    year: number;
    period: number;
}

export default function SheetPage() {
    const params = useParams();
    const router = useRouter();
    const level = params.level as SheetLevel;
    const year = parseInt(params.year as string);
    const period = parseInt(params.period as string);

    const [sheet, setSheet] = useState<SheetData | null>(null);
    const [categories, setCategories] = useState<RowDef[]>([]);
    const [parentPlan, setParentPlan] = useState<ParentPlanData | null>(null);
    const [birthYear, setBirthYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSheet = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/sheet?level=${level}&year=${year}&period=${period}`);
            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                const errorData = await res.json().catch(() => ({}));
                console.error('API error:', res.status, errorData);
                setError(`APIエラー (${res.status}): ${errorData.detail || errorData.error || '不明なエラー'}`);
                return;
            }
            const data = await res.json();
            setSheet(data.sheet);
            setCategories(data.categories);
            setParentPlan(data.parentPlan);
            setBirthYear(data.birthYear || null);
        } catch (err) {
            console.error('Failed to fetch sheet:', err);
            setError('ネットワークエラー: サーバーに接続できません');
        } finally {
            setLoading(false);
        }
    }, [level, year, period]);

    useEffect(() => {
        fetchSheet();
    }, [fetchSheet]);

    async function handleCellUpdate(cell: CellData) {
        if (!sheet) return;
        try {
            await fetch('/api/cell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId: sheet.id,
                    categoryId: cell.categoryId,
                    columnKey: cell.columnKey,
                    content: cell.content,
                    checked: cell.checked,
                }),
            });
            setSheet((prev) => {
                if (!prev) return prev;
                const existingIdx = prev.cells.findIndex(
                    (c) => c.categoryId === cell.categoryId && c.columnKey === cell.columnKey
                );
                const newCells = [...prev.cells];
                if (existingIdx >= 0) {
                    newCells[existingIdx] = { ...newCells[existingIdx], ...cell };
                } else {
                    newCells.push(cell);
                }
                return { ...prev, cells: newCells };
            });
        } catch (err) {
            console.error('Failed to save cell:', err);
        }
    }

    // Generate drill-down options based on current level
    function getDrillDownOptions(): DrillDownOption[] {
        const childLevel = CHILD_LEVEL[level];
        if (!childLevel) return [];

        const now = getNow();

        switch (level) {
            case 'life': {
                // Life → 3-year phase buttons starting from current year
                return Array.from({ length: 5 }, (_, i) => {
                    const phaseStart = now.year + i * 3;
                    return {
                        label: `${phaseStart}-${phaseStart + 2}年を開く`,
                        level: 'phase' as SheetLevel,
                        year: phaseStart,
                        period: 0,
                    };
                });
            }
            case 'phase': {
                // Phase → 3 individual year buttons
                return Array.from({ length: 3 }, (_, i) => ({
                    label: `${year + i}年を開く`,
                    level: 'year' as SheetLevel,
                    year: year + i,
                    period: 0,
                }));
            }
            case 'year':
                return [
                    { label: '1-4月を開く', level: 'quarter', year, period: 1 },
                    { label: '5-8月を開く', level: 'quarter', year, period: 2 },
                    { label: '9-12月を開く', level: 'quarter', year, period: 3 },
                ];
            case 'quarter': {
                const startMonth = (period - 1) * 4 + 1;
                return Array.from({ length: 4 }, (_, i) => ({
                    label: `${startMonth + i}月を開く`,
                    level: 'month' as SheetLevel,
                    year,
                    period: startMonth + i,
                }));
            }
            case 'month': {
                // Month → 5 week buttons (per-month weeks)
                return Array.from({ length: 5 }, (_, i) => ({
                    label: `第${i + 1}週を開く`,
                    level: 'week' as SheetLevel,
                    year,
                    period: encodeWeekPeriod(period, i + 1),
                }));
            }
            default:
                return [];
        }
    }

    function handleDrillDown(option: DrillDownOption) {
        router.push(`/sheet/${option.level}/${option.year}/${option.period}`);
    }

    // Tab navigation — always navigate to current period
    const allLevels: SheetLevel[] = ['life', 'phase', 'year', 'quarter', 'month', 'week'];
    function navigateToLevel(targetLevel: SheetLevel) {
        const now = getNow();
        let targetYear = now.year;
        let targetPeriod = 0;

        switch (targetLevel) {
            case 'life':
                targetYear = 0;
                targetPeriod = 0;
                break;
            case 'phase':
                // Phase containing current year
                targetYear = now.year;
                targetPeriod = 0;
                break;
            case 'year':
                targetPeriod = 0;
                break;
            case 'quarter':
                targetPeriod = now.quarter;
                break;
            case 'month':
                targetPeriod = now.month;
                break;
            case 'week':
                targetPeriod = now.weekPeriod;
                break;
        }
        router.push(`/sheet/${targetLevel}/${targetYear}/${targetPeriod}`);
    }

    // Period navigator — ← [buttons] → 
    function getPeriodNav(): { items: PeriodNavItem[]; prev: PeriodNavItem; next: PeriodNavItem } | null {
        const groupSize = 4;

        switch (level) {
            case 'year': {
                const items = [
                    { label: `${year - 1}年`, year: year - 1, period: 0 },
                    { label: `${year}年`, year, period: 0 },
                    { label: `${year + 1}年`, year: year + 1, period: 0 },
                ];
                return {
                    items,
                    prev: { label: '', year: year - 2, period: 0 },
                    next: { label: '', year: year + 2, period: 0 },
                };
            }
            case 'quarter': {
                const items: PeriodNavItem[] = [
                    { label: '1-4月', year, period: 1 },
                    { label: '5-8月', year, period: 2 },
                    { label: '9-12月', year, period: 3 },
                ];
                return {
                    items,
                    prev: { label: '', year: year - 1, period: 3 },
                    next: { label: '', year: year + 1, period: 1 },
                };
            }
            case 'month': {
                const groupStart = Math.floor((period - 1) / groupSize) * groupSize + 1;
                const items: PeriodNavItem[] = Array.from({ length: groupSize }, (_, i) => ({
                    label: `${groupStart + i}月`,
                    year,
                    period: groupStart + i,
                })).filter(item => item.period <= 12);

                // ← goes to last month of previous group
                const prevPeriod = groupStart - 1;
                const prev = prevPeriod < 1
                    ? { label: '', year: year - 1, period: 12 }
                    : { label: '', year, period: prevPeriod };

                // → goes to first month of next group
                const nextPeriod = groupStart + groupSize;
                const next = nextPeriod > 12
                    ? { label: '', year: year + 1, period: 1 }
                    : { label: '', year, period: nextPeriod };

                return { items, prev, next };
            }
            case 'week': {
                // Weeks are per-month (1-5), show all 5 weeks of current month
                const { month: weekMonth } = decodeWeekPeriod(period);
                const items: PeriodNavItem[] = Array.from({ length: 5 }, (_, i) => ({
                    label: `第${i + 1}週`,
                    year,
                    period: encodeWeekPeriod(weekMonth, i + 1),
                }));

                // ← goes to previous month's week 5
                const prevMonth = weekMonth - 1;
                const prev = prevMonth < 1
                    ? { label: '', year: year - 1, period: encodeWeekPeriod(12, 5) }
                    : { label: '', year, period: encodeWeekPeriod(prevMonth, 5) };

                // → goes to next month's week 1
                const nextMonth = weekMonth + 1;
                const next = nextMonth > 12
                    ? { label: '', year: year + 1, period: encodeWeekPeriod(1, 1) }
                    : { label: '', year, period: encodeWeekPeriod(nextMonth, 1) };

                return { items, prev, next };
            }
            case 'phase': {
                const items: PeriodNavItem[] = [
                    { label: `${year}-${year + 2}年`, year, period: 0 },
                ];
                return {
                    items,
                    prev: { label: '', year: year - 3, period: 0 },
                    next: { label: '', year: year + 3, period: 0 },
                };
            }
            default:
                return null;
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>読み込み中...</p>
            </div>
        );
    }

    if (!sheet) {
        return (
            <div className="loading-container">
                <p>{error || 'シートの読み込みに失敗しました'}</p>
                <button onClick={fetchSheet} style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    再読み込み
                </button>
            </div>
        );
    }

    const sheetLabel = getSheetLabel(level, year, period);
    const drillDownOptions = getDrillDownOptions();
    const periodNav = getPeriodNav();

    // Build age suffix
    let ageLabel = '';
    if (birthYear && year > 0) {
        const age = year - birthYear;
        if (age >= 0) {
            if (level === 'phase') {
                ageLabel = `（${age}〜${age + 2}歳）`;
            } else {
                ageLabel = `（${age}歳）`;
            }
        }
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">人生設計シート（具体版）</h1>
                    <p className="page-subtitle">{sheetLabel}{ageLabel && <span className="age-label">{ageLabel}</span>}</p>
                </div>
                {/* Period navigator */}
                {periodNav && (
                    <div className="period-nav">
                        <button
                            className="period-nav-arrow"
                            onClick={() => router.push(`/sheet/${level}/${periodNav.prev.year}/${periodNav.prev.period}`)}
                        >
                            ←
                        </button>
                        <div className="period-nav-buttons">
                            {periodNav.items.map((item, i) => (
                                <button
                                    key={i}
                                    className={`period-nav-button ${item.period === period && item.year === year ? 'active' : ''}`}
                                    onClick={() => router.push(`/sheet/${level}/${item.year}/${item.period}`)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <button
                            className="period-nav-arrow"
                            onClick={() => router.push(`/sheet/${level}/${periodNav.next.year}/${periodNav.next.period}`)}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Tab navigation */}
            <div className="tab-nav">
                {allLevels.map((lvl) => (
                    <button
                        key={lvl}
                        className={`tab-button ${lvl === level ? 'active' : ''}`}
                        onClick={() => navigateToLevel(lvl)}
                    >
                        {LEVEL_LABELS[lvl]}
                    </button>
                ))}
            </div>

            <LifeSheetGrid
                sheet={sheet}
                columns={PDCA_COLUMNS}
                categories={categories}
                parentPlan={parentPlan}
                drillDownOptions={drillDownOptions}
                onCellUpdate={handleCellUpdate}
                onDrillDown={handleDrillDown}
            />
        </div>
    );
}
