import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setSelectedSpace, deleteSpace } from "../../actions/spaces";
import degaImg from "../../assets/dega.png";
import RecordNotFound from "../ErrorsAndImage/RecordNotFound";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types for our Redux state and props
interface SpaceDetails {
  id: string;
  name: string;
  logo?: {
    url: {
      proxy?: string;
      raw?: string;
    };
  };
}

interface Organization {
  id: string;
  title: string;
  spaces: string[];
}

interface SpacesState {
  orgs: Organization[];
  details: Record<string, SpaceDetails>;
}

interface RootState {
  spaces: SpacesState;
}

interface SpaceSelectorProps {
  onClose: () => void;
}

interface OrgSpaceListProps {
  org: Organization;
}

function SpaceSelector({ onClose }: SpaceSelectorProps) {
  const { orgs, details } = useSelector((state: RootState) => {
    // orgs with spaces
    const orgsSpaces = state.spaces.orgs.filter((org) => org.spaces.length > 0);
    // orgs without spaces
    const orgsNoSpaces = state.spaces.orgs.filter(
      (org) => org.spaces.length === 0
    );
    return {
      orgs: [...orgsSpaces, ...orgsNoSpaces],
      details: state.spaces.details,
    };
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    if (e.target.value.length > 0) {
      filterData(e.target.value);
    }
  };

  const filterData = (query: string) => {
    // Initialize an empty array to store the search results
    let results: Organization[] = [];

    // Loop through each organization in the `orgs` array
    for (const org of orgs) {
      // Initialize an empty array to store the spaces that match the search query
      const matchingSpaces: string[] = [];

      // Loop through each space associated with the current organization
      for (const space of org.spaces) {
        // Check if the name of the current space contains the search query
        if (details[space]?.name.toLowerCase().includes(query.toLowerCase())) {
          // If it does, add the space to the `matchingSpaces` array
          matchingSpaces.push(space);
        }
      }

      // Check if the name of the current organization contains the search query
      const orgTitleMatches = org.title
        .toLowerCase()
        .includes(query.toLowerCase());

      // Check if any spaces matched the search query and the current organization title matches
      if (matchingSpaces.length > 0 && orgTitleMatches) {
        // If so, add the current organization to the `results` array
        results.push({ ...org, spaces: matchingSpaces });
      } else if (matchingSpaces.length > 0) {
        // If only the spaces matched, create a new object with the matching spaces
        results.push({ ...org, spaces: matchingSpaces });
      } else if (orgTitleMatches) {
        // If only the organization title matched, add the current organization to the `results` array
        results.push(org);
      }
    }

    // Set the search results to the `results` array
    setSearchResults(results);
  };

  const OrgSpaceList = ({ org }: OrgSpaceListProps) => {
    return (
      <div key={org.id + org.title} className="org-space-list-container">
        <Card className="mb-4 border-0 shadow-sm">
          <CardHeader className="px-4 py-2 space-list-header">
            {searchQuery &&
            org.title.toLowerCase().includes(searchQuery.toLowerCase()) ? (
              <CardTitle className="text-sm font-bold">
                {org.title
                  .split(new RegExp(`(${searchQuery})`, "gi"))
                  .map((text, i) =>
                    text.toLowerCase() === searchQuery.toLowerCase() ? (
                      <span key={i} className="highlighted-text">
                        {text}
                      </span>
                    ) : (
                      <span key={i}>{text}</span>
                    )
                  )}
              </CardTitle>
            ) : (
              <CardTitle className="text-sm font-bold">{org.title}</CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {org.spaces.map((item) => (
                <div
                  key={item}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    dispatch(setSelectedSpace(details[item]));
                    onClose();
                  }}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <Avatar>
                      <AvatarImage
                        src={
                          details[item]?.logo?.url?.[
                            import.meta.env.VITE_ENABLE_IMGPROXY
                              ? "proxy"
                              : "raw"
                          ] || degaImg
                        }
                        alt={details[item]?.name || "Space"}
                      />
                      <AvatarFallback>
                        {details[item]?.name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {searchQuery &&
                      details[item]?.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ? (
                        <p className="font-bold">
                          {details[item]?.name
                            .split(new RegExp(`(${searchQuery})`, "gi"))
                            .map((text, i) =>
                              text.toLowerCase() ===
                              searchQuery.toLowerCase() ? (
                                <span key={i} className="highlighted-text">
                                  {text}
                                </span>
                              ) : (
                                <span key={i}>{text}</span>
                              )
                            )}
                        </p>
                      ) : (
                        <p className="font-bold">{details[item]?.name}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="list-item-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        setItemToDelete(item);
                        setModalOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSpaceSelector = () => {
    return (
      <div className={`flex flex-col items-center justify-center`}>
        <div className="w-full mb-4">
          <Input
            value={searchQuery}
            onChange={onSearch}
            placeholder="Search"
            className="p-3 rounded-lg"
          />
        </div>
        <div className="w-full text-gray-900">
          {searchQuery.length < 1 ? (
            orgs.map((org) => <OrgSpaceList key={org.id} org={org} />)
          ) : searchResults.length !== 0 ? (
            searchResults.map((item) => (
              <OrgSpaceList key={item.id} org={item} />
            ))
          ) : (
            <RecordNotFound />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between items-baseline px-5 pt-10">
          <div>
            <Button variant="ghost" onClick={onClose} className="text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-bold">Back</span>
            </Button>
          </div>
          <div>
            <Link to="/spaces/create" onClick={onClose}>
              <Button
                variant="default"
                size="lg"
                className="rounded-md bg-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Space
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8 w-full"></div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Space</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this space?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete) {
                  dispatch(deleteSpace(itemToDelete));
                  setModalOpen(false);
                  setItemToDelete(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SpaceSelector;
