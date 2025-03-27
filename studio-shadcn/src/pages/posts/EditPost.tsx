import React from "react";
import PostEditForm from "./components/PostForm";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updatePost, getPost } from "../../actions/posts";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import getUserPermission from "../../utils/getUserPermission";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";

// Define interfaces for the component props and state
interface Format {
  id: string;
  [key: string]: any;
}

interface Formats {
  article: Format;
  loading: boolean;
  [key: string]: any;
}

interface Post {
  id: string;
  title: string;
  format: string;
  [key: string]: any;
}

interface EditPostProps {
  formats: Formats;
}

interface RootState {
  posts: {
    details: {
      [key: string]: Post;
    };
    loading: boolean;
  };
  spaces: any;
}

function EditPost({ formats }: EditPostProps): JSX.Element {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();
  const spaces = useSelector((state: any) => state.spaces);
  const actions = getUserPermission({
    resource: "posts",
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

  React.useEffect(() => {
    if (id) {
      dispatch(getPost(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
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
    post.format !== formats.article.id
  ) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Post>) => {
    dispatch(updatePost({ ...post, ...values })).then(() => {
      history(`/posts/${id}/edit`);
    });
  };

  return (
    <>
      <Helmet title={`${post?.title} - Edit Post`} />
      <PostEditForm
        data={post}
        onCreate={onUpdate}
        actions={actions}
        format={formats.article}
      />
    </>
  );
}

export default EditPost;
