import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteSpaceToken, getSpaceTokens } from "../../../actions/tokens";
import deepEqual from "deep-equal";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "../../../hooks/reduxHooks";

// Define interfaces
interface Token {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

interface TokensState {
  details: Record<string, Token>;
  loading: boolean;
  req: {
    data: string[];
    query: {
      page: string | null;
      limit: string | null;
    };
    total: number;
  }[];
}

interface RootState {
  tokens: TokensState;
}

interface FilterState {
  page: number;
  limit: number;
}

export default function TokenList() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pathname = location.pathname;
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 10,
  });
  const navigate = useNavigate();

  const { tokens, total, loading } = useSelector((state: RootState) => {
    const node = state.tokens.req.find((item) => {
      return deepEqual(item.query, {
        page: query.get("page"),
        limit: query.get("limit"),
      });
    });

    if (node)
      return {
        tokens: node.data.map((element) => state.tokens.details[element]),
        total: node.total,
        loading: state.tokens.loading,
      };
    return { tokens: [], total: 0, loading: state.tokens.loading };
  });

  useEffect(() => {
    navigate(
      pathname +
        "?" +
        new URLSearchParams(
          filters as unknown as Record<string, string>
        ).toString()
    );
  }, [filters, pathname, navigate]);

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
  }, [dispatch]);

  const onDelete = (id: string) => {
    dispatch(deleteSpaceToken(id)).then(() =>
      dispatch(getSpaceTokens(filters))
    );
  };

  const fetchTokens = () => {
    dispatch(getSpaceTokens(filters));
  };

  const handlePageChange = (pageNumber: number) => {
    setFilters({ ...filters, page: pageNumber });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, limit: pageSize });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Name</TableHead>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="w-[30%] text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token: Token) => (
            <TableRow key={token.id}>
              <TableCell>{token.name}</TableCell>
              <TableCell>{token.description}</TableCell>
              <TableCell className="text-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Revoke
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently revoke the token. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(token.id)}>
                        Revoke
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing{" "}
          {tokens.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} to{" "}
          {Math.min(filters.page * filters.limit, total)} of {total} tokens
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center">
            <span className="px-2">{filters.page}</span>
            <span className="text-gray-500">
              of {Math.ceil(total / filters.limit)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={filters.page >= Math.ceil(total / filters.limit)}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </Button>

          <select
            className="h-8 rounded-md border border-input px-3 py-1 text-sm"
            value={filters.limit}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
