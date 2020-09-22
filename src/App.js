import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';
//Routes
import routes from './config/routesConfig';

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <BasicLayout>
          <Switch>
            {Object.values(routes).map((route) => (
              <Route key={route.path} exact path={route.path} component={route.Component} />
            ))}
          </Switch>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
