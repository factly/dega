import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ChevronDown, CircleX, Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
// Import the useAppDispatch hook
import { useAppDispatch } from "@/hooks/reduxHooks";

// Import all necessary action modules
import * as spaceUsersActions from "../../actions/spaceUsers";
import * as usersActions from "../../actions/users";
import * as claimantsActions from "../../actions/claimants";
import * as ratingsActions from "../../actions/ratings";
import * as categoriesActions from "../../actions/categories";
import * as claimsActions from "../../actions/claims";
import * as tagsActions from "../../actions/tags";
import { maker } from "../../utils/sluger";

// Define types for the Selector component props
interface SelectorProps {
  invalidOptions?: string[];
  setLoading?: boolean;
  mode?: "multiple" | "tags" | undefined;
  createEntity?: string;
  value:
    | string[]
    | string
    | number
    | number[]
    | { id: number; [key: string]: any }[]
    | undefined;
  onChange: (values: string[] | string | number | number[]) => void;
  action: string;
  display?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  isQuickEdit?: boolean;
}

// Define type for entity detail object
interface EntityDetail {
  id: string | number;
  [key: string]: any;
}

// Define type for query state
interface QueryState {
  page: number;
  limit: number;
  q?: string;
}

// Define type for entity state
interface EntityState {
  details: { [key: string]: EntityDetail };
  req: Array<{
    query: any;
    data: (string | number)[];
    total: number;
  }>;
  loading: boolean;
}

// Define RootState interface
interface RootState {
  [key: string]: EntityState;
  spaces: {
    selected: number;
    spaces: any[];
  };
}

