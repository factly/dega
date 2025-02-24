import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BasicLayout } from "./layouts/basic";
import { Dashboard } from "./pages/dashboard";
import { Analytics } from "./pages/analytics";
import { routes } from "../src/config/routesConfig";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route path={routes.home.path} element={<Dashboard />} />
          <Route path={routes.analytics.path} element={<Analytics />} />
          <Route path={routes.search.path} element={<div>Search Page</div>} />
          {/* Core Routes */}
          <Route path={routes.posts.path} element={<div>Posts Page</div>} />
          <Route path={routes.pages.path} element={<div>Pages Page</div>} />
          <Route
            path={routes.categories.path}
            element={<div>Categories Page</div>}
          />
          <Route path={routes.tags.path} element={<div>Tags Page</div>} />
          <Route path={routes.media.path} element={<div>Media Page</div>} />

          {/* Fact Checking Routes */}
          <Route
            path={routes.factCheck.path}
            element={<div>Fact Check Page</div>}
          />
          <Route path={routes.claims.path} element={<div>Claims Page</div>} />
          <Route
            path={routes.claimants.path}
            element={<div>Claimants Page</div>}
          />
          <Route path={routes.ratings.path} element={<div>Ratings Page</div>} />
          <Route
            path={routes.googleFactCheck.path}
            element={<div>Google Fact Check Page</div>}
          />
          <Route path={routes.sach.path} element={<div>SACH Page</div>} />

          {/* Administration Routes */}
          <Route path={routes.spaces.path} element={<div>Spaces Page</div>} />
          <Route
            path={routes.requests.path}
            element={<div>Requests Page</div>}
          />
          <Route
            path={routes.permissions.path}
            element={<div>Permissions Page</div>}
          />
          <Route path={routes.events.path} element={<div>Events Page</div>} />
          <Route
            path={routes.settings.path}
            element={<div>Settings Page</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
