import React from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updateSpace } from "../../actions/spaces";
import SpaceEditForm from "./components/SpaceEditForm";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { AppDispatch, RootState } from "../../types";

export interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  tag_line: string;
  description?: string;
  slug?: string;
  organisation_id: string;
  meta_fields?: string | Record<string, any>;
  org_role?: string;
}

const EditSpace: React.FC = () => {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { space, loading } = useSelector((state: RootState) => {
    return {
      space: state.spaces.details[id as string],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values: Partial<Space>): void => {
    if (space && id) {
      dispatch(updateSpace({ ...space, ...values })).then(() =>
        history(`/admin/spaces`)
      );
    }
  };

  if (loading) return <Skeleton className="w-full h-48" />;

  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <>
      <Helmet title={`${space?.name} - Edit Space`} />
      <SpaceEditForm onCreate={onCreate} data={space} />
    </>
  );
};

export default EditSpace;