function Selector({
  invalidOptions = [],
  setLoading = true,
  mode,
  createEntity,
  value,
  onChange,
  action,
  display = "name",
  placeholder,
  style,
}: SelectorProps) {
  const originalValueType = typeof value;

  // Normalize action to lowercase and handle plurals consistently
  const normalizeEntityName = (name: string): string => {
    name = name.toLowerCase();
    // Handle special case mappings
    if (name === "authors") return "users";
    if (name === "claims") return "claims";
    if (name === "categories") return "categories";
    if (name === "tags") return "tags";

    // Remove trailing 's' for consistency if needed
    return name.endsWith("s") ? name : name;
  };

  // Convert action to lowercase for entity name
  const entity = normalizeEntityName(action);

  // Map entity names to their respective action modules
  const getActionModule = (entityName: string) => {
    switch (entityName) {
      case "spaceusers":
        return spaceUsersActions;
      case "users":
        return usersActions;
      case "claimants":
        return claimantsActions;
      case "ratings":
        return ratingsActions;
      case "categories":
        return categoriesActions;
      case "claims":
        return claimsActions;
      case "tags":
        return tagsActions;
      default:
        console.error(`No action module found for entity: ${entityName}`);
        return null;
    }
  };

  // Get the action module for this entity
  const selectorType = getActionModule(entity);

  const [entityCreatedFlag, setEntityCreatedFlag] = useState<boolean>(false);
  const [query, setQuery] = useState<QueryState>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [createdEntityId, setCreatedEntityId] = useState<
    string | number | null
  >(null);
  const dispatch = useAppDispatch();

  let normalizedValue: (string | number)[] = [];

  if (!value) {
    normalizedValue = [];
  } else if (!mode && value) {
    normalizedValue = Array.isArray(value)
      ? value.map((v) =>
          typeof v === "object" && v !== null && "id" in v ? v.id : v
        )
      : [value];
  } else {
    normalizedValue = Array.isArray(value)
      ? value.map((v) =>
          typeof v === "object" && v !== null && "id" in v ? v.id : v
        )
      : [value];
  }

  if (!placeholder) {
    placeholder = `Select ${action}`;
  }

  const { details, total, loading, ids } = useSelector((state: RootState) => {
    let details: EntityDetail[] = [];
    let ids: (string | number)[] = [];
    let total = 0;

    const stateKey = entity;
    const entityState = state[stateKey];

    if (!entityState || !entityState.req) {
      return { details, total, loading: false, ids };
    }

    // Find all entity data from all pages that have been loaded
    for (let i = 1; i <= query.page; i++) {
      const currentQuery = { ...query, page: i };

      // Find the matching request in the state
      const matchingReq = entityState.req.find((item) => {
        // Use a more flexible matching method for queries
        if (!item.query) return false;

        // Match by page and limit, ignore other properties for now
        const pageMatch =
          String(item.query.page) === String(currentQuery.page) ||
          (!item.query.page && currentQuery.page === 1);
        const limitMatch =
          String(item.query.limit) === String(currentQuery.limit) ||
          (!item.query.limit && currentQuery.limit === 20);
        const searchMatch =
          (!currentQuery.q && !item.query.q) ||
          (currentQuery.q &&
            item.query.q &&
            item.query.q.includes(currentQuery.q));

        return pageMatch && limitMatch && searchMatch;
      });

      if (matchingReq) {
        total = matchingReq.total;
        const uniqueIds = new Set(ids);
        matchingReq.data.forEach((id) => uniqueIds.add(id));
        ids = Array.from(uniqueIds);
      }
    }

    // Create a map to ensure unique details by ID
    const detailsMap = new Map<string | number, EntityDetail>();

    // Add selected values to details first
    if (normalizedValue.length > 0) {
      normalizedValue
        .filter((id) => entityState.details && entityState.details[id])
        .forEach((id) => {
          detailsMap.set(id, entityState.details[id]);
        });
    }

    // Add all loaded entities
    ids
      .filter((id) => !normalizedValue.includes(id) && entityState.details[id])
      .forEach((id) => {
        detailsMap.set(id, entityState.details[id]);
      });

    // If we have a created entity ID, make sure to include its details
    if (createdEntityId && entityState.details[createdEntityId]) {
      detailsMap.set(createdEntityId, entityState.details[createdEntityId]);
      if (!ids.includes(createdEntityId)) {
        ids.push(createdEntityId);
      }
    }

    // Convert map to array
    details = Array.from(detailsMap.values());

    return {
      details,
      total,
      loading: entityState.loading,
      ids,
    };
  });

  // Fix the entityCreatedFlag check to ensure we have the created entity
  useEffect(() => {
    if (entityCreatedFlag && !loading && createdEntityId) {
      if (!mode) {
        if (originalValueType === "number") {
          onChange(Number(createdEntityId));
        } else {
          onChange(createdEntityId);
        }
      } else {
        const newValue = [...normalizedValue, createdEntityId];
        onChange(newValue);
      }
      setEntityCreatedFlag(false);
      setCreatedEntityId(null);
      setSearchTerm("");
    }
  }, [
    entityCreatedFlag,
    loading,
    createdEntityId,
    normalizedValue,
    mode,
    onChange,
    originalValueType,
  ]);

  useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Handle search term changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value) {
      setQuery({ ...query, q: value, page: 1 });
    } else {
      // Remove q from query when search is cleared
      const { q, ...rest } = query;
      setQuery(rest);
    }
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchTerm("");
    // Remove q from query when search is cleared
    const { q, ...rest } = query;
    setQuery(rest);
  };

  const fetchEntities = () => {
    if (!selectorType) return;

    // Map action names to the correct function names based on entity type
    let actionFn: any;

    if (entity === "users" || action === "Authors") {
      actionFn = selectorType.getUsers;
    } else if (entity === "spaceusers") {
      actionFn = selectorType.getSpaceUsers;
    } else if (entity === "claimants") {
      actionFn = selectorType.getClaimants;
    } else if (entity === "ratings") {
      actionFn = selectorType.getRatings;
    } else if (entity === "categories") {
      actionFn = selectorType.getCategories;
    } else if (entity === "claims") {
      actionFn = selectorType.getClaims;
    } else if (entity === "tags") {
      actionFn = selectorType.getTags;
    } else {
      // Fallback to generic pattern
      const actionName = `get${
        entity.charAt(0).toUpperCase() + entity.slice(1)
      }`;
      actionFn = selectorType[actionName];
    }

    if (!setLoading) {
      dispatch(actionFn(query, setLoading));
      return;
    }
    dispatch(actionFn(query));
  };

  // Helper function to safely get display value
  const getDisplayValue = (item: EntityDetail | undefined): string => {
    if (!item) return "";
    if (item[display]) return item[display];
    if (item["email"]) return item["email"];
    if (item["name"]) return item["name"];
    return "";
  };

  // Handle scrolling for pagination
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 16) {
      if (
        details.length < total &&
        Math.ceil(total / query.limit) >= query.page + 1
      ) {
        setQuery({ ...query, page: query.page + 1 });
      }
    }
  };

  // Handle selection change
  const handleSelectionChange = (
    value: string | number | (string | number)[]
  ) => {
    // Check if the original value was a number
    if (originalValueType === "number" && !Array.isArray(value)) {
      // Convert string back to number for consistency
      onChange(Number(value));
    } else {
      onChange(value);
    }
  };

  // Handle removal of a single item from selection
  const handleRemoveItem = (itemId: string | number) => {
    if (mode) {
      const newValue = normalizedValue.filter((id) => id !== itemId);
      handleSelectionChange(newValue);
    }
  };

  // Handle create entity
  const handleCreateEntity = (name?: string) => {
    if (!selectorType || !createEntity) return;

    const entityName = name || searchTerm;
    if (!entityName || entityName.trim() === "") return;

    // Map create action names
    let createFn: any;

    // Use consistent naming pattern for all entities
    if (entity === "users") {
      createFn = selectorType.createUser || selectorType.addUser;
    } else if (entity === "spaceusers") {
      createFn = selectorType.createSpaceUser || selectorType.addSpaceUser;
    } else if (entity === "claimants") {
      createFn = selectorType.createClaimant;
    } else if (entity === "ratings") {
      createFn = selectorType.createRating;
    } else if (entity === "categories") {
      createFn = selectorType.createCategory;
    } else if (entity === "claims") {
      createFn = selectorType.createClaim;
    } else if (entity === "tags") {
      createFn = selectorType.createTag;
    } else {
      // Fallback to generic pattern
      const createAction = `create${createEntity}`;
      createFn = selectorType[createAction];
    }

    if (!createFn) {
      console.error(`Create action for ${entity} not found`);
      return;
    }

    // Prepare the data object based on entity type
    let entityData: any = {
      name: entityName.trim(),
    };

    // For tags, also generate a slug
    if (entity === "tags") {
      entityData.slug = maker(entityName.trim());
    }

    dispatch(createFn(entityData))
      .then((response: any) => {
        if (response && response.id) {
          setCreatedEntityId(response.id);
        } else if (response && response.data && response.data.id) {
          setCreatedEntityId(response.data.id);
        }
        // Set a new query to trigger a refetch
        setQuery({ page: 1, limit: 20 });
        setEntityCreatedFlag(true);
      })
      .catch((error: any) => {
        console.error(`Error creating ${entity}:`, error);
      });
  };

  // Filtering the details to remove invalid options and handle undefined items
  const filteredDetails = details.filter(
    (item) => item && !invalidOptions.includes(String(item.id))
  );

  // Get selected items for display in the trigger button
  const selectedItems = normalizedValue
    .map((id) => details.find((item) => item?.id === id))
    .filter((item) => item) as EntityDetail[];

  // For single select
  if (!mode) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            style={style}
          >
            {normalizedValue.length > 0 && details.length > 0
              ? getDisplayValue(
                  details.find((item) => item?.id === normalizedValue[0])
                )
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command>
            <div className="flex items-center px-2 border-b relative">
              <CommandInput
                placeholder={`Search ${action}...`}
                value={searchTerm}
                onValueChange={handleSearch}
                className="flex-1"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-8 w-8 p-0 absolute right-2"
                  aria-label="Clear search"
                >
                  <CircleX className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CommandList>
              <ScrollArea onScrollCapture={handleScroll}>
                <CommandEmpty>
                  {loading ? (
                    <div className="p-2 text-center text-sm">Loading...</div>
                  ) : (
                    <>
                      <div className="p-2 text-center text-sm">
                        No {action} found
                      </div>
                      {createEntity && searchTerm && (
                        <Button
                          variant="outline"
                          className="w-full mt-2 flex items-center justify-center"
                          onClick={() => handleCreateEntity()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create "{searchTerm}"
                        </Button>
                      )}
                    </>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {filteredDetails.map((item) => (
                    <CommandItem
                      key={`${entity}-${item?.id}`}
                      value={String(item?.id)}
                      onSelect={() => {
                        handleSelectionChange(item?.id);
                        setOpen(false);
                      }}
                      className={
                        normalizedValue.includes(item?.id)
                          ? "bg-slate-100 dark:bg-slate-700"
                          : ""
                      }
                    >
                      {getDisplayValue(item)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // For multi-select mode with badges and remove buttons
  return (
    <div style={style}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between relative h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1 py-1 pr-8">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <div
                    key={`selected-${item.id}`}
                    className="flex items-center gap-1 mr-1 mb-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 rounded-md"
                  >
                    <span className="max-w-[100px] truncate">
                      {getDisplayValue(item)}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-1 ml-1"
                      aria-label="Remove item"
                    >
                      <CircleX className="h-3 w-3" />
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <div className="flex items-center px-2 border-b relative">
              <CommandInput
                placeholder={`Search ${action}...`}
                value={searchTerm}
                onValueChange={handleSearch}
                className="flex-1"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-8 w-8 p-0 absolute right-2"
                  aria-label="Clear search"
                >
                  <CircleX className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CommandList>
              <ScrollArea onScrollCapture={handleScroll}>
                <CommandEmpty>
                  {loading ? (
                    <div className="p-2 text-center text-sm">Loading...</div>
                  ) : (
                    <>
                      <div className="p-2 text-center text-sm">
                        No {action} found
                      </div>
                      {createEntity && searchTerm && (
                        <Button
                          variant="outline"
                          className="w-full mt-2 flex items-center justify-center"
                          onClick={() => handleCreateEntity()}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Create new {action} {searchTerm}
                        </Button>
                      )}
                    </>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {filteredDetails.map((item) => (
                    <CommandItem
                      key={`${entity}-${item?.id}`}
                      value={String(item?.id)}
                      onSelect={() => {
                        const newValue = normalizedValue.includes(item?.id)
                          ? normalizedValue.filter((id) => id !== item?.id)
                          : [...normalizedValue, item?.id];
                        handleSelectionChange(newValue);
                      }}
                      className={
                        normalizedValue.includes(item?.id)
                          ? "bg-slate-100 dark:bg-slate-700"
                          : ""
                      }
                    >
                      {getDisplayValue(item)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default Selector;
