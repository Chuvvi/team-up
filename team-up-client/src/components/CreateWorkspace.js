import "../App.css";
import axios from "axios";
import firebase from "firebase/compat/app";
import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import Cookies from "js-cookie";
function CreateWorkspace() {
  let navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [showAlert, setAlert] = useState(false);
  const [showError, setError] = useState("");
  const handleClose = () => setShow(false);

  const createWs = async () => {
    try {
      let wpName = document.getElementById("wsName").value;
      wpName = wpName.trim();
      const param = {
        name: wpName,
      };
      if (wpName.length < 5) {
        // alert("Name must be at least 5 letters long");
        setError("Name must be at least 5 letters long");
        setAlert(true);
      } else {
        const idToken = await firebase.auth().currentUser.getIdToken();
        const header = {
          headers: {
            Authorization: "Bearer " + idToken,
          },
        };
        const { data } = await axios.post(
          `https://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/`,
          param,
          header
        );
        document.getElementById("wsName").value = "";
        navigate(`/workspace/${data._id}`);
      }
    } catch (err) {
      console.log(err);
      if (err.response.status === 401) {
        alert(err.response.data.error);
        Cookies.remove("user");
        Cookies.remove("userName");
        navigate("/login");
      }
      setError(err.response.data.error);
      setAlert(true);
      // alerts = (

      // );
      // alert(err.response.data.error);
    }
  };
  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Create New Workspace</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert
          variant="danger"
          show={showAlert}
          onClose={() => setAlert(false)}
          dismissible
        >
          {showError}
        </Alert>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Workspace Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter workspace name"
              id="wsName"
              name="wsName"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Link to="/workspaces">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Link>
        <Button onClick={createWs} variant="primary">
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateWorkspace;
