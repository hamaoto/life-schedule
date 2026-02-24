'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const currentYear = new Date().getFullYear();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    // Build folder tree
    function buildTree(year: number): FolderNode {
        return {
            label: `${year}年度`,
            level: 'year',
            year,
            period: 0,
            children: [
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
                            period: getWeekNumber(year, m, i + 1),
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
                            period: getWeekNumber(year, m, i + 1),
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
                            period: getWeekNumber(year, m, i + 1),
                        })),
                    })),
                },
            ],
        };
    }

    function getWeekNumber(year: number, month: number, weekInMonth: number): number {
        const firstDay = new Date(year, month - 1, (weekInMonth - 1) * 7 + 1);
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((firstDay.getTime() - startOfYear.getTime()) / 86400000);
        return Math.ceil((days + startOfYear.getDay() + 1) / 7);
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

    const years = [currentYear - 1, currentYear, currentYear + 1];

    function renderNode(node: FolderNode, path: string) {
        const isExpanded = expandedPaths.has(path);
        const hasChildren = node.children && node.children.length > 0;
        const icon = hasChildren ? (isExpanded ? '📂' : '📁') : '📄';

        return (
            <div key={path} className="folder-node">
                <div className="folder-row">
                    <button
                        className="folder-label"
                        onDoubleClick={() => hasChildren && toggleExpand(path)}
                        onClick={() => !hasChildren && openSheet(node.level, node.year, node.period)}
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
        <div>
            <div className="page-header">
                <h1 className="page-title">Jump</h1>
                <p className="page-subtitle">フォルダ階層からシートを開く</p>
            </div>
            <div className="jump-tree">
                {years.map((y) => renderNode(buildTree(y), `year-${y}`))}
            </div>
        </div>
    );
}
