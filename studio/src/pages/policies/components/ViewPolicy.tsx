import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getPolicy } from "../../../actions/policies";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { RootState } from "../types";
import EmptyState from "@/components/EmptyState";

export default function ViewPolicy(): React.ReactElement {
  const { policyID } = useParams<{ policyID: string }>();
  const dispatch = useAppDispatch();

  const { policy, loading } = useSelector((state: RootState) => {
    return {
      policy: policyID ? state.policies.details?.[policyID] : undefined,
      loading: state.policies.loading,
    };
  });

  useEffect(() => {
    if (policyID) {
      dispatch(getPolicy(policyID));
    }
  }, [dispatch, policyID]);

  return (
    <div className="flex flex-col gap-5">
      <Link to="/settings/members/policies">
        <Button variant="outline" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Policies
        </Button>
      </Link>

      <h2 className="text-2xl font-bold">Policy Details</h2>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Name
                </h4>
                <p>{policy?.name}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Description
                </h4>
                <p>{policy?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <h3 className="text-xl font-semibold">Permissions</h3>

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : policy?.permissions && policy.permissions.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policy.permissions.map((permission, index) => (
                <TableRow key={`${permission.resource}-${index}`}>
                  <TableCell>{permission.resource}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {permission.actions?.map((action) => (
                        <Badge key={action} variant="secondary">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="permissions"
          title="No permissions found"
          description="This policy doesn't have any permissions assigned"
          isMobile={false}
        />
      )}
    </div>
  );
}
