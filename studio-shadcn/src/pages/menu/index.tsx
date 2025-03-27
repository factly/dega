import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import MenuList from "./components/MenuList";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMenus } from "../../actions/menu";
import deepEqual from "deep-equal";
import getUserPermission from "../../utils/getUserPermission";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Input } from "@/components/ui/input";
import Pagination from "../../components/Pagination";

// Define types for our state and props
interface Menu {
  id: string;
  name: string;
}

interface MenuState {
  details: Record<string, Menu>;
  loading: boolean;
  req: Array<{
    query: MenuFilters;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  menus: MenuState;
  spaces: any; // Define a more specific type based on your spaces structure
  sidebar: {
    collapsed: boolean;
  };
}

interface MenuFilters {
  page: number;
  limit: number;
  [key: string]: any; // For any additional filters
}

const Menu: React.FC = () => {
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "menus",
    action: "get",
    spaces,
  });
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<MenuFilters>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
  });

  // Update URL when filters change, but don't manipulate history directly
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      newParams.set(key, value.toString());
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const { menus, total, loading } = useSelector((state: RootState) => {
    const node = state.menus.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        menus: node.data.map((element) => state.menus.details[element]),
        total: node.total,
        loading: state.menus.loading,
      };
    }

    return { menus: [], total: 0, loading: state.menus.loading };
  });

  // Filter and sort menus based on search text and sort order
  const filteredMenus = React.useMemo(() => {
    let filtered = menus;

    // Apply search filter
    if (searchText.trim()) {
      filtered = menus.filter((menu) =>
        menu.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [menus, searchText, sortOrder]);

  // Fetch menus when filters change
  useEffect(() => {
    dispatch(getMenus(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dispatch]);

  const fetchMenus = () => {
    dispatch(getMenus(filters));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, page: 1, limit: size });
  };

  const handleSortToggle = React.useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Menu"} />

      {/* Header */}
      <div
        className="fixed top-0 z-10 bg-white"
        style={{
          left: sidebarWidth,
          right: 0,
          height: headerHeight,
          transition: "left 0.3s ease",
        }}
      >
        <div className="flex justify-between items-center h-full px-6 pt-1">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Search menus..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Link to="/settings/website/menus/create">
              <Button
                size="lg"
                className="flex items-center gap-2 py-2"
                disabled={
                  !(actions.includes("admin") || actions.includes("create"))
                }
              >
                <PlusCircle className="h-4 w-4" />
                New Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="absolute overflow-auto"
        style={{
          top: headerHeight,
          left: sidebarWidth,
          right: 0,
          bottom: "64px",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "1.5rem",
          paddingTop: "1rem",
          transition: "left 0.3s ease, top 0.3s ease",
        }}
      >
        <MenuList
          actions={actions}
          data={{ menus: filteredMenus, total, loading }}
          filters={filters}
          setFilters={setFilters}
          fetchMenus={fetchMenus}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
        />
      </div>

      {/* Footer with Pagination */}
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
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default Menu;
