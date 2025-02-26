import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { getSpaces, setSelectedSpace } from "../../actions/spaces";

interface Profile {
  medium?: {
    url?: {
      proxy?: string;
      raw?: string;
    };
  };
}

interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  tag_line: string;
  org_role?: string;
}

interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: Space[];
}

// RootState interface - matches what's in the code files
interface RootState {
  profile?: {
    details: Profile | null;
    loading: boolean;
  };
  spaces?: {
    orgs: Organization[];
    selected: string;
    details: Record<string, Space>;
    loading: boolean;
  };
  session?: {
    loading: boolean;
  };
}

interface AccountMenuProps {
  isCollapsed?: boolean;
}

export const AccountMenu = ({ isCollapsed = false }: AccountMenuProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const profile = useSelector(
    (state: RootState) => state.profile?.details || null
  );
  const profileLoading = useSelector(
    (state: RootState) => state.profile?.loading || false
  );
  const organizations = useSelector(
    (state: RootState) => state.spaces?.orgs || []
  );
  const selectedSpaceId = useSelector(
    (state: RootState) => state.spaces?.selected || ""
  );
  const spacesLoading = useSelector(
    (state: RootState) => state.spaces?.loading || false
  );

  useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);

  const handleSelectSpace = (spaceId: string) => {
    dispatch(setSelectedSpace(spaceId));
  };

  const handleCreateSpace = () => {
    navigate("/spaces/create");
  };

  // Filter spaces based on search query
  const filteredOrganizations = organizations
    .map((org) => ({
      ...org,
      spaces: (org.spaces || []).filter(
        (space) =>
          (space.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (space.site_title || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (org) =>
        (org.spaces || []).length > 0 ||
        (org.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Find selected space for display
  const findSelectedSpace = () => {
    if (!organizations || organizations.length === 0) return null;

    for (const org of organizations) {
      if (!org.spaces) continue;
      const space = org.spaces.find(
        (space) => space && space.id === selectedSpaceId
      );
      if (space) {
        return space;
      }
    }
    return null;
  };

  const selectedSpace = findSelectedSpace();

  if (isCollapsed) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
        {!profileLoading && profile?.medium ? (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                profile.medium.url?.[
                  import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                ]
              }
              alt="Profile"
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <User className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
        >
          {!profileLoading && profile?.medium ? (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  profile.medium.url?.[
                    import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                  ]
                }
                alt="Profile"
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-4 w-4" />
          )}
          <span>{selectedSpace?.name || "Select a space"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search spaces..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        {spacesLoading ? (
          <DropdownMenuItem disabled>Loading spaces...</DropdownMenuItem>
        ) : (
          <>
            {filteredOrganizations.map((org) => (
              <div key={org.id || `org-${Math.random()}`}>
                <DropdownMenuLabel>
                  {org.title || "Organization"}
                </DropdownMenuLabel>

                <DropdownMenuGroup>
                  {(org.spaces || []).map((space) => (
                    <DropdownMenuItem
                      key={space.id || `space-${Math.random()}`}
                      onClick={() => handleSelectSpace(space.id)}
                      className={
                        selectedSpaceId === space.id ? "bg-accent" : ""
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{space.name || "Unnamed space"}</span>
                        {selectedSpaceId === space.id && <span>✓</span>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
              </div>
            ))}
          </>
        )}

        <DropdownMenuItem onClick={handleCreateSpace}>
          <Plus className="h-4 w-4 mr-2" />
          <span>Create new space</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
