<<<<<<< Updated upstream

import { Button } from "@/components/ui/button"
import './App.css'

function App() {
  return (
    <>
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
    <Button variant="outline">Button</Button>
    </>
  )
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BasicLayout } from "./layouts/basic";
import { routes } from "./config/routesConfig";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BasicLayout />}>
          {Object.values(routes).map((route) => {
            if (!route.Component) return null;

            return (
              <Route
                key={route.path}
                path={route.path}
                element={<route.Component />}
              />
            );
          })}
        </Route>
      </Routes>
    </BrowserRouter>
  );
>>>>>>> Stashed changes
}

export default App
