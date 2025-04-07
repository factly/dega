import React from "react";
import { createTag } from "../../actions/tags";
import { useAppDispatch } from "@/hooks/reduxHooks";
import TagCreateForm from "./components/TagForm";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";

// Define the interface for tag values
interface TagValues {
  name: string;
  slug?: string;
  is_featured?: boolean;
  background_colour?: any;
  description_html?: string;
  medium_id?: string;
  meta_fields?: any;
  meta?: {
    canonical_URL?: string;
    facebook?: {
      title?: string;
      canonical_URL?: string;
    };
    twitter?: {
      title?: string;
      canonical_URL?: string;
    };
    google?: {
      title?: string;
      canonical_URL?: string;
    };
  };
}

const CreateTag: React.FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = async (values: TagValues): Promise<void> => {
    await dispatch(createTag(values));
    history("/tags");
  };

  return (
    <>
      <Helmet title={"Create Tag"} />
      <TagCreateForm onCreate={onCreate} />
    </>
  );
};

export default CreateTag;
