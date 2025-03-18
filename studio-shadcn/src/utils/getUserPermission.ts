// Type definitions
type ActionType = string;
type ResourceType = string;

interface PermissionRequirement {
  resource: ResourceType;
  action: ActionType | ActionType[];
}

interface SpacePermission {
  resource: ResourceType;
  actions: ActionType[];
}

interface SpaceDetails {
  permissions?: SpacePermission[];
  org_role?: string;
}

interface Spaces {
  selected: string;
  details: {
    [key: string]: SpaceDetails;
  };
}

interface GetUserPermissionParams {
  resource: ResourceType;
  action: ActionType;
  spaces: Spaces;
}

// Permission requirements mapping
export const permissionRequirements: Record<string, PermissionRequirement[]> = {
  "/posts": [
    { resource: "categories", action: "get" },
    { resource: "tags", action: "get" },
    { resource: "posts", action: ["get", "create"] },
  ],
  "/posts/create": [
    { resource: "categories", action: "get" },
    { resource: "media", action: "get" },
    { resource: "tags", action: "get" },
    { resource: "posts", action: ["get", "create"] },
  ],
  "/pages": [
    { resource: "categories", action: "get" },
    { resource: "tags", action: "get" },
    { resource: "pages", action: ["get", "create"] },
  ],
  "/pages/create": [
    { resource: "categories", action: "get" },
    { resource: "media", action: "get" },
    { resource: "tags", action: "get" },
    { resource: "pages", action: ["get", "create"] },
  ],
  "/fact-checks": [
    { resource: "categories", action: "get" },
    { resource: "tags", action: "get" },
    { resource: "fact-checks", action: ["get", "create"] },
  ],
  "/fact-checks/create": [
    { resource: "categories", action: "get" },
    { resource: "tags", action: "get" },
    { resource: "media", action: "get" },
    { resource: "claims", action: "get" },
    { resource: "fact-checks", action: ["get", "create"] },
  ],
  "/claims": [
    { resource: "claimants", action: "get" },
    { resource: "ratings", action: "get" },
    { resource: "claims", action: ["get", "create"] },
  ],
  "/claims/create": [
    { resource: "claimants", action: "get" },
    { resource: "ratings", action: "get" },
    { resource: "claims", action: ["get", "create"] },
  ],
  "/categories/create": [
    { resource: "media", action: "get" },
    { resource: "categories", action: ["get", "create"] },
  ],
  "/tags/create": [
    { resource: "media", action: "get" },
    { resource: "tags", action: ["get", "create"] },
  ],
  "/claimants/create": [
    { resource: "media", action: "get" },
    { resource: "claimants", action: ["get", "create"] },
  ],
  "/ratings/create": [
    { resource: "media", action: "get" },
    { resource: "ratings", action: ["get", "create"] },
  ],
};

function getUserPermission({
  resource,
  action,
  spaces,
}: GetUserPermissionParams): ActionType[] {
  const { selected, details } = spaces;
  const selectedSpace = details[selected];
  const userPermission: SpacePermission[] =
    selectedSpace && selectedSpace.permissions ? selectedSpace.permissions : [];
  const org_role = selectedSpace && selectedSpace.org_role;

  if (org_role === "admin") {
    return ["admin"];
  }

  const node = userPermission.findIndex(
    (each) =>
      each.resource === "admin" ||
      (each.resource === resource && each.actions.includes(action))
  );

  return node > -1 ? userPermission[node].actions : [];
}

export default getUserPermission;
