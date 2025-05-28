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

  // State to hold cached formats
  const [cachedFormats, setCachedFormats] = useState<any>(null);

  // Load cached formats from localStorage once on component mount
  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem("cachedFormats");
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        setCachedFormats(parsedFormats);
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

        // Update localStorage with latest format data whenever we have valid formats
        try {
          localStorage.setItem("cachedFormats", JSON.stringify(formatsData));
        } catch (error) {
          console.error("Error saving cached formats:", error);
        }
      }
    }

    // If there's no format data in Redux, but we have cached data, use that
    if (!formatsData.article && !formatsData.factcheck && cachedFormats) {
      if (cachedFormats.article || cachedFormats.factcheck) {
        return {
          formats: {
            ...formatsData,
            article: cachedFormats.article || null,
            factcheck: cachedFormats.factcheck || null,
          },
          selected: state.spaces.selected,
          session: state.session,
        };
      }
    }

    return {
      formats: formatsData,
      selected: state.spaces.selected,
      session: state.session,
    };
  });

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
  const routeObjects = extractV6RouteObject(formats, setReloadFlag, reloadFlag);

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
