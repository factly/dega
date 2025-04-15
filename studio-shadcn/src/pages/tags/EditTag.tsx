// EditTag.tsx
import { useEffect } from "react";
import TagForm from "./components/TagForm";
import { useSelector } from "react-redux";
import { updateTag, getTag } from "../../actions/tags";
import { useParams, useNavigate } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { TagFormValues, Tag } from "./types";

// Define RootState interface
interface RootState {
  tags: {
    details: {
      [id: string]: Tag | null;
    };
    loading: boolean;
  };
}

function EditTag(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { tag, loading } = useSelector((state: RootState) => {
    return {
      tag: id && state.tags.details[id] ? state.tags.details[id] : null,
      loading: state.tags.loading,
    };
  });

  useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      dispatch(getTag(Number(id)));
    }
  }, [id, dispatch]);

  // Show loading state while fetching tag data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full mt-4" />
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }

  if (!tag) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: TagFormValues) => {
    if (id) {
      const updatedValues = {
        ...tag,
        ...values,
        id: id, // Ensure we're using the string id from the URL params
      };

      // Don't check the result, just use Promise.resolve to handle it consistently
      Promise.resolve(dispatch(updateTag(updatedValues)))
        .then(() => {
          // Navigate back to the tags list
          navigate("/tags");
        })
        .catch((error) => {
          console.error("Error updating tag:", error);
        });
    }
  };

  return (
    <>
      <Helmet title={`${tag?.name || 'Edit'} - Tag`} />
      <TagForm data={tag} onCreate={onUpdate} />
    </>
  );
}

export default EditTag;
