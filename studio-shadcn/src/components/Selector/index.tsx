import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, ChevronsUpDown } from "lucide-react";
import deepEqual from "deep-equal";
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

// Import the space users actions directly
import * as spaceUsersActions from "../../actions/spaceUsers";

// Define types for the Selector component props
interface SelectorProps {
  invalidOptions?: string[];
  setLoading?: boolean;
  mode?: "multiple" | "tags" | undefined;
  createEntity: string;
  value: string[] | string | undefined;
  onChange: (values: string[] | string) => void;
  action: string;
  display?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

// Define type for entity detail object
interface EntityDetail {
  id: string;
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
    data: string[];
    total: number;
  }>;
  loading: boolean;
}

// Define RootState interface
interface RootState {
  [key: string]: EntityState;
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
  // Convert action to lowercase for entity name
  const entity = action.toLowerCase();

  // Map entity names to their respective action modules
  const getActionModule = (entityName: string) => {
    switch (entityName) {
      case "users":
        return spaceUsersActions;
      // Add other entities as needed
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
    limit: 5,
  });
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useDispatch();

  let normalizedValue: string[] = [];

  if (!value) {
    normalizedValue = [];
  } else if (!mode && value) {
    normalizedValue = Array.isArray(value) ? value : [value];
  } else {
    normalizedValue = Array.isArray(value) ? value : [value];
  }

  if (!placeholder) {
    placeholder = `Select ${entity}`;
  }

  const onSearch = (value: string) => {
    if (value) {
      setSearchValue(value);
      setQuery({ ...query, q: value, page: 1 });
    } else {
      setSearchValue("");
      setQuery({ ...query, page: query.page, q: undefined });
    }
  };

  const { details, total, loading, ids } = useSelector((state: RootState) => {
    let details: EntityDetail[] = [];
    let ids: string[] = [];
    let total = 0;

    // For 'users' we need to check spaceUsers state
    const stateKey = entity === "users" ? "spaceUsers" : entity;
    const entityState = state[stateKey];

    if (!entityState || !entityState.req) {
      return { details, total, loading: false, ids };
    }

    for (let i = 1; i <= query.page; i++) {
      let j = entityState.req.findIndex((item) =>
        deepEqual(item.query, { ...query, page: i })
      );

      if (j > -1) {
        total = entityState.req[j].total;
        ids = ids.concat(entityState.req[j].data);
      }
    }

    details = normalizedValue
      .filter((id) => entityState.details && entityState.details[id])
      .map((id) => entityState.details[id]);

    details = details.concat(
      ids
        .filter((id) => !normalizedValue.includes(id))
        .map((id) => entityState.details[id])
    );

    return {
      details,
      total,
      loading: entityState.loading,
      ids,
    };
  });

  // Fix the entityCreatedFlag check to ensure ids is not empty
  useEffect(() => {
    if (entityCreatedFlag && !loading && entity && ids.length > 0) {
      const newValue = [...normalizedValue, ids[0]];
      if (!mode) {
        onChange(ids[0]);
      } else {
        onChange(newValue);
      }
      setEntityCreatedFlag(false);
    }
  }, [
    entityCreatedFlag,
    loading,
    ids,
    entity,
    normalizedValue,
    mode,
    onChange,
  ]);

  // Get the entities state
  const entityState = useSelector((state: RootState) => {
    const stateKey = entity === "users" ? "spaceUsers" : entity;
    return state[stateKey];
  });

  useEffect(() => {
    // Check if we need to fetch new entities
    let shouldFetch = true;

    if (entityState && entityState.req) {
      // Check if this query already exists in our requests
      const existingRequest = entityState.req.some((req) =>
        deepEqual(req.query, {
          page: query.page,
          limit: query.limit,
          q: query.q,
        })
      );

      shouldFetch = !existingRequest;
    }

    if (shouldFetch) {
      fetchEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, entityState]);

  // Track if this query has already been fetched
  const [fetchedQueries, setFetchedQueries] = useState<Set<string>>(new Set());

  const fetchEntities = () => {
    if (!selectorType) return;

    // Create a query string to track what we've fetched
    const queryString = JSON.stringify(query);

    // Only fetch if we haven't already fetched this exact query
    if (fetchedQueries.has(queryString)) {
      return;
    }

    // Mark this query as fetched
    setFetchedQueries((prev) => {
      const updated = new Set(prev);
      updated.add(queryString);
      return updated;
    });

    // Map action names to the correct function names
    let actionFn;
    if (entity === "users") {
      // Use getUsers for 'users' entity
      actionFn = selectorType.getUsers;
    } else {
      const actionName = "get" + action;
      actionFn = selectorType[actionName];
    }

    // Safety check if the action creator doesn't exist
    if (!actionFn) {
      console.error(`Action creator for ${entity} not found`);
      return;
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
  const handleSelectionChange = (value: string | string[]) => {
    onChange(value);
  };

  // Handle create entity
  const handleCreateEntity = () => {
    if (!selectorType) return;

    // Map create action names
    let createFn;
    if (entity === "users") {
      createFn = selectorType.createUser;
    } else {
      const createAction = "create" + createEntity;
      createFn = selectorType[createAction];
    }

    if (!createFn) {
      console.error(`Create action for ${entity} not found`);
      return;
    }

    // Reset fetchedQueries to force a refetch after creating
    setFetchedQueries(new Set());

    dispatch(
      createFn({
        name: query.q?.trim() || "",
      })
    ).then(() => {
      // Set a new query to trigger a refetch
      setQuery({ page: 1, limit: 5 });
      setEntityCreatedFlag(true);
      setSearchValue("");
    });
  };

  // Filtering the details to remove invalid options and handle undefined items
  const filteredDetails = details.filter(
    (item) => item && !invalidOptions.includes(item.id)
  );

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
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: style?.width }}>
          <Command>
            <CommandInput
              placeholder={`Search ${entity}...`}
              value={searchValue}
              onValueChange={onSearch}
            />
            <CommandList>
              <ScrollArea className="h-64" onScrollCapture={handleScroll}>
                <CommandEmpty>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleCreateEntity}
                    disabled={!query.q?.trim()}
                  >
                    Create a {createEntity} '{query.q}'
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {filteredDetails.map((item) => (
                    <CommandItem
                      key={entity + item?.id}
                      value={item?.id}
                      onSelect={() => {
                        handleSelectionChange(item?.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          normalizedValue.includes(item?.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
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

  // For multi-select mode
  return (
    <div style={style}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {normalizedValue.length > 0
              ? `${normalizedValue.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: style?.width }}>
          <Command>
            <CommandInput
              placeholder={`Search ${entity}...`}
              value={searchValue}
              onValueChange={onSearch}
            />
            <CommandList>
              <ScrollArea className="h-64" onScrollCapture={handleScroll}>
                <CommandEmpty>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleCreateEntity}
                    disabled={!query.q?.trim()}
                  >
                    Create a {createEntity} '{query.q}'
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {filteredDetails.map((item) => (
                    <CommandItem
                      key={entity + item?.id}
                      value={item?.id}
                      onSelect={() => {
                        const newValue = normalizedValue.includes(item?.id)
                          ? normalizedValue.filter((id) => id !== item?.id)
                          : [...normalizedValue, item?.id];
                        handleSelectionChange(newValue);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          normalizedValue.includes(item?.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
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
