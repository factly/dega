import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { addPost, deletePost, getPosts } from "../../actions/posts";
import PlaceholderImage from "../ErrorsAndImage/PlaceholderImage";
import useNavigation from "../../utils/useNavigation";
import RecordNotFound from "../ErrorsAndImage/RecordNotFound";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Import shadcn components
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "../Loader";

// TypeScript interfaces
interface Format {
  id: number;
  slug: string;
  name: string;
}

interface Medium {
  id: number;
  url: {
    raw: string;
    proxy: string;
  };
}

interface Post {
  id: number;
  title: string;
  featured_medium_id: number;
  medium?: Medium;
  tags: number[];
  categories: number[];
  claims?: number[];
}

interface PostsState {
  posts: {
    req: Array<{
      query: any;
      data: number[];
      total: number;
    }>;
    details: Record<number, Post>;
    loading: boolean;
  };
  media: {
    details: Record<number, Medium>;
  };
}

interface TemplateProps {
  format: Format;
}

function Template({ format }: TemplateProps) {
  const dispatch = useAppDispatch();
  const history = useNavigation();
  const page = 1;
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const { posts, loading } = useSelector((state: PostsState) => {
    const node = state.posts.req.find((item) => {
      let query = {
        page,
        status: "template",
        format: [format.id],
      };

      return deepEqual(item.query, query);
    });

    if (node)
      return {
        posts: node.data.map((element) => {
          const post = state.posts.details[element];
          post.medium = state.media.details[post.featured_medium_id];
          return post;
        }),
        total: node.total,
        loading: state.posts.loading,
      };

    return { posts: [], loading: state.posts.loading };
  });

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchTemplates = () => {
    dispatch(getPosts({ page: page, status: "template", format: [format.id] }));
  };

  const handleAddPost = (item: Post) => {
    if (format.slug === "article") {
      dispatch(
        addPost({
          ...item,
          tag_ids: item.tags,
          category_ids: item.categories,
          status: "draft",
        })
      ).then((res: { id: string }) => history(`/posts/${res.id}/edit`));
    } else if (format.slug === "fact-check") {
      dispatch(
        addPost({
          ...item,
          tag_ids: item.tags,
          category_ids: item.categories,
          claim_ids: item.claims,
          status: "draft",
        })
      ).then((res: { id: string }) => history(`/fact-checks/${res.id}/edit`));
    }
  };

  const confirmDelete = (id: number) => {
    setPostToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (postToDelete) {
      dispatch(deletePost(postToDelete))
        .then(() => {
          fetchTemplates();
        })
        .then(() => {
          dispatch(getPosts({ page: 1, limit: 5, format: [format.id] }));
          setDeleteAlertOpen(false);
          setPostToDelete(null);
        });
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center p-6">
          <Loader />
        </div>
      ) : posts.length === 0 ? (
        <RecordNotFound status="info" title="No Templates found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {posts.map((item: Post) => (
            <Card key={item.id} className="overflow-hidden">
              <div
                className="h-40 overflow-hidden cursor-pointer"
                onClick={() => handleAddPost(item)}
              >
                {item.medium ? (
                  <img
                    alt={item.title}
                    src={
                      item.medium.url?.[
                        import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                      ]
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <PlaceholderImage />
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                <p
                  className="cursor-pointer truncate text-sm"
                  onClick={() => handleAddPost(item)}
                >
                  {item.title}
                </p>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 p-3 pt-0">
                <Link
                  to={
                    format.slug === "article"
                      ? `/posts/${item.id}/edit`
                      : `/fact-checks/${item.id}/edit`
                  }
                >
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => confirmDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Template;
