import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';
//Routes
import routes from './config/routesConfig';
import ProtectedRoute from './components/ProtectedRoute';
import { Result, Button } from 'antd';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <div className="App">
      <Router basename={window.PUBLIC_URL}>
        <BasicLayout>
          <Switch>
            {Object.values(routes).map((route) =>
              route.permission ? (
                <ProtectedRoute
                  key={route.path}
                  permission={route.permission}
                  exact
                  path={route.path}
                  component={route.Component}
                />
              ) : route.isAdmin ? (
                <AdminRoute key={route.path} exact path={route.path} component={route.Component} />
              ) : (
                <Route key={route.path} exact path={route.path} component={route.Component} />
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
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
