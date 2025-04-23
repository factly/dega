import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton = ({ onClick }: SearchButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2"
      size="sm"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
};

export default SearchButton;
