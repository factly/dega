import React, { useEffect, useState } from "react";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define interfaces for props and data structures
interface ClaimDetails {
  claim: string;
  fact: string;
}

interface ClaimListProps {
  ids: string[];
  setClaimID: (id: string) => void;
  details: Record<string, ClaimDetails>;
  showModal: () => void;
  setClaimOrder: (order: string[]) => void;
  claimOrder: string[];
}

interface TreeNode {
  key: string;
  title: React.ReactNode;
}

const ClaimList: React.FC<ClaimListProps> = ({
  ids,
  setClaimID,
  details,
  showModal,
  setClaimOrder,
  claimOrder,
}) => {
  const [updateData, setUpdateData] = useState<boolean>(true);
  const [treeData, setTreeData] = useState<TreeNode[]>(
    claimOrder as unknown as TreeNode[]
  );
  const [activeKeys, setActiveKeys] = useState<string[]>(["claims"]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const moveUp = (id: string): void => {
    const index = claimOrder.indexOf(id);
    if (index <= 0) return;

    const newOrder = [...claimOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = id;
    newOrder[index] = temp;
    setClaimOrder(newOrder);
    setUpdateData(true); // Flag to trigger rebuild in useEffect
  };

  const moveDown = (id: string): void => {
    const index = claimOrder.indexOf(id);
    if (index >= claimOrder.length - 1) return;

    const newOrder = [...claimOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = id;
    newOrder[index] = temp;
    setClaimOrder(newOrder);
    setUpdateData(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemId) {
      const newOrder = claimOrder.filter((id) => id !== deleteItemId);
      setClaimOrder(newOrder);
      setUpdateData(true);
      setDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(false);
    setDeleteItemId(null);
  };

  const buildTreeData = (order: string[], claims: string[]): TreeNode[] => {
    setUpdateData(false);
    const list: TreeNode[] = [];

    // Add any new claims that are not in the order yet
    if (claims.length > order.length) {
      const newClaims = claims.filter((x) => !order.includes(x));
      order = [...order, ...newClaims];
    }

    order.forEach((id, index) => {
      // Skip if we don't have details for this claim
      if (!details[id]) return;

      const node: TreeNode = {
        key: id,
        title: (
          <Card
            key={id}
            className="my-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2 px-4 py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="w-[500px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {details[id]?.claim || "Unknown Claim"}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClaimID(id);
                      showModal();
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveUp(id);
                    }}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === order.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDown(id);
                    }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 py-3 text-gray-700">
              {details[id]?.fact || "No fact provided"}
            </CardContent>
          </Card>
        ),
      };
      list.push(node);
    });

    return list;
  };

  useEffect(() => {
    if (claimOrder && updateData) {
      setTreeData(buildTreeData(claimOrder, ids));
    }
  }, [claimOrder, ids, updateData]);

  useEffect(() => {
    setTreeData(buildTreeData(claimOrder, ids));
  }, [claimOrder, ids]);

  return (
    <>
      <Accordion
        type="multiple"
        value={activeKeys}
        onValueChange={setActiveKeys}
        className="w-full border rounded-lg p-4 my-6"
      >
        <AccordionItem value="claims" className="border-none">
          <AccordionTrigger className="hover:no-underline px-2 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-semibold">Claims</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="mt-4 space-y-4 px-2">
            <div className="space-y-4">
              {treeData.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No claims added yet.
                </p>
              ) : (
                treeData.map((node) => <div key={node.key}>{node.title}</div>)
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Claim</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this claim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimList;
