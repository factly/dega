import React from "react";
import CategoryEditForm from "./components/CategoryForm";
import { useSelector } from "react-redux";
import { updateCategory, getCategory } from "../../actions/categories";
import { useParams, useNavigate } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define TypeScript interfaces
interface Category {
  id: number;
  name: string;
  [key: string]: any;
}

interface RootState {
  categories: {
    details: {
      [key: string]: Category;
    };
    loading: boolean;
  };
}

function EditCategory(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id || "0", 10);

  const dispatch = useAppDispatch();

  const { category, loading } = useSelector((state: RootState) => {
    return {
      // Use string ID for lookup in details object
      category: state.categories.details[id as string]
        ? state.categories.details[id as string]
        : null,
      loading: state.categories.loading,
    };
  });

  React.useEffect(() => {
    // Only fetch if ID is valid (not 0 and not NaN)
    if (id && numericId > 0) {
      dispatch(getCategory(numericId));
    }
  }, [dispatch, id, numericId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!category) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Category>) => {
    dispatch(updateCategory({ ...category, ...values })).then(() => {
      // Navigate to the categories list after update
      navigate("/categories");
    });
  };

  return (
    <>
      <Helmet title={`${category?.name} - Edit Category`} />
      <CategoryEditForm data={category} onCreate={onUpdate} />
    </>
  );
}

export default EditCategory;
