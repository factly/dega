import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface MissingRequirementsAlertProps {
  claimantsCount: number;
  ratingsCount: number;
  claimantsLoading: boolean;
  ratingsLoading: boolean;
}

const MissingRequirementsAlert = ({
  claimantsCount,
  ratingsCount,
  claimantsLoading,
  ratingsLoading,
}: MissingRequirementsAlertProps) => {
  const isRatingsCountZero = !ratingsLoading && ratingsCount === 0;
  const isClaimantsCountZero = !claimantsLoading && claimantsCount === 0;

  const title =
    isClaimantsCountZero && isRatingsCountZero
      ? "No claimants and ratings found"
      : isClaimantsCountZero
      ? "No claimants found"
      : "No ratings found";

  const subTitle =
    isClaimantsCountZero && isRatingsCountZero
      ? "Create claimants and ratings first to create claims"
      : isClaimantsCountZero
      ? "Create claimants first to create claims"
      : "Create ratings first to create claims";

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
        <div className="text-3xl font-bold mb-2">{title}</div>
        <p className="text-gray-600">{subTitle}</p>
      </CardContent>

      <CardFooter className="flex justify-center space-x-4">
        {isClaimantsCountZero && isRatingsCountZero ? (
          <>
            <Link to="/claimants/create">
              <Button className="flex items-center gap-2">
                Create claimant
              </Button>
            </Link>
            <Link to="/ratings/create">
              <Button className="flex items-center gap-2">
                Create Ratings
              </Button>
            </Link>
          </>
        ) : isClaimantsCountZero ? (
          <Link to="/claimants/create">
            <Button className="flex items-center gap-2">Create claimant</Button>
          </Link>
        ) : (
          <Link to="/ratings/create">
            <Button className="flex items-center gap-2">Create Ratings</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default MissingRequirementsAlert;
