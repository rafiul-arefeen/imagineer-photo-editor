import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import PhotoEditor from './Pages/PhotoEditor';
import Post from './Pages/FbUpload';



function App() {

  return (
    <Router>
      <Switch>
          <Route exact path="/" component={PhotoEditor} />
          <Route path="/post" component={Post} />

      </Switch>
    </Router>
  )
}

export default App
