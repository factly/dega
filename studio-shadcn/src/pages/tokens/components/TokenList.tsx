import { deleteSpaceToken } from "../../../actions/tokens";
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
import EmptyState from "@/components/EmptyState";

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
  isMobile?: boolean;
}

export default function TokenList({
  tokens,
  loading,
  fetchTokens,
  isMobile,
}: TokenListProps) {
  const dispatch = useAppDispatch();

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
  const hasTokens = tokens && tokens.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasTokens ? (
        <Table>
          <TableHeader className="text-[13px]">
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              {!isMobile && (
                <TableHead className="w-[40%]">Description</TableHead>
              )}
              <TableHead className={isMobile ? "text-right" : "text-center"}>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token: Token) => (
              <TableRow key={token.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{token.name}</p>
                    {isMobile && token.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {token.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                {!isMobile && <TableCell>{token.description}</TableCell>}
                <TableCell className={isMobile ? "text-right" : "text-center"}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size={isMobile ? "sm" : "sm"}
                        className={isMobile ? "h-8 px-3" : ""}
                      >
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      className={isMobile ? "max-w-[90%] p-4 rounded-lg" : ""}
                      onPointerDownOutside={(e) => e.preventDefault()}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base">
                          Revoke Token
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          This will permanently revoke the token. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4 flex justify-end space-x-2">
                        <AlertDialogCancel className={isMobile ? "h-9" : ""}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(token.id)}
                          className={
                            isMobile
                              ? "h-9 bg-red-600 hover:bg-red-700"
                              : "bg-red-600 hover:bg-red-700"
                          }
                        >
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
      ) : (
        <EmptyState
          contentType="tokens"
          title="No tokens found"
          description="Your tokens list is empty"
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
