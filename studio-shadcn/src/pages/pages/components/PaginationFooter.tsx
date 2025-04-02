// components/PaginationFooter.tsx
import Pagination from "../../../components/Pagination";
import { PaginationFooterProps } from "../types";
import { useSidebar } from "@/components/ui/sidebar";

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
      width: "calc(100% - 48px)",
    };
  } else if (state === "expanded") {
    paginationStyle = {
      width: `calc(100% - ${SIDEBAR_WIDTH} - 48px)`,
      // marginLeft: SIDEBAR_WIDTH,
    };
  } else {
    // Collapsed state
    paginationStyle = {
      width: `calc(100% - ${SIDEBAR_WIDTH_ICON} - 48px)`,
      // marginLeft: SIDEBAR_WIDTH_ICON,
    };
  }

  return (
    <div
      className="fixed bottom-0 z-10 bg-white"
      style={{
        ...paginationStyle,
        transition: "margin-left 0.3s ease, width 0.3s ease",
      }}
    >
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        selectedItems={selectedItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isMobile={isMobile}
      />
    </div>
  );
};

export default PaginationFooter;

