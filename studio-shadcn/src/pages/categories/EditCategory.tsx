import { useEffect } from "react";
import CategoryForm from "./components/CategoryForm";
import { useSelector } from "react-redux";
import { updateCategory, getCategory } from "../../actions/categories";
import { useParams, useNavigate } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { CategoryFormValues, Category } from "./types";

// Define RootState interface
interface RootState {
  categories: {
    details: {
      [id: string]: Category | null;
    };
    loading: boolean;
  };
}

function EditCategory(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { category, loading } = useSelector((state: RootState) => {
    return {
      category: id && state.categories.details[id] ? state.categories.details[id] : null,
      loading: state.categories.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getCategory(id));
    }
  }, [id, dispatch]);

  // Show loading state while fetching category data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full mt-4" />
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }

  if (!category) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: CategoryFormValues) => {
    if (id) {
      const updatedValues = {
        ...category,
        ...values,
        id: id, // Ensure we're using the string id from the URL params
      };

      const result = dispatch(updateCategory(updatedValues));

      if (result && typeof result.then === "function") {
        result.then(() => {
          // Navigate back to the categories list
          navigate("/categories");
        }).catch((error) => {
          console.error("Error updating category:", error);
        });
      } else {
        // If it's not a Promise, navigate directly back
        navigate("/categories");
      }
    }
  };

  return (
    <>
      <Helmet title={`${category?.name || 'Edit'} - Category`} />
      <CategoryForm data={category} onCreate={onUpdate} />
    </>
  );
}

export default EditCategory;
