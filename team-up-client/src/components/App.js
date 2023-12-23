import React from "react";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Account from "./Account";
import Navigation from "./Navigation";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Workspaces from "./Workspaces";
import Workspace from "./Workspace";
import CreateWorkspace from "./CreateWorkspace";
import { AuthProvider, AuthContext } from "../firebase/Auth";
import PrivateRoute from "./PrivateRoute";
import Tasks from "./Tasks";
import Meetings from "./Meetings";
import Files from "./Files";
import TaskModel from "./TaskModel";
import EditTaskModel from "./EditTaskModel";
import Cookies from "js-cookie";
// import Settings from "./Settings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
        </div>
        <Routes>
          <Route path="/accounts" element={<PrivateRoute />}>
            <Route path="/accounts" element={<Account />} />
          </Route>
          <Route path="/workspaces" element={<PrivateRoute />}>
            <Route path="/workspaces" element={<Workspaces />} />
          </Route>
          <Route path="/workspace/:id" element={<PrivateRoute />}>
            <Route path="/workspace/:id" element={<Workspace />} />
          </Route>
          <Route path="/workspaces/create" element={<PrivateRoute />}>
            <Route path="/workspaces/create" element={<CreateWorkspace />} />
          </Route>
          <Route path="/workspace/:id/tasks" element={<PrivateRoute />}>
            <Route path="/workspace/:id/tasks" element={<Tasks />} />
          </Route>
          <Route path="/workspace/:id/files" element={<PrivateRoute />}>
            <Route path="/workspace/:id/files" element={<Files />} />
          </Route>
          <Route path="/workspace/:id/meetings" element={<PrivateRoute />}>
            <Route path="/workspace/:id/meetings" element={<Meetings />} />
          </Route>
          <Route path="/workspace/:id/tasks/create" element={<PrivateRoute />}>
            <Route path="/workspace/:id/tasks/create" element={<TaskModel />} />
          </Route>
          <Route
            path="/workspace/:id/tasks/edit/:taskID"
            element={<PrivateRoute />}
          >
            <Route
              path="/workspace/:id/tasks/edit/:taskID"
              element={<EditTaskModel />}
            />
          </Route>
          <Route
            path="/workspace/:id/tasks/:taskId/edit"
            element={<PrivateRoute />}
          >
            <Route
              path="/workspace/:id/tasks/:taskId/edit"
              element={<TaskModel />}
            />
          </Route>
          <Route path="/" element={<Navigate to="/workspaces" />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
