import React, { useEffect } from "react";
import PolicyEditForm from "./components/PolicyForm";
import { useSelector } from "react-redux";
import { getPolicy, updatePolicy } from "../../actions/policies";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Policy, RootState, PolicyFormData, Permission } from "./types";

function EditPolicy(): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  const { policy, loading } = useSelector((state: RootState) => {
    if (!id || !state.policies.details[id])
      return {
        policy: null,
        loading: state.policies.loading,
      };

    return {
      policy: {
        ...state.policies.details[id],
        permissions:
          state.policies.details[id].permissions?.reduce<
            Record<string, string[]>
          >(
            (obj, item) =>
              Object.assign(obj, { [item.resource]: item.actions }),
            {}
          ) || {},
      },
      loading: state.policies.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getPolicy(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  if (!policy) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: {
    name: string;
    users: string[];
    description?: string;
    permissions: Permission[];
  }) => {
    dispatch(
      updatePolicy({
        ...policy,
        ...values,
      } as Policy)
    ).then(() => history(`/settings/members/policies/`));
  };

  return (
    <>
      <Helmet title={`${policy.name} - Edit Policy`} />
      <PolicyEditForm data={policy as PolicyFormData} onCreate={onUpdate} />
    </>
  );
}

export default EditPolicy;
