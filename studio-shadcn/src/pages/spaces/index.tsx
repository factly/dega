import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceList from "./components/SpaceList";
import { RepeatIcon, PlusCircle } from "lucide-react";

// Define types for the Redux state
interface SpaceDetails {
  org_role?: string;
}

interface SpacesState {
  selected: string;
  details: {
    [key: string]: SpaceDetails;
  };
}

interface RootState {
  spaces?: SpacesState;
}

interface RoleState {
  role: string;
}

const Spaces: React.FC = () => {
  const [searchText, setSearchText] = useState("");

  const { role } = useSelector((state: RootState): RoleState => {
    // Check if spaces exists in the state
    if (!state?.spaces) {
      return { role: "member" };
    }

    const { selected } = state.spaces;

    // Check if selected is truthy and not an empty string
    if (selected && selected !== "") {
      // Safely access details and the specific space
      const details = state.spaces.details || {};
      const space = details[selected];

      // Check if space exists and has org_role
      if (space && space.org_role) {
        return {
          role: space.org_role,
        };
      }
    }

    return { role: "member" };
  });

  return (
    <div className="space-y-6">
      <Helmet title={"Spaces"} />

      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input
            className="py-2"
            placeholder="Search spaces..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          {role === "admin" && (
            <Link to="/settings/advanced/reindex">
              <Button variant="outline" className="flex items-center gap-2">
                <RepeatIcon className="h-4 w-4" />
                Reindex
              </Button>
            </Link>
          )}

          <Link to="/spaces/create">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Space
            </Button>
          </Link>
        </div>
      </div>

      <SpaceList searchQuery={searchText} />
    </div>
  );
};

export default Spaces;
