'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPhaseStartYear, encodeWeekPeriod, getSheetLabel } from '@/types/sheet';
import './jump.css';

interface FolderNode {
    label: string;
    level: string;
    year: number;
    period: number;
    children?: FolderNode[];
}

export default function JumpPage() {
    const router = useRouter();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['life-root', 'phases-root']));
    const [birthYear, setBirthYear] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data.profile) {
                    setBirthYear(data.profile.birthYear);
                }
            })
            .catch(err => console.error('Failed to fetch profile:', err));
    }, []);

    // Build year tree
    function buildYearTree(year: number): FolderNode[] {
        return [
            {
                label: '1-4月',
                level: 'quarter',
                year,
                period: 1,
                children: [1, 2, 3, 4].map((m) => ({
                    label: `${m}月`,
                    level: 'month',
                    year,
                    period: m,
                    children: Array.from({ length: 5 }, (_, i) => ({
                        label: `第${i + 1}週`,
                        level: 'week',
                        year,
                        period: encodeWeekPeriod(m, i + 1),
                    })),
                })),
            },
            {
                label: '5-8月',
                level: 'quarter',
                year,
                period: 2,
                children: [5, 6, 7, 8].map((m) => ({
                    label: `${m}月`,
                    level: 'month',
                    year,
                    period: m,
                    children: Array.from({ length: 5 }, (_, i) => ({
                        label: `第${i + 1}週`,
                        level: 'week',
                        year,
                        period: encodeWeekPeriod(m, i + 1),
                    })),
                })),
            },
            {
                label: '9-12月',
                level: 'quarter',
                year,
                period: 3,
                children: [9, 10, 11, 12].map((m) => ({
                    label: `${m}月`,
                    level: 'month',
                    year,
                    period: m,
                    children: Array.from({ length: 5 }, (_, i) => ({
                        label: `第${i + 1}週`,
                        level: 'week',
                        year,
                        period: encodeWeekPeriod(m, i + 1),
                    })),
                })),
            },
        ];
    }

    function toggleExpand(path: string) {
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }

    function openSheet(level: string, year: number, period: number) {
        router.push(`/sheet/${level}/${year}/${period}`);
    }

    // Generate phases from 2025 up to 2100+
    const startYear = 2025;
    const endYear = 2101;
    const phaseStarts: number[] = [];
    for (let y = getPhaseStartYear(startYear, birthYear); y <= endYear; y += 3) {
        phaseStarts.push(y);
    }

    function renderNode(node: FolderNode, path: string) {
        const isExpanded = expandedPaths.has(path);
        const hasChildren = node.children && node.children.length > 0;
        const icon = hasChildren ? (isExpanded ? '📂' : '📁') : '📄';

        return (
            <div key={path} className="folder-node">
                <div className="folder-row">
                    <button
                        className="folder-label"
                        onClick={() => hasChildren ? toggleExpand(path) : openSheet(node.level, node.year, node.period)}
                    >
                        <span className="folder-icon">{icon}</span>
                        <span className="folder-name">{node.label}</span>
                    </button>
                    <button
                        className="folder-open-btn"
                        onClick={() => openSheet(node.level, node.year, node.period)}
                    >
                        開く
                    </button>
                </div>
                {hasChildren && isExpanded && (
                    <div className="folder-children">
                        {node.children!.map((child, i) =>
                            renderNode(child, `${path}/${i}`)
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="jump-page">
            <div className="page-header">
                <h1 className="page-title">Jump</h1>
                <p className="page-subtitle">フォルダ階層からシートを開く</p>
            </div>

            <div className="jump-tree">
                {/* Life Plan Root */}
                {renderNode({
                    label: '人生設計 (全体像)',
                    level: 'life',
                    year: 0,
                    period: 0
                }, 'life-root')}

                <div className="tree-divider">フェーズ別計画</div>

                {/* Phases and Years */}
                {phaseStarts.map((ps) => renderNode({
                    label: `${ps}-${ps + 2}年フェーズ`,
                    level: 'phase',
                    year: ps,
                    period: 0,
                    children: [0, 1, 2].map(offset => ({
                        label: `${ps + offset}年度`,
                        level: 'year',
                        year: ps + offset,
                        period: 0,
                        children: buildYearTree(ps + offset)
                    }))
                }, `phase-${ps}`))}
            </div>
        </div>
    );
}
