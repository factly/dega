import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Search as SearchIcon } from "lucide-react";
import { searchMembers, removeMember } from "../../actions/organisation";
import { Member } from "../../actions/organisation";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SecuredButton from "@/components/SecuredButton";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
}

interface RootState {
  profile: {
    details: Profile;
  } | null;
}

interface Filters {
  page: number;
  limit: number;
}

function Organisations() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
  });
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  // Fixed selector to safely handle undefined state.profile
  const profileDetails = useSelector(
    (state: RootState) => state.profile?.details
  );

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await searchMembers();
      setMembers(response.result);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(userId);
      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  // Toggle search on mobile
  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  }, [showSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredMembers = members.filter(
    (member) =>
      member.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice(
    (filters.page - 1) * filters.limit,
    filters.page * filters.limit
  );

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  // Render skeletons when loading
  const renderSkeletons = () => {
    return (
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] text-[13px]">Name</TableHead>
              <TableHead className="w-[40%] text-[13px]">Email</TableHead>
              <TableHead className="w-[20%] text-[13px]">Role</TableHead>
              <TableHead className="w-[10%] text-[13px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Organisation Members"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Organisations"
          parentLabel="Administration"
        />
      )}

      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: isCollapsed ? "89px" : "265px",
                right: 0,
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <div
          className={`flex justify-between items-center ${
            isMobile ? "pb-3 pt-1" : "px-3 pt-1 h-full"
          }`}
        >
          {/* Title */}
          {isMobile && (
            <h1 className="text-xl font-semibold">Organisation Members</h1>
          )}

          {/* Desktop search bar */}
          {!isMobile && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-4 flex-1"
            >
              <div className="relative flex-1 max-w-xs">
                <Input
                  placeholder="Search by name or email..."
                  value={searchText}
                  onChange={handleSearchChange}
                  className="h-10"
                />
              </div>
            </form>
          )}

          {/* Action buttons */}
          <div className={`${isMobile ? "flex items-center gap-2" : ""}`}>
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSearch}
                className="h-9 w-9 text-gray-500"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
            )}

            {isMobile ? (
              <SecuredButton
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate("/settings/organisations/addusers")}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                size="lg"
                className="flex items-center gap-2 py-2"
                onClick={() => navigate("/settings/organisations/addusers")}
              >
                <PlusCircle className="h-4 w-4" />
                Add New User
              </SecuredButton>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <form onSubmit={handleSearchSubmit}>
              <Input
                placeholder="Search by name or email..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-9 w-full"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      <div
        className={
          isMobile
            ? "flex-1 pb-16 pt-1 overflow-auto"
            : "absolute overflow-auto"
        }
        style={
          !isMobile
            ? {
                top: "calc(1.5rem + 2.5rem + 1rem)",
                left: 0,
                right: 0,
                bottom: 0,
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingBottom: "1.5rem",
                paddingTop: "1rem",
                transition: "left 0.3s ease, top 0.3s ease",
              }
            : undefined
        }
      >
        {loading ? (
          renderSkeletons()
        ) : (
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%] text-[13px]">Name</TableHead>
                  <TableHead className="w-[40%] text-[13px]">Email</TableHead>
                  <TableHead className="w-[20%] text-[13px]">Role</TableHead>
                  <TableHead className="w-[10%] text-[13px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell>{member.displayName || "---"}</TableCell>
                    <TableCell>{member.email || "---"}</TableCell>
                    <TableCell>{member.roles?.join(", ") || "---"}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                          {member.userId === profileDetails?.id
                            ? "Leave"
                            : "Remove"}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Organisations;
