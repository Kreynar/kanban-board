import React from "react";
import "./App.scss";
import Board from "./Board/Board";
import { BrowserRouter as Router, Route } from "react-router-dom";
import TaskPage from "./TaskPage/TaskPage";

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Board} />
      <Route path="/tasks/:id" component={TaskPage} />
    </div>
  </Router>
);

export default App;
