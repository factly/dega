import React from "react";
import PostEditForm from "./components/PostForm";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updatePost, getPost } from "../../actions/posts";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import getUserPermission from "../../utils/getUserPermission";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { RootState } from "../../store/index";

interface Format {
  id: string;
  article: any;
}

interface EditPostProps {
  formats: {
    article: Format;
    loading: boolean;
  };
}

interface Post {
  id: number | string;
  title: string;
  format: string;
  [key: string]: any; // For other post properties
}

interface Space {
  // Define your space interface structure
  [key: string]: any;
}

function EditPost({ formats }: EditPostProps): JSX.Element {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();
  const spaces = useSelector((state: RootState) => state.spaces) as Space[];
  const actions = getUserPermission({
    resource: "posts",
    action: "get",
    spaces,
  });

  const dispatch = useAppDispatch();

  const { post, loading } = useSelector((state: RootState) => {
    return {
      post: state.posts.details[id as string]
        ? state.posts.details[id as string]
        : null,
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
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }

  if (!post) {
    return <RecordNotFound />;
  }

  // Check if the post's format matches the current format
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
