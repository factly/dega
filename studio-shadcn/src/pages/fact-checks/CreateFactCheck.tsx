import React from "react";
import FactCheckForm from "./components/FactCheckForm";
import { useSelector } from "react-redux";
import { addPost } from "../../actions/posts";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";

interface Format {
  id: number;
  name?: string;
  [key: string]: any;
}

interface CreateFactCheckProps {
  formats: {
    loading: boolean;
    factcheck: Format | null;
  };
}

function CreateFactCheck({
  formats,
}: CreateFactCheckProps): React.ReactElement {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: any): void => {
    if (values.authors && Array.isArray(values.authors)) {
      values.author_ids = values.authors;
    }

    // Ensure important fields are properly set
    if (!values.format_id && formats.factcheck) {
      values.format_id = formats.factcheck.id;
    }

    dispatch(addPost(values))
      .then((post: any) => {
        console.log("Post creation result:", post);
        if (post && post.id) {
          navigate(`/fact-checks/${post.id}/edit`);
        } else {
          console.error("Post created but no ID returned");
        }
      })
      .catch((error: any) => {
        console.error("Error creating fact check:", error);
      });
  };

  if (!formats.loading && formats.factcheck) {
    return (
      <>
        <Helmet title={"Create FactCheck"} />
        <FactCheckForm onCreate={onCreate} format={formats.factcheck} />
      </>
    );
  }

  return (
    <FormatNotFound
      status="info"
      title="Fact-Check format not found"
      link="/formats"
    />
  );
}

export default CreateFactCheck;
