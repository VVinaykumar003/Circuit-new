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
    <div className="flex items-center justify-center sm:justify-end gap-1.5 mt-3 w-full">
      <Button
        variant="outline"
        size="xs"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-0.5"
      >
        <MdChevronLeft size={14} /> Prev
      </Button>
      
      <span className="text-xs font-medium text-base-content/70 px-1.5">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="xs"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-0.5"
      >
        Next <MdChevronRight size={14} />
      </Button>
    </div>
  );
};

export default Pagination;