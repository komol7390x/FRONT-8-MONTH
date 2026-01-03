import type React from 'react';
import type { Admin } from '../service/useGetList';

interface PaginationProps {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  admins: Admin[];
  setPage: (page: number) => void;
  handleLimitChange: (newLimit: string | number) => void;
  renderPaginationButtons: () => React.JSX.Element[];
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  totalPages,
  totalCount,
  admins,
  setPage,
  handleLimitChange,
  renderPaginationButtons
}) => {
    return (
        <div>
            {totalPages > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="text-sm text-gray-600">
                            Showing {admins.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} results
                          </div>
            
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 mr-2">Show:</span>
                            <select
                              value={limit}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLimitChange(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                              {[5, 10, 20, 50, 100].map((v) => (
                                <option key={v} value={v}>{v} per page</option>
                              ))}
                            </select>
                          </div>
            
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPage(Math.max(page - 1, 1))}
                              disabled={page === 1}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Previous
                            </button>
            
                            {page > 3 && (
                              <>
                                <button
                                  onClick={() => setPage(1)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  1
                                </button>
                                {page > 4 && <span className="px-2 text-gray-500">...</span>}
                              </>
                            )}
            
                            {renderPaginationButtons()}
            
                            {page < totalPages - 2 && (
                              <>
                                {page < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                                <button
                                  onClick={() => setPage(totalPages)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  {totalPages}
                                </button>
                              </>
                            )}
            
                            <button
                              onClick={() => setPage(Math.min(page + 1, totalPages))}
                              disabled={page === totalPages || totalPages === 0}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
        </div>
    );
};