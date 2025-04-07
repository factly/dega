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
  id: number | string;
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

  const dispatch = useAppDispatch();

  const { category, loading } = useSelector((state: RootState) => {
    // First try to get the category using the exact ID string from params
    if (state.categories.details[id as string]) {
      return {
        category: state.categories.details[id as string],
        loading: state.categories.loading,
      };
    }

    // If not found, return null category and loading state
    return {
      category: null,
      loading: state.categories.loading,
    };
  });

  React.useEffect(() => {
    // Only fetch if ID is valid
    if (id) {
      dispatch(getCategory(id));
    }
  }, [dispatch, id]);

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
    const updatedCategory = {
      ...category,
      ...values,
      id: category.id,
    };

    dispatch(updateCategory(updatedCategory))
      .then(() => {
        // Navigate to the categories list after update
        navigate("/categories");
      })
      .catch((error) => {
        console.error("Error updating category:", error);
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
