'use client';

import { useState, useRef, useCallback } from 'react';
import { LifeSheetGridProps, CellData, ColumnDef } from '@/types/sheet';
import './LifeSheetGrid.css';

export default function LifeSheetGrid({
    sheet,
    columns,
    categories,
    parentPlan,
    drillDownOptions,
    onCellUpdate,
    onDrillDown,
}: LifeSheetGridProps) {
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // Group columns by group header
    const groups = columns.reduce<{ group: string; cols: ColumnDef[] }[]>((acc, col) => {
        const groupName = col.group || '';
        const existing = acc.find((g) => g.group === groupName);
        if (existing) {
            existing.cols.push(col);
        } else {
            acc.push({ group: groupName, cols: [col] });
        }
        return acc;
    }, []);
    const hasGroups = groups.some((g) => g.group !== '');

    // Get cell data helper
    function getCellData(categoryId: string, columnKey: string): CellData {
        const found = sheet.cells.find(
            (c) => c.categoryId === categoryId && c.columnKey === columnKey
        );
        return found || {
            sheetId: sheet.id,
            categoryId,
            columnKey,
            content: null,
            checked: false,
        };
    }

    // Start editing a text cell
    function handleCellClick(categoryId: string, col: ColumnDef) {
        if (col.type === 'checkbox') return;
        const cellKey = `${categoryId}-${col.key}`;
        const cell = getCellData(categoryId, col.key);
        setEditingCell(cellKey);
        setEditContent(cell.content || '');
    }

    // Save text cell
    function handleCellSave(categoryId: string, columnKey: string) {
        const cell = getCellData(categoryId, columnKey);
        onCellUpdate({
            ...cell,
            content: editContent,
        });
        setEditingCell(null);
    }

    // Toggle checkbox
    function handleCheckToggle(categoryId: string, columnKey: string) {
        const cell = getCellData(categoryId, columnKey);
        onCellUpdate({
            ...cell,
            checked: !cell.checked,
        });
    }

    return (
        <div className="life-sheet-grid">
            {/* Parent plan table */}
            {parentPlan && (
                <div className="parent-plan-section">
                    <div className="parent-plan-label">上位計画（{parentPlan.label}）</div>
                    <table className="parent-plan-table">
                        <thead>
                            <tr>
                                {categories.map((cat) => (
                                    <th key={cat.id} className="parent-plan-header">
                                        {cat.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {categories.map((cat) => {
                                    const plan = parentPlan.plans.find((p) => p.categoryId === cat.id);
                                    return (
                                        <td key={cat.id} className="parent-plan-cell">
                                            {plan?.content || '—'}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Grid table */}
            <div className="grid-table-wrapper">
                <table className="grid-table">
                    <thead>
                        {/* Group header row */}
                        {hasGroups && (
                            <tr className="group-header-row">
                                <th className="category-header"></th>
                                {groups.map((g, i) => (
                                    <th
                                        key={i}
                                        colSpan={g.cols.length}
                                        className={`group-header ${g.group ? 'has-group' : ''}`}
                                    >
                                        {g.group}
                                    </th>
                                ))}
                            </tr>
                        )}
                        {/* Column header row */}
                        <tr className="column-header-row">
                            <th className="category-header"></th>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="column-header"
                                    style={col.width ? { width: col.width } : undefined}
                                >
                                    <div className="column-label">{col.label}</div>
                                    {col.subLabel && (
                                        <div className="column-sub-label">{col.subLabel}</div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} className="category-row">
                                <td className="category-cell">
                                    <div className="category-name">{cat.name}</div>
                                    <div className="category-sub-name">{cat.subName}</div>
                                </td>
                                {columns.map((col) => {
                                    const cellKey = `${cat.id}-${col.key}`;
                                    const cellData = getCellData(cat.id, col.key);
                                    const isEditing = editingCell === cellKey;

                                    if (col.type === 'checkbox') {
                                        return (
                                            <td key={col.key} className="grid-cell checkbox-cell">
                                                <label className="checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        checked={cellData.checked}
                                                        onChange={() => handleCheckToggle(cat.id, col.key)}
                                                    />
                                                    <span className="checkbox-custom"></span>
                                                </label>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={col.key}
                                            className={`grid-cell text-cell ${isEditing ? 'editing' : ''}`}
                                            onDoubleClick={() => handleCellClick(cat.id, col)}
                                        >
                                            {isEditing ? (
                                                <div className="cell-editor">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => {
                                                            setEditContent(e.target.value);
                                                            e.target.style.height = '100px';
                                                            e.target.style.height = Math.max(e.target.scrollHeight, 100) + 'px';
                                                        }}
                                                        ref={(el) => {
                                                            if (el) {
                                                                el.style.height = '100px';
                                                                el.style.height = Math.max(el.scrollHeight, 100) + 'px';
                                                                el.focus({ preventScroll: true });
                                                            }
                                                        }}
                                                        onBlur={() => handleCellSave(cat.id, col.key)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Escape') {
                                                                setEditingCell(null);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="cell-content">
                                                    {cellData.content || ''}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Drill down buttons */}
            {drillDownOptions && drillDownOptions.length > 0 && onDrillDown && (
                <div className="drill-down-bar">
                    {drillDownOptions.map((option, i) => (
                        <button
                            key={i}
                            className="drill-down-button"
                            onClick={() => onDrillDown(option)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
