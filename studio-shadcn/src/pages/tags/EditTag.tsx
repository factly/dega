import React from "react";
import TagEditForm from "./components/TagForm";
import { useSelector } from "react-redux";
import { updateTag, getTag } from "../../actions/tags";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { RootState } from "../../store/index";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface Tag {
  id: string;
  name: string;
  // Add other tag properties as needed
}

function EditTag(): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();
  const { tag, loading } = useSelector((state: RootState) => {
    return {
      tag: state.tags.details[id] ? state.tags.details[id] : null,
      loading: state.tags.loading,
    };
  });

  React.useEffect(() => {
    if (id) {
      dispatch(getTag(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!tag) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Tag>) => {
    dispatch(updateTag({ ...tag, ...values }));
    history(`/tags/${id}/edit`);
  };

  return (
    <>
      <Helmet title={`${tag?.name} - Edit Tag`} />
      <TagEditForm data={tag} onCreate={onUpdate} />
    </>
  );
}

export default EditTag;
