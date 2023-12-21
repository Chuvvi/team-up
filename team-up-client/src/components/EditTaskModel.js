import "../App.css";
import axios from "axios";
import firebase from "firebase/compat/app";
import { useNavigate, Link, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Alert } from "react-bootstrap";
import moment from "moment";
import Cookies from "js-cookie";

function EditTaskModel() {
  const { id, taskID } = useParams();
  let navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [task, setTask] = useState(undefined);
  const [showAlert, setAlert] = useState(false);
  const [showError, setError] = useState("");
  let prevTitle = "Title";
  let prevDesc = "Description";
  let prevSDate = "";
  let prevEDate = "";

  useEffect(() => {
    const getTask = async () => {
      try {
        const idToken = await firebase.auth().currentUser.getIdToken();
        const header = {
          headers: {
            Authorization: "Bearer " + idToken,
          },
        };
        const { data } = await axios.get(
          `https://${process.env.REACT_APP_SERVER_NAME}/workspace/task/${id}/${taskID}`,
          header
        );
        setTask(data);
      } catch (e) {
        console.log(e);
      }
    };

    getTask();
  }, [setTask]);

  if (task) {
    prevTitle = task.title;
    prevDesc = task.description;
    prevSDate = moment(task.startDate).format("YYYY-MM-DD");
    prevEDate = moment(task.endDate).format("YYYY-MM-DD");
  }

  const handleClose = () => {
    setShow(false);
  };

  const updateTask = async () => {
    if (task) {
      try {
        let data = {};
        let title = document.getElementById("title").value.trim();
        if (title.length > 0) data.title = title;
        else data.title = task.title;
        let description = document.getElementById("description").value.trim();
        if (description.length > 0) data.description = description;
        else data.description = task.description;
        let startDate = document.getElementById("startDate").value.trim();
        if (startDate.length > 0) data.startDate = startDate;
        else data.startDate = task.startDate;
        data.startDate = data.startDate.substr(0, 10);
        let endDate = document.getElementById("endDate").value.trim();
        if (endDate.length > 0) data.endDate = endDate;
        else data.endDate = task.endDate;
        data.endDate = data.endDate.substr(0, 10);
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
          const res = await axios.put(
            `https://${process.env.REACT_APP_SERVER_NAME}/workspace/task/${id}/${taskID}`,
            data,
            header
          );
          navigate(`/workspace/${id}/tasks`);
        }
      } catch (e) {
        if (e.response.status === 401) {
          alert(e.response.data.error);
          Cookies.remove("user");
          Cookies.remove("userName");
          navigate("/login");
        } else {
          alert(e.response.data.error);
        }
      }
    }
  };

  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Edit Task</Modal.Title>
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
              placeholder={prevTitle}
              id="title"
              name="title"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder={prevDesc}
              id="description"
              name="description"
              rows={3}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date : {prevSDate}</Form.Label>
            <Form.Control type="date" id="startDate" name="startDate" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Date : {prevEDate}</Form.Label>
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
        <Button onClick={updateTask} variant="primary">
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditTaskModel;
