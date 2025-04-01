import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceList from "./components/SpaceList";
import { RefreshCw, PlusCircle, FolderPlus } from "lucide-react";
import Pagination from "../../components/Pagination";
import { getSpaces } from "../../actions/spaces";
import { spaceSelector } from "../../selectors/spaces";

// Define types for the Redux state
interface SpaceDetails {
  org_role?: string;
}

interface SpacesState {
  selected: string;
  details: {
    [key: string]: SpaceDetails;
  };
}

interface RootState {
  spaces?: SpacesState;
  sidebar: {
    collapsed: boolean;
  };
}

interface RoleState {
  role: string;
}

interface SpaceState {
  spaces: any[];
  loading: boolean;
  total: number | null;
}

const Spaces: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });

  const {
    spaces,
    loading,
    total = 0,
  } = useSelector(spaceSelector) as SpaceState;

  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    const fetchSpaces = async () => {
      await dispatch(getSpaces());
      setHasAttemptedLoad(true);
    };

    fetchSpaces();
  }, [dispatch]);

  const { role } = useSelector((state: RootState): RoleState => {
    // Check if spaces exists in the state
    if (!state?.spaces) {
      return { role: "member" };
    }

    const { selected } = state.spaces;

    // Check if selected is truthy and not an empty string
    if (selected && selected !== "") {
      // Safely access details and the specific space
      const details = state.spaces.details || {};
      const space = details[selected];

      // Check if space exists and has org_role
      if (space && space.org_role) {
        return {
          role: space.org_role,
        };
      }
    }

    return { role: "member" };
  });

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setFilters({ page: 1, limit: size });
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil((total || 0) / filters.limit));

  // Empty state component when no spaces exist
  const EmptySpacesState = () => (
    <div className="flex flex-col items-center justify-center h-full mt-16">
      <div className="bg-gray-50 rounded-full p-6 mb-4">
        <FolderPlus className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">No spaces found</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Spaces help you organize your content. Create your first space to get
        started.
      </p>
      <Link to="/spaces/create">
        <Button size="lg" className="flex items-center gap-2 py-2">
          <PlusCircle className="h-4 w-4" />
          Create New Space
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Spaces"} />

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
                placeholder="Search spaces..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10"
                disabled={spaces.length === 0}
              />
            </div>
          </div>
          <div className="flex space-x-4">
            {role === "admin" && (
              <Link to="/settings/advanced/reindex">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2 py-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reindex
                </Button>
              </Link>
            )}

            <Link to="/spaces/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                Create New Space
              </Button>
            </Link>
          </div>
        </div>
      </div>

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
        {loading && !hasAttemptedLoad ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : spaces.length === 0 ? (
          <EmptySpacesState />
        ) : (
          <SpaceList
            searchQuery={searchText}
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>

      {spaces.length > 0 && (
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
      )}
    </div>
  );
};

export default Spaces;
