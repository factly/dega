import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';
import { useDispatch } from 'react-redux';
import { getSpaces } from './actions/spaces';

//Routes
import routes from './config/routesConfig';

function App() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getSpaces());
  });

  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <BasicLayout>
          <Switch>
            {routes.map((route) => (
              <Route key={route.path} exact path={route.path} component={route.Component} />
            ))}
          </Switch>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
