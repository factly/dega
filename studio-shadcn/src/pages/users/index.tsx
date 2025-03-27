import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Loader from "../../components/Loader";
import Selector from "../../components/Selector/index";
import { getSpaceUsers, updateSpaceUsers } from "../../actions/spaceUsers";

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

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 4.5rem + 1rem)"; // top padding + height + bottom padding

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

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Users"} />

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
            <div className="text-xl font-semibold">Users</div>
          </div>

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
        <div className="rounded-md">
          <Table>
            <TableHeader className="w-1/2 text-[13px]">
              <TableRow>
                <TableHead className="w-1/4">ID</TableHead>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead className="w-1/3">E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : spaceUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                spaceUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="font-normal">{user.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-normal">{user.display_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-normal">{user.email}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
}

export default Users;
