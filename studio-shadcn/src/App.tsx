import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Notifications } from "./components/Notifications/Notifications";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { getFormats } from "./actions/formats";
import deepEqual from "deep-equal";
import { useAppDispatch } from "./hooks/reduxHooks";
import { RootState } from "./types";
import { extractV6RouteObject } from "./config/routesConfig";

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const dispatch = useAppDispatch();
  const formatsFetchedRef = useRef(false);

  // State to hold cached formats to prevent "Format not found" during reloads
  const [cachedFormats, setCachedFormats] = useState<any>(null);
  const cachedFormatsRef = useRef<any>(null);

  // Load cached formats from localStorage once on component mount
  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem("cachedFormats");
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        setCachedFormats(parsedFormats);
        cachedFormatsRef.current = parsedFormats;
      }
    } catch (error) {
      console.error("Error loading cached formats:", error);
    }
  }, []);

  const { formats, selected, session } = useSelector((state: RootState) => {
    const node = state.formats.req.find((item: any) => {
      return deepEqual(item.query, { space_id: state.spaces.selected });
    });

    let formatsData = {
      loading: state.formats.loading,
      hasAttemptedFetch: state.formats.hasAttemptedFetch,
    };

    if (node) {
      const formatDetails = node.data.map(
        (element: string) => state.formats.details[element]
      );
      const article = formatDetails.find(
        (format: any) => format.slug === "article"
      );
      const factcheck = formatDetails.find(
        (format: any) => format.slug === "fact-check"
      );

      if (article || factcheck) {
        formatsData = {
          factcheck: factcheck,
          article: article,
          loading: state.formats.loading,
          hasAttemptedFetch: state.formats.hasAttemptedFetch,
        };
      }
    }

    return {
      // Use cached formats from ref if needed (not direct state to avoid render loops)
      formats:
        formatsData.article || formatsData.factcheck
          ? formatsData
          : cachedFormatsRef.current || formatsData,
      selected: state.spaces.selected,
      session: state.session,
    };
  });

  // Cache formats to localStorage when they change, but use a separate effect
  // and check to avoid infinite updates
  useEffect(() => {
    if (formats.article || formats.factcheck) {
      // Only update if there's actual change
      if (
        JSON.stringify(formats) !== JSON.stringify(cachedFormatsRef.current)
      ) {
        try {
          localStorage.setItem("cachedFormats", JSON.stringify(formats));
          // Update the ref but not the state to avoid render loops
          cachedFormatsRef.current = formats;
        } catch (error) {
          console.error("Error saving cached formats:", error);
        }
      }
    }
  }, [formats.article, formats.factcheck]);

  // Effect to fetch formats when selected space changes
  useEffect(() => {
    if (selected !== "") {
      fetchFormats();
    }
  }, [dispatch, selected, reloadFlag]);

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    // If formats are still loading after 5 seconds, force set reloadFlag to trigger a refetch
    let timeoutId: number;

    if (formats.loading && selected !== "") {
      timeoutId = window.setTimeout(() => {
        if (!formatsFetchedRef.current) {
          console.log("Format loading timed out, triggering refetch");
          setReloadFlag((prev) => !prev);
        }
      }, 5000);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [formats.loading, selected]);

  const fetchFormats = () => {
    if (selected !== "") {
      formatsFetchedRef.current = true;
      dispatch(getFormats({ space_id: selected }));
    }
  };

  // Extract routes using our function and pass necessary props
  const routeObjects = extractV6RouteObject(
    // Use formats directly, with the useSelector handling caching
    formats,
    setReloadFlag,
    reloadFlag
  );

  // Create the router with these route objects
  const router = createBrowserRouter(routeObjects);

  return (
    <>
      <RouterProvider router={router} />
      <Notifications />
    </>
  );
}

export default App;
