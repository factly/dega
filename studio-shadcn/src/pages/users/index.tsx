import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Loader from "../../components/Loader";
import Selector from "../../components/Selector/index";
import { getSpaceUsers, updateSpaceUsers } from "../../actions/spaceUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import EmptyState from "@/components/EmptyState";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "../../components/Pagination";

// Type definitions
interface SpaceUser {
  id: string;
  display_name: string;
  email: string;
}

interface SpaceUsersState {
  details: Record<string, SpaceUser>;
  req: Array<{
    query: {
      page: string | null;
      limit: string | null;
      q?: string;
    };
    data: string[];
    total: number;
  }>;
  loading: boolean;
}

interface RootState {
  spaceUsers: SpaceUsersState;
  sidebar: {
    collapsed: boolean;
  };
}

interface FiltersState {
  page: number;
  limit: number;
}

interface FormValues {
  users?: string[];
}

function Users() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pathname = location.pathname;
  const isMobile = useIsMobile();

  // Add form initialization
  const form = useForm<FormValues>({
    defaultValues: {
      users: [],
    },
  });

  const [filters, setFilters] = useState<FiltersState>({
    page: parseInt(query.get("page") || "1"),
    limit: parseInt(query.get("limit") || "10"),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);

  const { spaceUsers, total, loading } = useSelector((state: RootState) => {
    if (!state.spaceUsers || !state.spaceUsers.req) {
      return {
        spaceUsers: [] as SpaceUser[],
        total: 0,
        loading: false,
      };
    }

    const normalizedQuery = {
      page: query.get("page") || null,
      limit: query.get("limit") || null,
    };

    const matchingReq = state.spaceUsers.req.find((req) => {
      if (!req.query) return false;

      const pageMatch = req.query.page === normalizedQuery.page;
      const limitMatch = req.query.limit === normalizedQuery.limit;

      return pageMatch && limitMatch;
    });

    if (matchingReq && matchingReq.data && matchingReq.data.length > 0) {
      const uniqueUsers = new Map<string, SpaceUser>();

      matchingReq.data.forEach((id) => {
        if (state.spaceUsers.details[id] && !uniqueUsers.has(id)) {
          uniqueUsers.set(id, state.spaceUsers.details[id]);
        }
      });

      const users = Array.from(uniqueUsers.values());

      return {
        spaceUsers: users,
        total: matchingReq.total,
        loading: state.spaceUsers.loading,
      };
    }

    for (const req of state.spaceUsers.req) {
      if (
        req.query &&
        req.query.page === normalizedQuery.page &&
        req.query.limit === normalizedQuery.limit &&
        req.data &&
        req.data.length > 0
      ) {
        const uniqueUsers = new Map<string, SpaceUser>();

        req.data.forEach((id) => {
          if (state.spaceUsers.details[id] && !uniqueUsers.has(id)) {
            uniqueUsers.set(id, state.spaceUsers.details[id]);
          }
        });

        const users = Array.from(uniqueUsers.values());

        if (users.length > 0) {
          return {
            spaceUsers: users,
            total: req.total,
            loading: state.spaceUsers.loading,
          };
        }
      }
    }

    return {
      spaceUsers: [] as SpaceUser[],
      total: 0,
      loading: state.spaceUsers.loading,
    };
  });

  // Filtered users based on search
  const filteredUsers = useCallback(() => {
    if (!searchText.trim()) {
      return spaceUsers;
    }

    return spaceUsers.filter((user) => {
      return (
        user.display_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [spaceUsers, searchText]);

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("page", filters.page.toString());
    newParams.set("limit", filters.limit.toString());
    navigate(`${pathname}?${newParams.toString()}`);
  }, [filters, pathname, navigate]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get("page"), query.get("limit")]);

  const fetchUsers = (): void => {
    const currentPage = parseInt(query.get("page") || "1");
    const currentLimit = parseInt(query.get("limit") || "10");

    const queryParams = {
      page: currentPage,
      limit: currentLimit,
    };

    dispatch(getSpaceUsers(queryParams));
  };

  const handleAddUsers = async (values: FormValues): Promise<void> => {
    if (!values.users || values.users.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateSpaceUsers({ ids: values.users }));

      form.reset();

      fetchUsers();
    } catch (error) {
      console.error("Error adding users:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters({ page: 1, limit: size });
  }, []);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Toggle search on mobile
  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  }, [showSearch]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const hasUsersData = filteredUsers().length > 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Users"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb currentPage="Users" parentLabel="Settings" />
      )}

      {/* Header */}
      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: sidebarWidth,
                right: 0,
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <div
          className={`flex justify-between items-center ${
            isMobile ? "pb-3 pt-1" : "px-6 pt-1 h-full"
          }`}
        >
          {/* Title and Selector for Mobile */}
          {isMobile && (
            <div className="flex items-center">
              <h1 className="text-xl font-semibold mr-2">Users</h1>
              <div className="w-32">
                <FormField
                  control={form.control}
                  name="users"
                  render={({ field }) => (
                    <FormItem>
                      <Selector
                        mode="multiple"
                        display={"display_name"}
                        action="users"
                        createEntity="User"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select users"
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search users..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-10"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className={`${isMobile ? "flex items-center gap-2" : ""}`}>
            {isMobile && (
              <>
                <Form {...form}>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      form.handleSubmit(handleAddUsers)();
                    }}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </Form>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSearch}
                  className="h-9 w-9 text-gray-500"
                >
                  <SearchIcon className="h-5 w-5" />
                </Button>
              </>
            )}

            {!isMobile && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleAddUsers)}
                  className="flex items-center gap-4"
                >
                  <div className="w-64">
                    <FormField
                      control={form.control}
                      name="users"
                      render={({ field }) => (
                        <FormItem>
                          <Selector
                            mode="multiple"
                            display={"display_name"}
                            action="users"
                            createEntity="User"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <PlusCircle size={16} />
                    {isSubmitting ? "Adding..." : "Add users"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search users..."
              value={searchText}
              onChange={handleSearchChange}
              className="h-9 w-full"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={
          isMobile
            ? "flex-1 pb-16 pt-1 overflow-auto"
            : "absolute overflow-auto"
        }
        style={
          !isMobile
            ? {
                top: "calc(1.5rem + 2.5rem + 1rem)",
                left: sidebarWidth,
                right: 0,
                bottom: "64px",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingBottom: "1.5rem",
                paddingTop: "1rem",
                transition: "left 0.3s ease, top 0.3s ease",
              }
            : undefined
        }
      >
        {hasUsersData ? (
          <div className="rounded-md">
            <Table>
              <TableHeader className="text-[13px]">
                <TableRow>
                  {!isMobile && <TableHead className="w-1/4">ID</TableHead>}
                  <TableHead className={isMobile ? "w-1/2" : "w-1/3"}>
                    Name
                  </TableHead>
                  <TableHead className={isMobile ? "w-1/2" : "w-1/3"}>
                    E-mail
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers().map((user) => (
                  <TableRow key={user.id}>
                    {!isMobile && (
                      <TableCell>
                        <span className="font-normal">{user.id}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="font-normal">{user.display_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-normal">{user.email}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            contentType="users"
            title="No users found"
            description={
              searchText
                ? "No users matching your search"
                : "Your users list is empty"
            }
            isMobile={isMobile}
            actionText="Add user"
            onActionClick={() => {
              if (isMobile) {
                form.handleSubmit(handleAddUsers)();
              }
            }}
          />
        )}
      </div>

      {/* Footer with Pagination */}
      {hasUsersData && (
        <div
          className={`${
            isMobile ? "fixed bottom-0 left-0 right-0 py-3" : "fixed bottom-0"
          } z-10 bg-white`}
          style={
            !isMobile
              ? {
                  left: sidebarWidth,
                  right: 0,
                  height: "64px",
                  transition: "left 0.3s ease",
                }
              : undefined
          }
        >
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={filters.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}

export default Users;
