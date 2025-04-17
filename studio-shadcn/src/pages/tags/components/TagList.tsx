// components/TagList.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Pencil, Ellipsis } from "lucide-react";
import { deleteTag } from "../../../actions/tags";
import { useAppDispatch } from "@/hooks/reduxHooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/EmptyState";
import { TagListProps } from "../types";

function TagList({ data, fetchTags, isMobile = false }: TagListProps) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Delete item ID:", deleteItemId, Number(deleteItemId));
    if (deleteItemId) {
      await dispatch(deleteTag(deleteItemId));
      fetchTags();
      setModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/tags/${id}/edit`);
  };

  // Check if there are any tags to display
  const hasTagsData = !data.loading && data.tags && data.tags.length > 0;

  return (
    <div className="pb-4 overflow-scroll">
      {data.loading ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%] text-[13px]">Title</TableHead>
                <TableHead className="w-[40%] text-[13px]">Slug</TableHead>
                <TableHead className="w-[10%] text-[13px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-10" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : hasTagsData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%] text-[13px]">Title</TableHead>
                <TableHead className="w-[40%] text-[13px]">Slug</TableHead>
                <TableHead className="w-[10%] text-[13px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tags.map((tag) => (
                <TableRow
                  key={tag.id}
                  onClick={() => handleRowClick(tag.id.toString())}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Link
                      to={`/tags/${tag.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tag.name || "Unnamed Tag"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2">{tag.slug || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon">
                          <Ellipsis className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tags/${tag.id}/edit`);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalOpen(true);
                            setDeleteItemId(tag.id.toString());
                          }}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="tags"
          title="No tags found"
          description="Your tags list is empty"
          isMobile={isMobile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Tag</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this tag?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
                setDeleteItemId(null);
              }}
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
}

export default TagList;
