// CreateTag.tsx
import { FC } from "react";
import TagForm from "./components/TagForm";
import { createTag } from "../../actions/tags";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { TagFormValues } from "./types";

const CreateTag: FC = () => {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: TagFormValues) => {
    Promise.resolve(dispatch(createTag(values))).then(() => {
      navigate("/tags");
    }).catch((error) => {
      console.error("Error creating tag:", error);
    });
  };

  return (
    <>
      <Helmet title={"Create Tag"} />
      <TagForm onCreate={onCreate} />
    </>
  );
};

export default CreateTag;
