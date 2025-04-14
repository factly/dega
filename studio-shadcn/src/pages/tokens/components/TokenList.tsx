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
import { useAppDispatch } from "@/hooks/reduxHooks";
import EmptyState from "@/components/EmptyState";
import { TokenListProps } from "../types";

function TokenList({ data, fetchTokens, isMobile }: TokenListProps) {
  const dispatch = useAppDispatch();

  const onDelete = (id: string) => {
    dispatch(deleteSpaceToken(id)).then(() => fetchTokens());
  };

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasTokens = data.tokens && data.tokens.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasTokens ? (
        <Table>
          <TableHeader className="text-[13px]">
            <TableRow>
              <TableHead className="w-[45%]">Name</TableHead>
              {!isMobile && (
                <TableHead className="w-[45%]">Description</TableHead>
              )}
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tokens.map((token) => (
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
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className={isMobile ? "h-8 px-3" : ""}
                      >
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      className={isMobile ? "max-w-[90%] p-4 rounded-lg" : ""}
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

export default TokenList;
