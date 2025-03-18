import React from "react";
import ClaimantEditForm from "./components/ClaimantForm";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updateClaimant, getClaimant } from "../../actions/claimants";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { RootState } from "../../store/index";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface Claimant {
  id: string;
  name: string;
  [key: string]: any;
}

function EditClaimant(): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  const { claimant, loading } = useSelector((state: RootState) => {
    return {
      claimant:
        id && state.claimants.details[id] ? state.claimants.details[id] : null,
      loading: state.claimants.loading,
    };
  });

  React.useEffect(() => {
    if (id) {
      // Check if id is numeric and parse it, otherwise use as string
      const parsedId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
      dispatch(getClaimant(parsedId));
    }
  }, [dispatch, id]);

  if (loading) return <Skeleton className="h-48 w-full" />; // Add dimensions for better UX

  if (!claimant) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Claimant>): void => {
    dispatch(updateClaimant({ ...claimant, ...values }))
      .then(() => {
        // Navigate only after successful update
        history(`/claimants/${id}/edit`);
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Update failed:", error);
      });
  };

  return (
    <>
      <Helmet title={`${claimant?.name || "Unknown"} - Edit Claimant`} />
      <ClaimantEditForm data={claimant} onCreate={onUpdate} />
    </>
  );
}

export default EditClaimant;
