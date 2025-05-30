import { useState, useEffect, useRef } from "react";
import PostForm from "./components/PostForm";
import { addPost } from "../../actions/posts";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Loader from "../../components/Loader";

import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Format } from "./types";

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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [cachedFormat, setCachedFormat] = useState<Format | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Check localStorage for cached format
    try {
      const savedFormats = localStorage.getItem("cachedFormats");
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        if (parsedFormats.article) {
          setCachedFormat(parsedFormats.article);
        }
      }
    } catch (error) {
      console.error("Error checking cached formats:", error);
    }

    // Set a timeout to prevent infinite loading
    timeoutRef.current = window.setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 seconds timeout

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onCreate = (values: PostValues): void => {
    // @ts-expect-error TODO: Fix this type error
    dispatch(addPost(values)).then((post: { id: number } | undefined) => {
      if (post && post.id) history(`/posts/${post.id}/edit`);
    });
  };

  // Show loading state for a maximum of 5 seconds
  if (formats.loading && !loadingTimeout && !cachedFormat) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title="Create Post" />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  const formatToUse = formats.article || cachedFormat;

  if (formatToUse) {
    return (
      <>
        <Helmet title={"Create Post"} />
        <PostForm onCreate={onCreate} format={formatToUse} />
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
