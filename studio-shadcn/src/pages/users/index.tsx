import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import deepEqual from "deep-equal";
import { Helmet } from "react-helmet";
import { UserPlus } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

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

    console.log("No matching request found for query:", normalizedQuery);
    if (state.spaceUsers.req.length > 0) {
      console.log(
        "Available requests:",
        state.spaceUsers.req.map((r) => r.query)
      );
      console.log(
        "Available details:",
        Object.keys(state.spaceUsers.details).length
      );
    }

    return {
      spaceUsers: [] as SpaceUser[],
      total: 0,
      loading: state.spaceUsers.loading,
    };
  });

  useEffect(() => {
    navigate(
      `${pathname}?${new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      }).toString()}`
    );
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

  const handlePageChange = (pageNumber: number): void => {
    setFilters({ ...filters, page: pageNumber });
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Users"} />

      {/* Update Form with form context */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAddUsers)}
          className="space-y-4"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
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
            <div className="col-span-4">
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={isSubmitting || loading}
              >
                <UserPlus size={16} />
                {isSubmitting ? "Adding..." : "Add users"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">ID</TableHead>
            <TableHead className="w-[35%]">Name</TableHead>
            <TableHead className="w-[50%]">E-mail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaceUsers && spaceUsers.length > 0 ? (
            spaceUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell className="font-medium">
                  {user.display_name}
                </TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                filters.page > 1 && handlePageChange(filters.page - 1)
              }
              className={
                filters.page <= 1
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>{filters.page}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                filters.page < Math.ceil(total / filters.limit) &&
                handlePageChange(filters.page + 1)
              }
              className={
                filters.page >= Math.ceil(total / filters.limit)
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default Users;
