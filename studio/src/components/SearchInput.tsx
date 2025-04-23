import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SearchInputProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearchSubmit: () => void;
  clearSearch: () => void;
  autoFocus?: boolean;
}

const SearchInput = ({
  searchText,
  setSearchText,
  handleSearchSubmit,
  clearSearch,
  autoFocus = false
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <div className="relative w-full md:w-[250px]">
      <Input
        ref={inputRef}
        placeholder="Search pages..."
        value={searchText}
        onChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        className="h-10 w-full md:w-[250px]"
      />
      {searchText && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={clearSearch}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
