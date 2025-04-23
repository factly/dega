import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDatefromString } from "../../../../utils/date";
import { getTrimmedURL } from "../../../../utils/url";

// Define TypeScript interfaces for our data structure
interface ClaimReview {
  textualrating: string;
}

interface Claim {
  text: string;
  claimant?: string;
  claimreview: ClaimReview[];
}

interface Publisher {
  name: string;
}

interface FactCheckProps {
  factCheck: {
    title: string;
    pageurl: string;
    claims: Claim[];
    publisher: Publisher;
    date: string;
  };
  setActiveFactCheck?: (factCheck: any) => void;
}

const FactCheck: React.FC<FactCheckProps> = ({
  factCheck,
  setActiveFactCheck,
}) => {
  return (
    <Card
      className="w-full hover:bg-gray-50 transition-colors duration-200"
      onMouseOver={() => setActiveFactCheck && setActiveFactCheck(factCheck)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          {factCheck.title}
        </CardTitle>
        <a
          href={factCheck.pageurl}
          className="text-sm text-blue-600 hover:underline"
        >
          {getTrimmedURL(factCheck.pageurl)}
        </a>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-bold text-gray-600">Claim:</h3>
            <p className="text-sm text-gray-600">{factCheck.claims[0].text}</p>
          </div>

          <div className="w-full md:w-1/2 bg-white p-3 border-l-3 border-l-black rounded-r">
            {factCheck.claims[0].claimant && (
              <p className="text-sm mb-1">
                <span className="font-bold">Claim by: </span>
                <span className="text-gray-600">
                  {factCheck.claims[0].claimant}
                </span>
              </p>
            )}
            <p className="text-sm mb-1">
              <span className="font-bold">Fact Check by: </span>
              <span className="text-gray-600">{factCheck.publisher.name}</span>
            </p>
            <p className="text-sm">
              <span className="font-bold">Rating: </span>
              <Badge variant="outline" className="ml-1 font-normal">
                {factCheck.claims[0].claimreview[0].textualrating}
              </Badge>
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <p className="text-xs text-gray-500">
          {getDatefromString(factCheck.date)}
        </p>
      </CardFooter>
    </Card>
  );
};

export default FactCheck;
