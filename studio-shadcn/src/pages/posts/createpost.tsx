import PostForm from "./components/PostForm";
import { addPost } from "../../actions/posts";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";

import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface Format {
  id: number;
  name: string;
}

interface FormatState {
  loading: boolean;
  article: Format | null;
}

interface Space {
  id: number;
  name: string;
  permissions: string[];
}

interface RootState {
  spaces: Space[];
}

interface CreatePostProps {
  formats: FormatState;
}

interface PostValues {
  [key: string]: any;
}

function CreatePost({ formats }: CreatePostProps): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: PostValues): void => {
    dispatch(addPost(values)).then((post: { id: number } | undefined) => {
      if (post && post.id) history(`/posts/${post.id}/edit`);
    });
  };

  if (!formats.loading && formats.article) {
    return (
      <>
        <Helmet title={"Create Post"} />
        <PostForm onCreate={onCreate} format={formats.article} />
      </>
    );
  }

  return (
    <FormatNotFound
      status="info"
      title="Article format not found"
      link="/formats"
    />
  );
}

export default CreatePost;
