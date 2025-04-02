// components/PaginationFooter.tsx
import Pagination from "../../../components/Pagination";
import { PaginationFooterProps } from "../types";

const PaginationFooter = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sidebarWidth
}: PaginationFooterProps) => {
  return (
    <div
      className="fixed bottom-0 z-10 bg-white"
      style={{
        left: sidebarWidth,
        right: 0,
        height: "64px",
        transition: "left 0.3s ease",
      }}
    >
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default PaginationFooter;
