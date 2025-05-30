import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { deleteWebhook, updateWebhook } from "../../../actions/webhooks";
import useNavigation from "../../../utils/useNavigation";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Webhook {
  id: string;
  name: string;
  enabled: boolean;
  events: string[];
}

interface WebhookListProps {
  actions?: string[];
  data: {
    webhooks: Webhook[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
  };
  setFilters: (filters: { page: number; limit: number }) => void;
  fetchWebhooks: () => void;
}

const WebhookList: React.FC<WebhookListProps> = ({
  actions = [],
  data,
  filters,
  setFilters,
  fetchWebhooks,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigation();

  const handleRowClick = (webhook: Webhook) => {
    navigate(`/advanced/webhooks/${webhook.id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, webhook: Webhook) => {
    e.stopPropagation();
    setSelectedWebhook(webhook);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedWebhook) {
      dispatch(deleteWebhook(selectedWebhook.id)).then(() => {
        fetchWebhooks();
        setIsDeleteModalOpen(false);
        setSelectedWebhook(null);
      });
    }
  };

  const handleSwitchToggle = (value: boolean, webhook: Webhook) => {
    dispatch(
      updateWebhook({
        ...webhook,
        enabled: value,
        event_ids: webhook.events,
      })
    );
  };

  // Fixed check with default value for actions
  const isDeleteAllowed =
    actions.includes("admin") || actions.includes("delete");

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60%] min-w-[200px]">Name</TableHead>
            <TableHead className="w-[200px] min-w-[200px]">Enabled</TableHead>
            <TableHead className="w-[150px] min-w-[150px] text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.webhooks.map((webhook) => (
            <TableRow
              key={webhook.id}
              onClick={() => handleRowClick(webhook)}
              className="cursor-pointer"
            >
              <TableCell>
                <Link
                  to={`/advanced/webhooks/${webhook.id}/edit`}
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {webhook.name}
                </Link>
              </TableCell>
              <TableCell>
                <Switch
                  checked={webhook.enabled}
                  onCheckedChange={(value) =>
                    handleSwitchToggle(value, webhook)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteClick(e, webhook)}
                  disabled={!isDeleteAllowed}
                >
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          {filters.limit * (filters.page - 1) + 1}-
          {Math.min(filters.limit * filters.page, data.total)} of {data.total}{" "}
          results
        </p>
        <div className="flex items-center gap-2">
          <select
            className="border rounded p-1"
            value={filters.limit}
            onChange={(e) =>
              setFilters({ page: 1, limit: Number(e.target.value) })
            }
          >
            {[10, 15, 20].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.max(1, filters.page - 1),
                    })
                  }
                  className={
                    filters.page <= 1
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-2">{filters.page}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  className={
                    filters.page * filters.limit >= data.total
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[311px]">
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this?
          </DialogDescription>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isDeleteAllowed}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookList;
