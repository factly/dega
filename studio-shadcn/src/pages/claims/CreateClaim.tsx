import { FC, useEffect, useState } from "react";
import ClaimCreateForm from "./components/ClaimForm";
import { useSelector } from "react-redux";
import { createClaim } from "../../actions/claims";
import { getClaimants } from "../../actions/claimants";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import useNavigation from "../../utils/useNavigation";
import { RootState } from "../../store/index";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Loader from "../../components/Loader";

const CreateClaim: FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch claimants on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(getClaimants({ limit: 5 }));
      } finally {
        setInitialLoadDone(true);
      }
    };

    loadData();
  }, [dispatch]);

  const { claimantsCount, loading } = useSelector((state: RootState) => {
    const req = state.claimants?.req || [];
    const detailsLength = Object.keys(state.claimants?.details || {}).length;

    return {
      claimantsCount:
        req.length > 0 && req[0]?.total ? req[0].total : detailsLength,
      loading: state.claimants?.loading,
    };
  });

  const onCreate = (values: any) => {
    Promise.resolve(dispatch(createClaim(values))).then(() => {
      history("/claims");
    });
  };

  // Only show loader during initial data fetch
  if (!initialLoadDone) {
    return <Loader />;
  }

  return (
    <>
      <Helmet title={"Create Claim"} />
      {claimantsCount > 0 ? (
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
