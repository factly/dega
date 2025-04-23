import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import SecuredButton from "@/components/SecuredButton";

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
  const navigate = useNavigate();
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

  const handleNavigate = (path: string) => {
    navigate(path);
  };

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
            <SecuredButton
              className="flex items-center gap-2"
              onClick={() => handleNavigate("/claimants/create")}
            >
              Create claimant
            </SecuredButton>
            <SecuredButton
              className="flex items-center gap-2"
              onClick={() => handleNavigate("/ratings/create")}
            >
              Create Ratings
            </SecuredButton>
          </>
        ) : isClaimantsCountZero ? (
          <SecuredButton
            className="flex items-center gap-2"
            onClick={() => handleNavigate("/claimants/create")}
          >
            Create claimant
          </SecuredButton>
        ) : (
          <SecuredButton
            className="flex items-center gap-2"
            onClick={() => handleNavigate("/ratings/create")}
          >
            Create Ratings
          </SecuredButton>
        )}
      </CardFooter>
    </Card>
  );
};

export default MissingRequirementsAlert;
