import { useState, useEffect, useRef } from "react";
import PageForm from "../posts/components/PostForm";
import { addPage } from "../../actions/pages";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Loader from "../../components/Loader";

import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Page } from "./types";

interface Format {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}
interface FormatState {
  loading: boolean;
  article: Format | null;
}

interface CreatePageProps {
  formats: FormatState;
}


function CreatePage({ formats }: CreatePageProps): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();
  const [cachedFormat, setCachedFormat] = useState<Format | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Check for cached formats on component mount
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


  const onCreate = (values: Partial<Page>): void => {
    // @ts-expect-error TODO: Fix this type error
    dispatch(addPage(values)).then((page: { id: number } | undefined) => {
      if (page && page.id) history(`/pages/${page.id}/edit`);
    });
  };

  // Loading state
  if (formats.loading && !loadingTimeout && !cachedFormat) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title="Create Page" />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  // Use either the current format or cached format
  const formatToUse = formats.article || cachedFormat;

  if (formatToUse) {
    return (
      <>
        <Helmet title={"Create Page"} />
        {/* @ts-expect-error TODO: Fix this type error */}
        <PageForm onCreate={onCreate} page={true} format={formatToUse} />
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

export default CreatePage;
