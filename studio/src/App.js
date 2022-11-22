import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';
//Routes
import routes from './config/routesConfig';
import ProtectedRoute from './components/ProtectedRoute';
import { Result, Button } from 'antd';
import AdminRoute from './components/AdminRoute';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats } from '../src/actions/formats';
import deepEqual from 'deep-equal';
import './App.css';
import Loader from './components/Loader';

function App() {
  const [reloadFlag, setReloadFlag] = React.useState(false);
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.spaces.selected);

  const { formats } = useSelector((state) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, { space_id: selected });
    });
    if (node) {
      const formats = node.data.map((element) => state.formats.details[element]);
      const article = formats.find((format) => format.slug === 'article');
      const factcheck = formats.find((format) => format.slug === 'fact-check');
      if (article || factcheck) {
        const format = {
          factcheck: factcheck,
          article: article,
          loading: state.formats.loading,
        };
        return { formats: format };
      }
    }
    return { formats: { loading: state.formats.loading } };
  });

  const fetchFormats = () => {
    if (selected > 0) dispatch(getFormats({ space_id: selected }));
  };

  React.useEffect(() => {
    fetchFormats();
  }, [dispatch, selected, reloadFlag]);
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <BasicLayout>
          <Suspense fallback={<Loader />}>
            <Switch>
              {Object.values(routes).map((route) =>
                route.permission ? (
                  <ProtectedRoute
                    key={route.path}
                    permission={route.permission}
                    exact
                    path={route.path}
                    component={route.Component}
                    formats={formats}
                    setReloadFlag={setReloadFlag}
                    reloadFlag={reloadFlag}
                  />
                ) : route.isAdmin ? (
                  <AdminRoute
                    key={route.path}
                    exact
                    path={route.path}
                    component={route.Component}
                    formats={formats}
                  />
                ) : (
                  <Route
                    key={route.path}
                    exact
                    path={route.path}
                    isOwner={route.isOwner}
                    render={(props) => <route.Component {...props} formats={formats} />}
                  />
                ),
              )}
              <Route
                render={() => (
                  <Result
                    status="403"
                    title="404"
                    subTitle="Sorry, page not found"
                    extra={
                      <Link to="/">
                        <Button type="primary">Back Home</Button>
                      </Link>
                    }
                  />
                )}
              />
            </Switch>
          </Suspense>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
