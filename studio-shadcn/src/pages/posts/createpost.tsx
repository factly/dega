import PostForm from "./components/PostForm";
import { useDispatch } from "react-redux";
import { addPost } from "../../actions/posts";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { AppDispatch } from "../../store/index";

interface Format {
  id: number;
  [key: string]: any;
}

interface Formats {
  loading: boolean;
  article?: Format;
  [key: string]: any;
}

interface CreatePostProps {
  formats: Formats;
}

function CreatePost({ formats }: CreatePostProps): React.ReactElement {
  const history = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const onCreate = (values: any): void => {
    dispatch(addPost(values)).then((post) => {
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
