import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface RecordNotFoundProps {
  status?: string;
  title?: string;
  link?: string;
  entity?: string;
  isReturnHome?: boolean;
}

const RecordNotFound: React.FC<RecordNotFoundProps> = ({
  status = "404",
  title = "Sorry, could not find what you are looking for.",
  link,
  entity = "Format",
  isReturnHome = false,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto mt-16 text-center">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="relative">
          <div className="rounded-full bg-primary/5 p-3 mb-4">
            <div className="rounded-full bg-primary/10 p-2">
              <AlertCircle size={64} className="text-primary" />
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold mb-2">{status}</div>
        <p className="text-gray-600">{title}</p>
      </CardContent>

      <CardFooter className="flex justify-center">
        {link ? (
          <Link to={link}>
            <Button className="flex items-center gap-2">
              {isReturnHome ? <>Back {entity}</> : <>Create {entity}</>}
            </Button>
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default RecordNotFound;
