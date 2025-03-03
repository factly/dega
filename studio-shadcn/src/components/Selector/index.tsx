import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, ChevronsUpDown } from "lucide-react";
import deepEqual from "deep-equal";
import getUserPermission from "../../utils/getUserPermission";
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
import { RootState } from "../../store/index";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define types for the Selector component props
interface SelectorProps {
  invalidOptions?: string[];
  setLoading?: boolean;
  mode?: "multiple" | "tags" | undefined;
  createEntity: string;
  value: string | string[];
  onChange: (values: string | string[]) => void;
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
  const entity = action.toLowerCase();
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: createEntity,
    action: "create",
    spaces,
  });

  // Use dynamic import with TypeScript
  const selectorType = require(`../../actions/${entity}`);
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
      setQuery({ q: value, page: 1, limit: 5 });
    } else {
      setSearchValue("");
      setQuery({ page: query.page, limit: query.limit });
    }
  };

  interface EntityState {
    details: { [key: string]: EntityDetail };
    req: Array<{
      query: QueryState;
      data: string[];
      total: number;
    }>;
    loading: boolean;
  }

  const { details, total, loading, ids } = useSelector((state: RootState) => {
    let details: EntityDetail[] = [];
    let ids: string[] = [];
    let total = 0;

    const entityState = state[entity] as EntityState;

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
      .filter((id) => entityState.details[id])
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

  if (entityCreatedFlag && !loading && entity && ids.length > 0) {
    normalizedValue.push(ids[0]);
    setEntityCreatedFlag(false);
  }

  useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchEntities = () => {
    if (!setLoading) {
      dispatch(selectorType["get" + action](query, setLoading));
      return;
    }
    dispatch(selectorType["get" + action](query));
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
    dispatch(
      selectorType["create" + createEntity]({
        name: query.q?.trim() || "",
      })
    ).then(() => {
      setQuery({ page: 1, limit: 5 });
      setEntityCreatedFlag(true);
      setSearchValue("");
    });
  };

  // Filtering the details to remove invalid options
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
                  {actions.includes("admin") || actions.includes("create") ? (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={handleCreateEntity}
                      disabled={!query.q?.trim()}
                    >
                      Create a {createEntity} '{query.q}'
                    </Button>
                  ) : (
                    <p className="p-2 text-center text-sm text-muted-foreground">
                      No results found
                    </p>
                  )}
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
                  {actions.includes("admin") || actions.includes("create") ? (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={handleCreateEntity}
                      disabled={!query.q?.trim()}
                    >
                      Create a {createEntity} '{query.q}'
                    </Button>
                  ) : (
                    <p className="p-2 text-center text-sm text-muted-foreground">
                      No results found
                    </p>
                  )}
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
