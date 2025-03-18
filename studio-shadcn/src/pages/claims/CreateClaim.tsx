import { FC } from "react";
import ClaimCreateForm from "./components/ClaimForm";
import { useSelector } from "react-redux";
import { createClaim } from "../../actions/claims";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import useNavigation from "../../utils/useNavigation";
import { RootState } from "../../store/index";
import { useAppDispatch } from "@/hooks/reduxHooks";

const CreateClaim: FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: any) => {
    Promise.resolve(dispatch(createClaim(values))).then(() => {
      history("/claims");
    });
  };

  const { claimantsCount } = useSelector((state: RootState) => {
    return {
      claimantsCount: state.claimants?.req?.[0]?.data
        ? state.claimants?.req?.[0]?.data
        : 0,
    };
  });

  return (
    <>
      <Helmet title={"Create Claim"} />
      {claimantsCount ? (
        <ClaimCreateForm onCreate={onCreate} />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-xl font-semibold">
              Cannot Create Claim
            </AlertTitle>
            <AlertDescription className="mt-2">
              You cannot create a claim without a claimant. Please create a
              claimant first.
            </AlertDescription>
          </Alert>
          <Link to="/claimants/create">
            <Button variant="default">Create Claimant</Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default CreateClaim;
