import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import firebase from "firebase/compat/app";

function Meetings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(true);
  const handleClose = () => {
    setShow(false);
  };
  const createSchedule = async (e) => {
    e.preventDefault();
    try {
      let title = document.getElementById("title").value.trim();
      let description = document.getElementById("description").value.trim();
      let startDate = document.getElementById("startDate").value.trim();
      const data = {
        title: title,
        description: description,
        startDate: startDate,
      };
      const idToken = await firebase.auth().currentUser.getIdToken();
      const header = {
        headers: {
          Authorization: "Bearer " + idToken,
        },
      };
      const res = await axios.post(
        `http://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/${id}/meetings`,
        data,
        header
      );
      // $('#StudentModal').modal('hide');
      setShow(false);
      navigate(`/workspace/${id}/tasks`);
    } catch (error) {
      alert(error.response.data.error);
    }
  };
  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Create Schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Title"
              id="title"
              name="title"
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Add Description and Link of meeting"
              id="description"
              name="description"
              autoFocus
              rows={3}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="datetime-local"
              id="startDate"
              name="startDate"
              autoFocus
              rows={3}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Link to={`/workspace/${id}/tasks`}>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={createSchedule} variant="primary">
            Create
          </Button>
        </Link>
      </Modal.Footer>
    </Modal>
  );
}

export default Meetings;
