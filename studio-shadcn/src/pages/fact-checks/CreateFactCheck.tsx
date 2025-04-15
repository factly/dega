import React, { useState, useEffect, useRef } from "react";
import FactCheckForm from "./components/FactCheckForm";
import { addPost } from "../../actions/posts";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import Loader from "../../components/Loader";

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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const cachedFormatRef = useRef<any>(null);
  const timeoutRef = useRef<number | null>(null);
  const [hasCachedFormat, setHasCachedFormat] = useState(false);

  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem("cachedFormats");
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        if (parsedFormats.factcheck) {
          setHasCachedFormat(true);
          cachedFormatRef.current = parsedFormats.factcheck;
        }
      }
    } catch (error) {
      console.error("Error loading cached formats:", error);
    }

    // Set a timeout to prevent infinite loading
    if (formats.loading) {
      timeoutRef.current = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 seconds timeout
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update timeout state if formats loading state changes
  useEffect(() => {
    if (!formats.loading) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    }
  }, [formats.loading]);

  const onCreate = (values: any): void => {
    if (values.authors && Array.isArray(values.authors)) {
      values.author_ids = values.authors;
    }

    // Ensure important fields are properly set
    if (!values.format_id && formats.factcheck) {
      values.format_id = formats.factcheck.id;
    } else if (
      !values.format_id &&
      hasCachedFormat &&
      cachedFormatRef.current
    ) {
      values.format_id = cachedFormatRef.current.id;
    }

    dispatch(addPost(values))
      .then((post: any) => {
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

  const shouldContinueRendering =
    !formats.loading || loadingTimeout || hasCachedFormat;

  // If we have a valid factcheck format, render the form
  if (formats.factcheck) {
    return (
      <>
        <Helmet title={"Create FactCheck"} />
        <FactCheckForm onCreate={onCreate} format={formats.factcheck} />
      </>
    );
  }

  // If we have a cached format from localStorage and we've tried loading formats
  if (shouldContinueRendering && hasCachedFormat && cachedFormatRef.current) {
    return (
      <>
        <Helmet title={"Create FactCheck"} />
        <FactCheckForm onCreate={onCreate} format={cachedFormatRef.current} />
      </>
    );
  }

  // If we're sure formats are loaded or timed out, and still no format found
  if (shouldContinueRendering && !formats.factcheck && !hasCachedFormat) {
    return (
      <FormatNotFound
        status="info"
        title="Fact-Check format not found"
        link="/settings/advanced/formats/create"
      />
    );
  }

  // Fallback loading state
  return (
    <div className="flex flex-col h-full relative">
      <Helmet title="Create Fact Check" />
      <div className="flex-1 flex items-center justify-center">
        <Loader className="relative inset-auto" />
      </div>
    </div>
  );
}

export default CreateFactCheck;
