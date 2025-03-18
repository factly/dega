import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

import { getPermissions } from "../../actions/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Type definitions
interface Permission {
  resource: string;
  actions: string[];
}

interface PermissionsState {
  details: Record<number, Permission[]>;
  req: number[];
  loading: boolean;
}

interface RootState {
  permissions: PermissionsState;
}

interface PermissionOption {
  label: string;
  value: string;
}

const options: PermissionOption[] = [
  { label: "Get", value: "get" },
  { label: "Create", value: "create" },
  { label: "Update", value: "update" },
  { label: "Delete", value: "delete" },
];

function PermissionList() {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const { details, loading } = useSelector((state: RootState) => {
    const node = state.permissions.req.find((each) => {
      return each === parseInt(id || "0");
    });

    if (node)
      return {
        details: state.permissions.details[node],
        loading: state.permissions.loading,
      };
    return { details: [] as Permission[], loading: state.permissions.loading };
  });

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPermissions = (): void => {
    if (id) {
      dispatch(getPermissions(parseInt(id)));
    }
  };

  if (loading) {
    return null;
  }

  const permission = details;

  return (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Permission List"} />
      {permission.map((each) => (
        <Card key={each.resource} className="w-full">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {each.resource.charAt(0).toUpperCase() + each.resource.slice(1)}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${each.resource}-${option.value}`}
                    checked={each.actions.includes(option.value)}
                    disabled
                  />
                  <Label htmlFor={`${each.resource}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default PermissionList;
