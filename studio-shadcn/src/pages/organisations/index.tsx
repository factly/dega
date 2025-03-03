import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
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
import { Plus, Search, Trash2 } from "lucide-react";
import { searchMembers, removeMember } from "../../actions/organisation";
import { Member } from "../../actions/organisation";

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
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
  });

  // Fixed selector to safely handle undefined state.profile
  const profileDetails = useSelector(
    (state: RootState) => state.profile?.details
  );

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

  const filteredMembers = members.filter(
    (member) =>
      member.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice(
    (filters.page - 1) * filters.limit,
    filters.page * filters.limit
  );

  return (
    <div className="p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-6">
        <h2 className="text-2xl font-bold tracking-tight">Members</h2>
        <Button onClick={() => navigate("/settings/organisations/addusers")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
      <div>
        <div className="flex justify-end mb-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead className="w-[40%]">Email</TableHead>
                <TableHead className="w-[20%]">Role</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">
                    {member.displayName || "---"}
                  </TableCell>
                  <TableCell>{member.email || "---"}</TableCell>
                  <TableCell>{member.roles?.join(", ") || "---"}</TableCell>
                  <TableCell>
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
      </div>
    </div>
  );
}

export default Organisations;
