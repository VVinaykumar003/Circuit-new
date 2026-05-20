import React from 'react';
import Button from './Button';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center sm:justify-end gap-2 mt-4 w-full">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1"
      >
        <MdChevronLeft size={16} /> Prev
      </Button>
      
      <span className="text-sm font-medium text-base-content/70 px-2">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1"
      >
        Next <MdChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;