import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { getSearchDetails } from "../../actions/search";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define types for our component props
interface SearchProps {
  collapsed?: boolean;
  Icon?: React.ComponentType;
}

// Define types for search data
interface SearchItem {
  id: string;
  title?: string;
  name?: string;
  claim?: string;
  [key: string]: any;
}

interface SearchDetails {
  [key: string]: SearchItem[];
}

interface RootState {
  search: {
    details: SearchDetails;
    total: number;
  };
}

interface SelectedState {
  entityIndex: number;
  indexItem: number;
}

const Search: React.FC<SearchProps> = ({ collapsed = false, Icon }) => {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<SelectedState>({
    entityIndex: 0,
    indexItem: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const searchEntities = [
    "articles",
    "fact-checks",
    "pages",
    "claims",
    "categories",
    "tags",
  ];

  const { data, total, entitiesLength } = useSelector((state: RootState) => {
    const entitiesLength = searchEntities.map((entity) => {
      return state.search.details[entity]?.length || 0;
    });
    return {
      data: state.search.details,
      total: state.search.total,
      entitiesLength: entitiesLength,
    };
  });

  useEffect(() => {
    if (query.length > 0) dispatch(getSearchDetails({ q: query }));
  }, [dispatch, query]);

  const handleNavigateResults = () => {
    let isSet = false;
    let entityIndex = selected.entityIndex;
    let indexItem = selected.indexItem;

    entitiesLength.forEach((length, index) => {
      if (
        selected.entityIndex === index &&
        selected.indexItem < length - 1 &&
        !isSet
      ) {
        isSet = true;
        indexItem = selected.indexItem + 1;
      }
      if (!isSet && index > selected.entityIndex && length !== 0) {
        isSet = true;
        indexItem = 0;
        entityIndex = index;
      }
    });

    setSelected({ entityIndex, indexItem });
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleOpenDialog = () => {
    setOpen(true);
    // Use setTimeout to focus the input after dialog opens
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div
      onKeyDown={handleNavigateResults}
      className="max-w-2xl justify-center mt-5"
    >
      {!collapsed ? (
        <div className="w-full mt-5">
          <Input
            onClick={handleOpenDialog}
            className="rounded-md h-9"
            placeholder="search articles, fact-checks, claims, categories ..."
          />
        </div>
      ) : Icon ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenDialog}
          className="p-0"
        >
          <Icon />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenDialog}
          className="p-0"
        >
          <SearchIcon className="h-5 w-5 my-1" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <div>
            <Input
              ref={inputRef}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected({ entityIndex: 0, indexItem: 0 });
              }}
              placeholder="search articles, fact-checks, claims, categories ..."
            />
          </div>

          {query.length > 0 &&
            (total > 0 ? (
              <ScrollArea className="h-96 mt-4">
                {searchEntities.map((entity, entityIndex) =>
                  data[entity]?.length > 0 ? (
                    <Card key={entity} className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle>{entity.toLocaleUpperCase()}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {data[entity].map((item, indexItem) => (
                          <Link
                            key={item.id}
                            to={`/${entity === "articles" ? "posts" : entity}/${
                              item.id
                            }/edit`}
                            onClick={handleCloseDialog}
                            className="block"
                          >
                            <div
                              className={`p-2 ${
                                indexItem === selected.indexItem &&
                                entityIndex === selected.entityIndex
                                  ? "bg-primary text-primary-foreground"
                                  : ""
                              }`}
                              onMouseOver={() =>
                                setSelected({ indexItem, entityIndex })
                              }
                            >
                              <p>{item.title || item.name || item.claim}</p>
                            </div>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  ) : null
                )}
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center mt-8 mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="text-muted-foreground">No Results Found</h4>
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Search;
