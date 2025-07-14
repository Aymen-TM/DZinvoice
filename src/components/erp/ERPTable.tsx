'use client';

import type { TableData } from '@/types/erp';

interface ERPTableProps {
  tableData: TableData;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

export default function ERPTable({ tableData, onEdit, onDelete }: ERPTableProps) {
  const { columns, rows } = tableData;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-[var(--card)] rounded-xl overflow-hidden shadow-lg">
        <thead className="bg-[var(--primary)]/10 border-b border-[var(--border)]">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-[var(--primary-dark)] tracking-wide"
              >
                {column}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--primary-dark)] tracking-wide">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-[var(--table-row-alt)] transition-colors duration-200"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-[var(--foreground)]"
                >
                  {cell}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(rowIndex)}
                        className="text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors p-1 rounded"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(rowIndex)}
                        className="text-[var(--danger)] hover:text-red-700 transition-colors p-1 rounded"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 