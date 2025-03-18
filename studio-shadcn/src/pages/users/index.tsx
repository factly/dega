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
    page: 1,
    limit: 10,
  });

  const { spaceUsers, total, loading } = useSelector((state: RootState) => {
    const node = state.spaceUsers.req.find((item) => {
      return deepEqual(item.query, {
        page: query.get("page"),
        limit: query.get("limit"),
      });
    });

    if (node)
      return {
        spaceUsers: node.data.map(
          (element) => state.spaceUsers.details[element]
        ),
        total: node.total,
        loading: state.spaceUsers.loading,
      };
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
  }, []);

  const fetchUsers = (): void => {
    dispatch(getSpaceUsers(filters));
  };

  const handleAddUsers = (values: FormValues): void => {
    dispatch(updateSpaceUsers({ ids: values.users ? values.users : [] })).then(
      () => navigate("/settings/users")
    );
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
                      action="Users"
                      createEntity="User"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4">
              <Button type="submit" className="flex items-center gap-2">
                <UserPlus size={16} />
                Add users
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
          {spaceUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell className="font-medium">{user.display_name}</TableCell>
              <TableCell className="font-medium">{user.email}</TableCell>
            </TableRow>
          ))}
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
