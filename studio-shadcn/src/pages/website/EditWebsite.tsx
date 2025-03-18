import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updateSpace } from "../../actions/spaces";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import WebsiteEditForm from "./components/WebsiteEditForm";
import { Helmet } from "react-helmet";

// Type definitions
interface Space {
  id: string;
  [key: string]: any; // Additional space properties
}

interface SpacesState {
  selected: string;
  details: Record<string, Space>;
  loading: boolean;
}

interface RootState {
  spaces: SpacesState;
}

interface WebsiteData {
  name?: string;
  site_title?: string;
  tag_line?: string;
  description?: string;
  slug?: string;
  site_address?: string;
  organisation_id?: string;
  space_id?: string;
  meta_fields?: string | Record<string, any>;
  [key: string]: any; // Allow for additional properties
}

const EditWebsite: React.FC = () => {
  const id = useSelector((state: RootState) => state.spaces.selected);
  const dispatch = useDispatch();

  const { space, loading } = useSelector((state: RootState) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values: WebsiteData) => {
    dispatch(updateSpace({ ...space, ...values }));
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <>
      <Helmet title={"Edit Website"} />
      <WebsiteEditForm onCreate={onCreate} data={space} />
    </>
  );
};

export default EditWebsite;
