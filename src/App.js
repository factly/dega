import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';
//Routes
import routes from './config/routesConfig';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
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
          </Switch>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
