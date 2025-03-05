import React from "react";
import { Link } from "react-router-dom";
import TokenList from "./components/TokenList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Tokens: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Link to="/settings/advanced/tokens/create">
          <Button variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate new tokens
          </Button>
        </Link>
      </div>

      <TokenList />
    </div>
  );
};

export default Tokens;
