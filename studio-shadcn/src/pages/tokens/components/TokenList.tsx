import { deleteSpaceToken } from "../../../actions/tokens";
import { useLocation } from "react-router-dom";
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

interface TokenListProps {
  tokens: Token[];
  total: number;
  loading: boolean;
  filters: {
    page: number;
    limit: number;
  };
  fetchTokens: () => void;
}

export default function TokenList({
  tokens,
  loading,
  fetchTokens,
}: TokenListProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const onDelete = (id: string) => {
    dispatch(deleteSpaceToken(id)).then(() => fetchTokens());
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
          {tokens.length > 0 ? (
            tokens.map((token: Token) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No tokens found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
