import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BasicLayout } from "./layouts/basic";
import { routes } from "./config/routesConfig";
import "./App.css";
import { Notifications } from "./components/Notifications/Notifications";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFormats } from "./actions/formats";
import deepEqual from "deep-equal";
import { useAppDispatch } from "./hooks/reduxHooks";
import { RootState } from "./types";

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
        const format = {
          factcheck: factcheck,
          article: article,
          loading: state.formats.loading,
        };
        return {
          formats: format,
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
    if (selected !== "") dispatch(getFormats({ space_id: selected }));
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<BasicLayout />}>
            {Object.values(routes).map((route) => {
              if (!route.Component) return null;

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.Component formats={formats} />}
                />
              );
            })}
          </Route>
        </Routes>
      </BrowserRouter>
      <Notifications />
    </>
  );
}

export default App;
