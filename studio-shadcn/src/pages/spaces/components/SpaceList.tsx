import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getSpaces } from "../../../actions/spaces";
import { deleteSpace } from "../../../actions/spaces";
import { spaceSelector } from "../../../selectors/spaces";
import useNavigation from "../../../utils/useNavigation";

// Define types for the space object
interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  tag_line: string;
}

// Define type for the space selector return
interface SpaceState {
  spaces: Space[];
  loading: boolean;
}

const LoadingRow: React.FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-6 w-[200px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[150px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[180px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[160px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[140px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8 rounded-full" />
    </TableCell>
  </TableRow>
);

const SpaceList: React.FC = () => {
  const dispatch: ThunkDispatch<any, unknown, AnyAction> = useDispatch();
  const { spaces, loading } = useSelector(spaceSelector) as SpaceState;
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);
  const history = useNavigation();

  const fetchSpaces = () => {
    dispatch(getSpaces());
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDialogOpen(true);
    setDeleteItemId(id);
  };

  const handleDelete = async () => {
    if (deleteItemId) {
      await dispatch(deleteSpace(deleteItemId));
      await fetchSpaces();
      setDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = (id: string) => {
    history(`/admin/spaces/${id}/edit`);
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">ID</TableHead>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Site Address</TableHead>
            <TableHead className="w-[200px]">Site Title</TableHead>
            <TableHead className="w-[200px]">Tag Line</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          ) : (
            spaces.map((space) => (
              <TableRow
                key={space.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(space.id)}
              >
                <TableCell className="font-medium">
                  <Link
                    to={`/admin/spaces/${space.id}/edit`}
                    className="text-foreground hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {space.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/admin/spaces/${space.id}/edit`}
                    className="text-foreground hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {space.name}
                  </Link>
                </TableCell>
                <TableCell>{space.site_address}</TableCell>
                <TableCell>{space.site_title}</TableCell>
                <TableCell>{space.tag_line}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(e, space.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Space</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this space?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpaceList;
