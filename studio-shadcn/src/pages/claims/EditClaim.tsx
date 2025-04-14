import { useEffect } from "react";
import ClaimEditForm from "./components/ClaimForm";
import { useSelector } from "react-redux";
import { updateClaim, getClaim } from "../../actions/claims";
import { getClaimants } from "../../actions/claimants";
import { getRatings } from "../../actions/ratings";
import { useParams, useNavigate } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { FormattedClaimValues } from "./types";

// Define types for the claim and state
interface Claim {
  id: string;
  [key: string]: any;
}

interface RootState {
  claims: {
    details: {
      [id: string]: Claim | null;
    };
    loading: boolean;
  };
  claimants: {
    loading: boolean;
  };
  ratings: {
    loading: boolean;
  };
}

function EditClaim(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { claim, loading } = useSelector((state: RootState) => {
    return {
      claim: id && state.claims.details[id] ? state.claims.details[id] : null,
      loading: state.claims.loading,
      claimantsLoading: state.claimants.loading,
      ratingsLoading: state.ratings.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getClaim(id));
    }
    dispatch(getClaimants({ page: 1, limit: 100 }));
    dispatch(getRatings({ page: 1, limit: 100 }));
  }, [id, dispatch]);

  // Show loading state while fetching claim data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full mt-4" />
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }

  if (!claim) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: FormattedClaimValues) => {
    if (id) {
      const updatedValues = {
        ...claim,
        ...values,
        id: id, // Ensure we're using the string id from the URL params
        // Convert numeric values to string to match the expected types
        claimant: values.claimant ? String(values.claimant) : claim.claimant,
        rating: values.rating ? String(values.rating) : claim.rating,
      };

      const result = dispatch(updateClaim(updatedValues));

      if (result && typeof result.then === "function") {
        result.then(() => {
          // Navigate back to the previous page instead of a fixed route
          navigate(-1);
        });
      } else {
        // If it's not a Promise, navigate directly back
        navigate(-1);
      }
    }
  };

  return (
    <>
      <Helmet title={"Edit Claim"} />
      <ClaimEditForm data={claim} onCreate={onUpdate} />
    </>
  );
}

export default EditClaim;
