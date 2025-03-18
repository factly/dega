import { useEffect } from "react";
import PolicyEditForm from "./components/PolicyForm";
import { useSelector } from "react-redux";
import { getPolicy, updatePolicy } from "../../actions/policies";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define interfaces for our data types
interface Permission {
  resource: string;
  actions: string[];
}

interface Policy {
  id: string;
  name: string;
  permissions?: Permission[];
  [key: string]: any;
}

interface PolicyWithFormattedPermissions extends Omit<Policy, "permissions"> {
  permissions?: Record<string, string[]>;
}

interface RootState {
  policies: {
    details: Record<string, Policy>;
    loading: boolean;
  };
}

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
        permissions: state.policies.details[id].permissions?.reduce<
          Record<string, string[]>
        >(
          (obj, item) => Object.assign(obj, { [item.resource]: item.actions }),
          {}
        ),
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

  const onUpdate = (values: Partial<PolicyWithFormattedPermissions>) => {
    dispatch(updatePolicy({ ...policy, ...values })).then(() =>
      history(`/settings/members/policies/`)
    );
  };

  return (
    <>
      <Helmet title={`${policy.name} - Edit Policy`} />
      <PolicyEditForm data={policy} onCreate={onUpdate} />
    </>
  );
}

export default EditPolicy;
