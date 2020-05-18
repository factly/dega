import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layouts/basic';

function App() {
  return (
    <div className="App">
      <Router>
        <BasicLayout>
          <Switch>
            <Route exact path={process.env.PUBLIC_URL + '/'} />
          </Switch>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
