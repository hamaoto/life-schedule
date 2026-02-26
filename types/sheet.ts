// Sheet hierarchy levels
export type SheetLevel = 'life' | 'phase' | 'year' | 'quarter' | 'month' | 'week';

// Column definition for the grid
export interface ColumnDef {
    key: string;
    label: string;
    subLabel?: string;
    group?: string;
    type: 'text' | 'checkbox';
    width?: string;
}

// Row category definition
export interface RowDef {
    id: string;
    name: string;
    subName: string;
    sortOrder: number;
}

// Cell data
export interface CellData {
    id?: string;
    sheetId: string;
    categoryId: string;
    columnKey: string;
    content: string | null;
    checked: boolean;
}

// Sheet data
export interface SheetData {
    id: string;
    level: SheetLevel;
    year: number;
    period: number;
    label: string | null;
    parentId: string | null;
    cells: CellData[];
}

// Drill-down option
export interface DrillDownOption {
    label: string;
    level: SheetLevel;
    year: number;
    period: number;
}

// Props for LifeSheetGrid
export interface LifeSheetGridProps {
    sheet: SheetData;
    columns: ColumnDef[];
    categories: RowDef[];
    parentPlan?: ParentPlanData | null;
    drillDownOptions?: DrillDownOption[];
    onCellUpdate: (cell: CellData) => void;
    onDrillDown?: (option: DrillDownOption) => void;
}

// Parent plan display
export interface ParentPlanData {
    level: SheetLevel;
    label: string;
    plans: {
        categoryId: string;
        content: string | null;
    }[];
}

// PDCA columns — used for ALL levels
export const PDCA_COLUMNS: ColumnDef[] = [
    { key: 'plan', label: 'P', group: '計画', type: 'text', width: '30%' },
    { key: 'indicator', label: 'KPI', group: '計画', type: 'text', width: '20%' },
    { key: 'do', label: 'D', group: '振り返り', type: 'checkbox', width: '5%' },
    { key: 'check', label: 'C', group: '振り返り', type: 'checkbox', width: '5%' },
    { key: 'action', label: 'A', group: '振り返り', type: 'text', width: '20%' },
];

// Level labels
export const LEVEL_LABELS: Record<SheetLevel, string> = {
    life: '人生',
    phase: '3年間',
    year: '年間',
    quarter: '4ヶ月',
    month: '月間',
    week: '週間',
};

// Child level mapping
export const CHILD_LEVEL: Record<SheetLevel, SheetLevel | null> = {
    life: 'phase',
    phase: 'year',
    year: 'quarter',
    quarter: 'month',
    month: 'week',
    week: null,
};

export const PARENT_LEVEL: Record<SheetLevel, SheetLevel | null> = {
    life: null,
    phase: 'life',
    year: 'phase',
    quarter: 'year',
    month: 'quarter',
    week: 'month',
};

// Week encoding helpers: period = (month-1)*5 + weekOfMonth
export function encodeWeekPeriod(month: number, weekOfMonth: number): number {
    return (month - 1) * 5 + weekOfMonth;
}

export function decodeWeekPeriod(period: number): { month: number; weekOfMonth: number } {
    const month = Math.floor((period - 1) / 5) + 1;
    const weekOfMonth = ((period - 1) % 5) + 1;
    return { month, weekOfMonth };
}

// Calculate the start year of a 3-year phase
// Anchored to birthYear (or 0 if not set) to ensure stability over time
export function getPhaseStartYear(year: number, birthYear: number | null): number {
    const anchor = birthYear || 0;
    const diff = year - anchor;
    // Handle negative diff correctly
    const phaseIndex = Math.floor(diff / 3);
    return anchor + phaseIndex * 3;
}

// Generate sheet label
export function getSheetLabel(level: SheetLevel, year: number, period: number): string {
    switch (level) {
        case 'life':
            return '人生設計';
        case 'phase':
            return `${year}-${year + 2}年`;
        case 'year':
            return `${year}年`;
        case 'quarter':
            const startMonth = (period - 1) * 4 + 1;
            const endMonth = startMonth + 3;
            return `${year}年 ${startMonth}-${endMonth}月`;
        case 'month':
            return `${year}年 ${period}月`;
        case 'week': {
            const { month, weekOfMonth } = decodeWeekPeriod(period);
            return `${year}年 ${month}月 第${weekOfMonth}週`;
        }
    }
}
