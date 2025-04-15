import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CirclePlus, Search, ChevronsUpDown } from "lucide-react";
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
  site_address?: string;
  site_title?: string;
  tag_line?: string;
  org_role?: string;
}

interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: string[]; // Array of space IDs
}

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
    org_role?: string;
  };
  sidebar?: {
    collapsed: boolean;
  };
}

interface AccountMenuProps {
  isCollapsed?: boolean;
}

export const AccountMenu = ({ isCollapsed = false }: AccountMenuProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  // Get state from Redux
  const profile = useSelector(
    (state: RootState) => state.profile?.details || null
  );
  const profileLoading = useSelector(
    (state: RootState) => state.profile?.loading || false
  );
  const spaces = useSelector((state: RootState) => state.spaces);
  const organizations = spaces?.orgs || [];
  const selectedSpaceId = spaces?.selected || "";
  const spacesDetails = spaces?.details || {};
  const spacesLoading = spaces?.loading || false;

  useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);

  const handleSelectSpace = (spaceId: string) => {
    if (spaceId === selectedSpaceId) return;

    // Simply dispatch the action and let Redux handle the rest
    dispatch(setSelectedSpace(spaceId));

    const dropdownTrigger = document.querySelector('[data-state="open"]');
    if (dropdownTrigger) {
      (dropdownTrigger as HTMLElement).click();
    }
  };

  // Handle create space button click
  const handleCreateSpace = () => {
    navigate("/spaces/create");
  };

  // Get organization spaces with filtering
  const getOrganizationSpaces = () => {
    const orgsSpaces = organizations.filter((org) => org.spaces.length > 0);
    const orgsNoSpaces = organizations.filter((org) => org.spaces.length === 0);
    const sortedOrgs = [...orgsSpaces, ...orgsNoSpaces];

    return sortedOrgs;
  };

  // Prepare grouped spaces for display
  const spacesGroupedByOrg = getOrganizationSpaces().reduce((acc, org) => {
    // Get valid spaces for this organization
    const validSpaces = org.spaces
      .map((spaceId) => spacesDetails[spaceId])
      .filter(Boolean);

    if (validSpaces.length > 0) {
      acc[org.title] = validSpaces;
    }

    return acc;
  }, {} as Record<string, Space[]>);

  const selectedSpaceName = selectedSpaceId
    ? spacesDetails[selectedSpaceId]?.name
    : "";

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

  // Full dropdown view
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between items-center px-4 py-2 bg-white rounded-md"
          // disabled={spacesLoading}
        >
          <span className="truncate max-w-[180px]">
            {spacesLoading
              ? "Loading spaces..."
              : selectedSpaceName || "Select a space"}
          </span>
          <ChevronsUpDown className="h-4 w-4 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[--radix-dropdown-menu-trigger-width] p-0"
      >
        {/* Search input */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="search spaces..."
              className="pl-8 py-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* Space list grouped by organization */}
        {spacesLoading ? (
          <DropdownMenuItem disabled className="text-center py-4">
            <div className="flex items-center justify-center w-full">
              <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
              Loading spaces...
            </div>
          </DropdownMenuItem>
        ) : Object.keys(spacesGroupedByOrg).length === 0 ? (
          <DropdownMenuItem disabled className="text-center py-4">
            No spaces found
          </DropdownMenuItem>
        ) : (
          Object.entries(spacesGroupedByOrg).map(([orgTitle, spaces]) => (
            <div key={orgTitle}>
              <DropdownMenuLabel className="text-gray-600 font-semibold px-4 py-2">
                {orgTitle}
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {spaces.map((space) => (
                  <DropdownMenuItem
                    key={space.id}
                    onClick={() => handleSelectSpace(space.id)}
                    className="px-4 py-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">
                        {space.name || "Unnamed space"}
                      </span>
                      {selectedSpaceId === space.id && (
                        <span className="text-primary">✓</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </div>
          ))
        )}

        {/* Create new space button */}
        <DropdownMenuItem
          onClick={handleCreateSpace}
          className="text-[#4E6497] mt-2 px-4 py-3"
        >
          <CirclePlus className="h-4 w-4 mr-2 text-[#4E6497]" />
          <span>Create new space</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
