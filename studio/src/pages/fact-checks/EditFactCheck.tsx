import { useEffect } from "react";
import EditFactCheckForm from "./components/FactCheckForm";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updatePost, getPost } from "../../actions/posts";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import getUserPermission from "../../utils/getUserPermission";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface Format {
  id: string;
  [key: string]: any;
}

interface Formats {
  factcheck: Format;
  loading: boolean;
  [key: string]: any;
}

interface Post {
  id: string;
  title: string;
  format: string;
  [key: string]: any;
}

interface PostsState {
  details: {
    [key: string]: Post;
  };
  loading: boolean;
}

interface SpacesState {
  [key: string]: any;
}

interface RootState {
  posts: PostsState;
  spaces: SpacesState;
}

interface EditFactCheckProps {
  formats: Formats;
}

function EditFactCheck({ formats }: EditFactCheckProps): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();
  const spaces = useSelector((state: { spaces: SpacesState }) => state.spaces);
  const actions = getUserPermission({
    resource: "fact-checks",
    action: "get",
    spaces,
  });
  const dispatch = useAppDispatch();

  const { post, loading } = useSelector((state: RootState) => {
    return {
      post: state.posts.details[id] ? state.posts.details[id] : null,
      loading: state.posts.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getPost(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!post) {
    return <RecordNotFound />;
  }

  if (
    post &&
    post.id &&
    !formats.loading &&
    post.format !== formats.factcheck.id
  ) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Post>) => {
    dispatch(updatePost({ ...post, ...values })).then(() => {
      history(`/fact-checks/${id}/edit`);
    });
  };

  return (
    <>
      <Helmet title={`${post?.title} - Edit Fact Check`} />
      <EditFactCheckForm
        data={post}
        onCreate={onUpdate}
        actions={actions}
        format={formats.factcheck}
      />
    </>
  );
}

export default EditFactCheck;
