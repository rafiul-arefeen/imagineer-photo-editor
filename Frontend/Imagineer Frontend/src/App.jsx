import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import PhotoEditor from './Pages/PhotoEditor';




function App() {

  return (
    <Router>
      <Switch>
          <Route exact path="/" component={PhotoEditor} />
  
      </Switch>
    </Router>
  )
}

export default App
