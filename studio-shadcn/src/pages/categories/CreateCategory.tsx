import React from "react";
import CategoryCreateForm from "./components/CategoryForm";
import { createCategory } from "../../actions/categories";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";

interface CategoryValues {
  name: string;
}

const CreateCategory: React.FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: CategoryValues): void => {
    dispatch(createCategory(values)).then(() => history("/categories"));
  };

  return (
    <>
      <Helmet title={"Create Category"} />
      <CategoryCreateForm onCreate={onCreate} />
    </>
  );
};

export default CreateCategory;
