import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Notifications } from "./components/Notifications/Notifications";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFormats } from "./actions/formats";
import deepEqual from "deep-equal";
import { useAppDispatch } from "./hooks/reduxHooks";
import { RootState } from "./types";
import { extractV6RouteObject } from "./config/routesConfig";

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const dispatch = useAppDispatch();

  const { formats, selected, session } = useSelector((state: RootState) => {
    const node = state.formats.req.find((item: any) => {
      return deepEqual(item.query, { space_id: state.spaces.selected });
    });

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
        return {
          formats: {
            factcheck: factcheck,
            article: article,
            loading: state.formats.loading,
          },
          selected: state.spaces.selected,
          session: state.session,
        };
      }
    }

    return {
      formats: { loading: state.formats.loading },
      selected: state.spaces.selected,
      session: state.session,
    };
  });

  useEffect(() => {
    fetchFormats();
  }, [dispatch, selected, reloadFlag]);

  const fetchFormats = () => {
    if (selected !== "") {
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
