import "../App.css";
import axios from "axios";
import firebase from "firebase/compat/app";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function Workspaces() {
  const [ws, setWS] = useState(undefined);
  let navigate = useNavigate();

  const getWS = async () => {
    const idToken = await firebase.auth().currentUser.getIdToken();
    const userID = Cookies.get("user");
    const header = {
      headers: {
        Authorization: "Bearer " + idToken,
      },
    };
    try {
      const { data } = await axios.get(
        `http://${process.env.REACT_APP_SERVER_NAME}:4000/users/${userID}/workspace`,
        header
      );
      setWS(data);
    } catch (e) {
      console.log(e);
      if (e.response.status === 401) {
        alert(e.response.data.error);
        Cookies.remove("user");
        Cookies.remove("userName");
        navigate("/login");
      } else {
        alert(e.response.data.error);
      }
    }
  };

  useEffect(() => {
    // if (getUser) {
    getWS();
    // }
  }, []);

  let op = undefined;
  let createNew = (
    <div className="col">
      <Card
        className="text-center card"
        style={{ width: "18rem", height: "13rem", marginTop: "20px" }}
      >
        <Card.Body style={{ marginTop: "50px" }}>
          <Card.Title>Create New Workspace</Card.Title>
          <Link to="/workspaces/create">
            <Button variant="dark">Create</Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );

  const deleteWS = async (id) => {
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const header = {
        headers: {
          Authorization: "Bearer " + idToken,
        },
      };
      await axios.delete(`http://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/${id}`, header);
      getWS();
    } catch (e) {
      console.log(e);
    }
  }

  if (ws && ws.length !== 0) {
    const user = Cookies.get("user");
    op = ws.map((d) => {
      let role = "Member";
      let deleteBtn = null;
      if (user === d.createdBy) {
        role = "Admin";
        deleteBtn = <Button variant="danger" onClick={() => deleteWS(d._id)}>Delete Workspace</Button>;
      }
      return (
        <div className="col" key={d._id}>
          <Card
            className="text-center card"
            style={{ width: "18rem", height: "13rem", marginTop: "20px" }}
          >
            <Card.Body style={{ marginTop: "50px" }}>
              <Link className="link" to={`/workspace/${d._id}`}>
                <Card.Title> {d.name}</Card.Title>
                <Card.Text className="h6 ">
                  Members: {d.members.length}
                </Card.Text>
                <Card.Text className="h6 ">Role: {role}</Card.Text>
              </Link>
              {deleteBtn}
            </Card.Body>
          </Card>
        </div>
      );
    });
  }
  return (
    <div className="d-flex justify-content-md-center mt-4 container row">
      {createNew}
      {op}
    </div>
  );
}

export default Workspaces;
