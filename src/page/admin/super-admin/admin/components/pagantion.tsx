import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Admin } from '../service/useGetList';

interface PaginationProps {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  admins: Admin[];
  setPage: (page: number) => void;
  handleLimitChange: (newLimit: string | number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  totalPages,
  totalCount,
  admins,
  setPage,
  handleLimitChange
}) => {
  const [pageInput, setPageInput] = useState<string>(page.toString());
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout for 1 second
      const newTimeout = setTimeout(() => {
        const pageNum = parseInt(value);
        if (pageNum >= 1 && pageNum <= totalPages) {
          setPage(pageNum);
          // Scroll to top when page changes
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setPageInput(page.toString());
        }
      }, 1000);

      setTypingTimeout(newTimeout);
    }
  };

  const handlePageInputSubmit = () => {
    // Clear any pending timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPageInput(page.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div>
      {totalPages > 0 && (
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 mt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

            {/* Statistika */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Showing</span>
                <span className="mx-2 font-bold text-gray-900">
                  {admins.length > 0 ? ((page - 1) * limit) + 1 : 0}-{Math.min(page * limit, totalCount)}
                </span>
                <span className="text-gray-500">of</span>
                <span className="ml-2 font-bold text-gray-900">{totalCount}</span>
                <span className="text-gray-500">results</span>
              </div>

              {/* Limit select */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={limit}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLimitChange(e.target.value)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                >
                  {[5, 10, 20, 50, 100].map((v) => (
                    <option key={v} value={v}>{v} per page</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-3">
              {/* Previous button */}
              <button
                onClick={() => {
                  setPage(Math.max(page - 1, 1));
                  // Scroll to top when page changes
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
                className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg text-gray-700 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span className="text-sm font-medium">Previous</span>
              </button>

              {/* Next button */}
              <button
                onClick={() => {
                  setPage(Math.min(page + 1, totalPages));
                  // Scroll to top when page changes
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg text-gray-700 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
              >
                <span className="text-sm font-medium">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Page input */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyPress={handleKeyPress}
                  onBlur={handlePageInputSubmit}
                  className="w-16 px-2 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200"
                  placeholder="1"
                />
                <span className="text-sm text-gray-500 font-medium">
                  of <span className="text-gray-900 font-bold">{totalPages}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Current page indicator */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Currently on page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};