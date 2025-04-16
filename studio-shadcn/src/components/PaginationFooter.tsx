import Pagination from "@/components/Pagination";

import { useSidebar } from "@/components/ui/sidebar";

export interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationFooter = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationFooterProps) => {
  // Get sidebar state from hook
  const { state, isMobile } = useSidebar();

  // Define sidebar widths
  const SIDEBAR_WIDTH = "16rem";
  const SIDEBAR_WIDTH_ICON = "5rem";

  // Calculate the number of selected items (assuming this is tracked elsewhere)
  const selectedItems = 0; // Replace with actual selected items count if available

  // Calculate width based on sidebar state
  let paginationStyle = {};

  if (isMobile) {
    paginationStyle = {
      width: "calc(100%)",
      paddingRight: "32px",
    };
  } else if (state === "expanded") {
    paginationStyle = {
      width: `calc(100% - ${SIDEBAR_WIDTH})`,
      paddingRight: "48px",
    };
  } else {
    // Collapsed state
    paginationStyle = {
      width: `calc(100% - ${SIDEBAR_WIDTH_ICON})`,
      paddingRight: "48px",
    };
  }

  return (
    <div className="fixed bottom-0 z-10 bg-white w-full">
      <div
        style={{
          ...paginationStyle,
          transition: "margin-left 0.3s ease, width 0.3s ease",
        }}
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default PaginationFooter;

