// CreateCategory.tsx
import { FC } from "react";
import CategoryForm from "./components/CategoryForm";
import { createCategory } from "../../actions/categories";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { CategoryFormValues } from "./types";

const CreateCategory: FC = () => {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: CategoryFormValues) => {
    // Use Promise.resolve to handle the dispatch result consistently
    Promise.resolve(dispatch(createCategory(values))).then(() => {
      navigate("/categories");
    }).catch((error) => {
      console.error("Error creating category:", error);
    });
  };

  return (
    <>
      <Helmet title={"Create Category"} />
      <CategoryForm onCreate={onCreate} />
    </>
  );
};

export default CreateCategory;
