import "../App.css";
import axios from "axios";
import firebase from "firebase/compat/app";
import { useNavigate, Link, useParams } from "react-router-dom";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Alert } from "react-bootstrap";

function TaskModel() {
  const { id } = useParams();
  let navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [showAlert, setAlert] = useState(false);
  const [showError, setError] = useState("");

  const handleClose = () => {
    setShow(false);
  };

  const createTask = async () => {
    try {
      let title = document.getElementById("title").value.trim();
      let description = document.getElementById("description").value.trim();
      let startDate = document.getElementById("startDate").value.trim();
      let endDate = document.getElementById("endDate").value.trim();
      const data = {
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
      };
      data.startDate = data.startDate.substr(0, 10);
      data.endDate = data.endDate.substr(0, 10);
      if (data.title.length === 0) {
        // alert("Title cannot be empty");
        setError("Title cannot be empty");
        setAlert(true);
      } else if (data.description.length === 0) {
        // alert("Description cannot be empty");
        setError("Description cannot be empty");
        setAlert(true);
      } else if (data.startDate.length === 0) {
        // alert("Start Date cannot be empty");
        setError("Start Date cannot be empty");
        setAlert(true);
      } else if (data.endDate.length === 0) {
        // alert("End Date cannot be empty");
        setError("End Date cannot be empty");
        setAlert(true);
      } else {
        let sd = Date.parse(data.startDate);
        let ed = Date.parse(data.endDate);
        if (ed < sd) {
          // alert("End start can not be before start date");
          setError("End Date can not be before start date");
          setAlert(true);
        } else {
          const idToken = await firebase.auth().currentUser.getIdToken();
          const header = {
            headers: {
              Authorization: "Bearer " + idToken,
            },
          };
          const res = await axios.post(
            `http://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/task/${id}`,
            data,
            header
          );
          navigate(`/workspace/${id}/tasks`);
        }
      }
    } catch (e) {
      console.log(e);
      alert(e.response.data.error);
    }
  };

  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Create Task</Modal.Title>
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
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Title"
              id="title"
              name="title"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Description"
              id="description"
              name="description"
              rows={3}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control type="date" id="startDate" name="startDate" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" id="endDate" name="endDate" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Link to={`/workspace/${id}/tasks`}>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Link>
        <Button onClick={createTask} variant="primary">
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TaskModel;
