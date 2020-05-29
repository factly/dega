import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';
import { useDispatch } from 'react-redux';
import { getSpaces } from './actions/spaces';

//Pages
import Dashboard from './pages/dashboard';

//Routes
import routes from './config/routesConfig';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSpaces());
  });

  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <BasicLayout>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            {routes.map((route) => (
              <Route exact path={route.path} component={route.Component} />
            ))}
          </Switch>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
