// components/MissingRequirementsAlert.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  ratingsLoading
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
      ? "Create claimants to first to create claims"
      : "Create ratings first to create claims";

  const extra =
    isClaimantsCountZero && isRatingsCountZero ? (
      <div className="flex justify-center space-x-4">
        <Link to="/claimants/create">
          <Button>Create claimant</Button>
        </Link>
        <Link to="/ratings/create">
          <Button>Create Ratings</Button>
        </Link>
      </div>
    ) : isClaimantsCountZero ? (
      <Link to="/claimants/create">
        <Button>Create claimant</Button>
      </Link>
    ) : (
      <Link to="/ratings/create">
        <Button>Create Ratings</Button>
      </Link>
    );

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{subTitle}</AlertDescription>
        <div className="mt-4">{extra}</div>
      </Alert>
    </div>
  );
};

export default MissingRequirementsAlert;
