import React from "react";
import PostForm from "./components/PostForm";
import { useSelector } from "react-redux";
import { addPost } from "../../actions/posts";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import dayjs from "dayjs";

// Define interfaces for props and state
interface Format {
  id: number;
  name?: string;
  slug?: string;
}

interface Formats {
  loading: boolean;
  article: Format | null;
}

interface CreatePostProps {
  formats: Formats;
}

interface Space {
  id: string;
}

interface SpacesState {
  selected: number;
  spaces: Space[];
}

interface RootState {
  spaces: SpacesState;
}

interface PostValues {
  id?: number;
  title?: string;
  slug?: string;
  description?: any;
  description_html?: string;
  status?: string;
  format_id?: number;
  format?: number;
  published_date?: any;
  authors?: number[];
  author_ids?: number[];
  categories?: number[];
  category_ids?: number[];
  tags?: number[];
  tag_ids?: number[];
  featured_medium_id?: number;
  is_featured?: boolean;
  is_exclude_from_homepage?: boolean;
  subtitle?: string;
  excerpt?: string;
  language?: string;
  custom_format?: string;
  header_code?: string;
  footer_code?: string;
  meta_fields?: string | Record<string, any>;
  meta?: {
    title?: string;
    description?: string;
    canonical_URL?: string;
  };
}

interface Post {
  id: number;
  format: {
    name: string;
    slug?: string;
  };
}

function CreatePost({ formats }: CreatePostProps): React.ReactElement {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();
  const spaces = useSelector((state: RootState) => state.spaces);

  const onCreate = (values: PostValues): void => {
    // Make sure we have a valid format_id
    if (!values.format_id && formats.article) {
      values.format_id = formats.article.id;
    }

    // Make sure we have a valid status
    if (!values.status) {
      values.status = "draft";
    }

    // Process published_date based on status
    // For draft and ready posts, we keep the date if provided
    // For publish status, we set current date if none
    // For future status, we require a date
    if (values.status === "publish" && !values.published_date) {
      // For immediate publishing, use current date if not provided
      values.published_date = dayjs().format("YYYY-MM-DDTHH:mm:ssZ");
    } else if (values.status === "future" && !values.published_date) {
      console.error("Future publishing requires a publish date");
      return; // Don't proceed if trying to schedule without a date
    } else if (values.published_date) {
      // Ensure consistent format if date is provided
      values.published_date = dayjs(values.published_date).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      );
    }

    // Log the data for debugging
    console.log("Creating post with data:", values);

    // Dispatch the action with the data
    dispatch(addPost(values))
      .then((result) => {
        // The result here should be the post object with an id
        const post = result as unknown as Post;
        if (post && post.id) {
          navigate(`/posts/${post.id}/edit`);
        }
      })
      .catch((error) => {
        console.error("Error in onCreate:", error);
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
