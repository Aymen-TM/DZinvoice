"use client";
import React from 'react';

interface ERPTableProps {
  columns: string[];
  rows: string[][];
  visibleColumns: string[];
  activeMenu: string;
  onEdit?: (idx: number) => void;
  onDelete?: (idx: number) => void;
  onDownloadPDF?: (id: string, idx: number) => void;
  onPreviewPDF?: (id: string, idx: number) => void;
  pdfLoadingIdx?: number | null;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  filters: { [key: string]: string[] };
  filterDropdownOpen: string | null;
  onFilterClick: (column: string) => void;
  filterSearch: { [key: string]: string };
  onFilterSearchChange: (column: string, value: string) => void;
  pendingFilters: { [key: string]: string[] };
  onPendingFilterChange: (column: string, value: string, checked: boolean) => void;
  onFilterApply: () => void;
  onFilterClear: (column: string) => void;
  getUniqueColumnValues: (col: string, rows: string[][], colIdx: number, search: string) => string[];
}

export default function ERPTable({
  columns,
  rows,
  visibleColumns,
  activeMenu,
  onEdit,
  onDelete,
  onDownloadPDF,
  onPreviewPDF,
  pdfLoadingIdx,
  sortColumn,
  sortDirection,
  onSort,
  filters,
  filterDropdownOpen,
  onFilterClick,
  filterSearch,
  onFilterSearchChange,
  pendingFilters,
  onPendingFilterChange,
  onFilterApply,
  onFilterClear,
  getUniqueColumnValues
}: ERPTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        Aucune donnée
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto w-full mt-4 rounded-2xl border-2 border-blue-300 shadow-xl">
        <div className="min-w-full overflow-visible">
          <table className="w-full text-sm rounded-2xl overflow-visible border-separate border-spacing-0">
            <thead className="bg-gradient-to-r from-blue-200 to-blue-100 border-b-2 border-blue-300 sticky top-0 z-20">
              <tr>
                {columns.map((col, colIdx) =>
                  visibleColumns.includes(col) ? (
                    <th
                      key={col}
                      className="px-4 py-4 text-left font-bold text-blue-700 uppercase tracking-wider bg-blue-100 border-b-2 border-blue-300 first:rounded-tl-2xl text-sm cursor-pointer select-none relative sticky top-0 z-10"
                      onClick={() => onSort(col)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center">
                          {col}
                          {sortColumn === col && (
                            <span className="ml-1 align-middle text-[10px]">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </span>
                        <span className="relative">
                          <button
                            type="button"
                            className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded hover:bg-blue-200 transition ${(filters[col] && filters[col].length > 0) ? 'text-blue-600' : 'text-gray-400'}`}
                            onClick={e => { e.stopPropagation(); onFilterClick(col); }}
                            title="Filtrer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.586V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-3.414a2 2 0 00-.586-1.414L2 6.707A1 1 0 012 6V4z" />
                            </svg>
                          </button>
                          {filterDropdownOpen === col && (
                            <div className="absolute z-50 right-0 w-56 min-w-[10rem] bg-white border border-blue-200 rounded-lg shadow-lg p-2">
                              <div className="mb-2">
                                <input
                                  type="text"
                                  value={filterSearch[col] ?? ''}
                                  onChange={e => onFilterSearchChange(col, e.target.value)}
                                  placeholder="Rechercher..."
                                  className="w-full px-2 py-1 border border-blue-200 rounded text-xs bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                              </div>
                              <div className="max-h-40 overflow-y-auto mb-2">
                                <label className="flex items-center px-2 py-1 cursor-pointer text-xs">
                                  <input
                                    type="checkbox"
                                    checked={pendingFilters[col]?.length === getUniqueColumnValues(col, rows, colIdx, filterSearch[col] || '').length}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        getUniqueColumnValues(col, rows, colIdx, filterSearch[col] || '').forEach(val => 
                                          onPendingFilterChange(col, val, true)
                                        );
                                      } else {
                                        getUniqueColumnValues(col, rows, colIdx, filterSearch[col] || '').forEach(val => 
                                          onPendingFilterChange(col, val, false)
                                        );
                                      }
                                    }}
                                  />
                                  <span className="ml-2">(Tout sélectionner)</span>
                                </label>
                                {getUniqueColumnValues(col, rows, colIdx, filterSearch[col] || '').map((val: string) => (
                                  <label key={val} className="flex items-center px-2 py-1 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={pendingFilters[col]?.includes(val)}
                                      onChange={e => onPendingFilterChange(col, val, e.target.checked)}
                                    />
                                    <span className="ml-2">{val}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-between gap-2 mt-2">
                                <button
                                  className="flex-1 px-2 py-1 rounded bg-blue-100 text-blue-600 text-xs font-semibold hover:bg-blue-200"
                                  onClick={onFilterApply}
                                >OK</button>
                                <button
                                  className="flex-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200"
                                  onClick={() => onFilterClear(col)}
                                >Effacer</button>
                              </div>
                            </div>
                          )}
                        </span>
                      </div>
                    </th>
                  ) : null
                )}
                {(activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat" || activeMenu === "stock" || activeMenu === "ventes") && (
                  <th className="px-4 py-4 text-left font-bold text-blue-700 uppercase tracking-wider bg-blue-100 border-b-2 border-blue-300 last:rounded-tr-2xl text-sm sticky top-0 z-10">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-white/90" : "bg-gray-50/80"} hover:bg-blue-100 border-b border-blue-100`}>
                  {row.map((cell, i) =>
                    visibleColumns.includes(columns[i]) ? (
                      <td key={i} className="px-4 py-3 whitespace-nowrap text-sm border-b border-blue-100 first:rounded-bl-2xl last:rounded-br-2xl">
                        {cell}
                      </td>
                    ) : null
                  )}
                  {activeMenu === "tiers" && onEdit && onDelete && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                          onClick={() => onEdit(idx)}
                        >
                          Éditer
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          onClick={() => onDelete(idx)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                  {activeMenu === "articles" && onEdit && onDelete && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                          onClick={() => onEdit(idx)}
                        >
                          Éditer
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          onClick={() => onDelete(idx)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                  {activeMenu === "achat" && onEdit && onDelete && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                          onClick={() => onEdit(idx)}
                        >
                          Éditer
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          onClick={() => onDelete(idx)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                  {activeMenu === "stock" && onDelete && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          onClick={() => onDelete(idx)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                  {activeMenu === "ventes" && onEdit && onDelete && onDownloadPDF && onPreviewPDF && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                          onClick={() => onEdit(idx)}
                        >
                          Éditer
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          onClick={() => onDelete(idx)}
                        >
                          Supprimer
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1"
                          onClick={() => onDownloadPDF(rows[idx][1], idx)}
                          disabled={pdfLoadingIdx === idx}
                        >
                          {pdfLoadingIdx === idx ? '...' : 'Télécharger'}
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1"
                          onClick={() => onPreviewPDF(rows[idx][1], idx)}
                          disabled={pdfLoadingIdx === idx}
                        >
                          {pdfLoadingIdx === idx ? '...' : 'Prévisualiser'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4 mt-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3">
            {/* Card Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {activeMenu === "tiers" && "Client"}
                  {activeMenu === "articles" && "Article"}
                  {activeMenu === "achat" && "Achat"}
                  {activeMenu === "stock" && "Stock"}
                  {activeMenu === "ventes" && "Vente"}
                  {" "}#{idx + 1}
                </h3>
              </div>
              <div className="flex gap-2">
                {activeMenu === "tiers" && onEdit && onDelete && (
                  <>
                    <button
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                      onClick={() => onEdit(idx)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                      onClick={() => onDelete(idx)}
                    >
                      Supprimer
                    </button>
                  </>
                )}
                {activeMenu === "articles" && onEdit && onDelete && (
                  <>
                    <button
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                      onClick={() => onEdit(idx)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                      onClick={() => onDelete(idx)}
                    >
                      Supprimer
                    </button>
                  </>
                )}
                {activeMenu === "achat" && onEdit && onDelete && (
                  <>
                    <button
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                      onClick={() => onEdit(idx)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                      onClick={() => onDelete(idx)}
                    >
                      Supprimer
                    </button>
                  </>
                )}
                {activeMenu === "stock" && onDelete && (
                  <button
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                    onClick={() => onDelete(idx)}
                  >
                    Supprimer
                  </button>
                )}
                {activeMenu === "ventes" && onEdit && onDelete && onDownloadPDF && onPreviewPDF && (
                  <>
                    <button
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                      onClick={() => onEdit(idx)}
                    >
                      Éditer
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                      onClick={() => onDelete(idx)}
                    >
                      Supprimer
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                      onClick={() => onDownloadPDF(rows[idx][1], idx)}
                      disabled={pdfLoadingIdx === idx}
                    >
                      {pdfLoadingIdx === idx ? '...' : 'PDF'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-2">
              {row.map((cell, i) =>
                visibleColumns.includes(columns[i]) ? (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {columns[i]}
                    </span>
                    <span className="text-sm text-gray-900 break-words">
                      {cell}
                    </span>
                  </div>
                ) : null
              )}
            </div>

            {/* Additional Actions for Ventes */}
            {activeMenu === "ventes" && onPreviewPDF && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                  onClick={() => onPreviewPDF(rows[idx][1], idx)}
                  disabled={pdfLoadingIdx === idx}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {pdfLoadingIdx === idx ? 'Chargement...' : 'Prévisualiser PDF'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 