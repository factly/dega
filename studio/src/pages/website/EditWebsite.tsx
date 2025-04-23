import React from "react";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updateSpace } from "../../actions/spaces";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import WebsiteEditForm from "./components/WebsiteEditForm";
import { Helmet } from "react-helmet";
import { RootState, WebsiteData } from "./types";
import { useAppDispatch } from "@/hooks/reduxHooks";
const EditWebsite: React.FC = () => {
  const id = useSelector((state: RootState) => state.spaces.selected);
  const dispatch = useAppDispatch();

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
