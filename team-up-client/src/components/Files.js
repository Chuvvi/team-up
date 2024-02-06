import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WorkspaceNavBar from "./WorkspaceNavBar";
import firebase from "firebase/compat/app";
import "../App.css";
import axios from "axios";
import moment from "moment";
import Cookies from "js-cookie";
import {
  Form,
  Row,
  Col,
  Table,
  InputGroup,
  Button,
  Alert,
} from "react-bootstrap";
function Files() {
  const { id } = useParams();
  const [getFile, setFile] = useState(undefined);
  const [getInvited, setInvited] = useState(false);
  const [showAlert, setAlert] = useState(false);
  const [showError, setError] = useState("");
  const [getFNF, setFNF] = useState(false);
  let navigate = useNavigate();
  useEffect(() => {
    setInvited(false);
    const getMembersData = async (id) => {
      try {
        const idToken = await firebase.auth().currentUser.getIdToken();
        const header = {
          headers: {
            Authorization: "Bearer " + idToken,
          },
        };
        const { data } = await axios.get(
          `https://${process.env.REACT_APP_SERVER_NAME}/workspace/${id}/files`,
          header
        );
        setFile(data);
      } catch (e) {
        if (e.response.status === 401) {
          alert(e.response.data.error);
          Cookies.remove("user");
          Cookies.remove("userName");
          navigate("/login");
        } else {
          if (e.response.status === 404) {
            setFNF(true);
          } else {
            alert(e.response.data.error);
          }
        }
      }
    };
    getMembersData(id);
  }, [id, getInvited]);

  const handleUpload = async (e) => {
    try {
      let file = document.getElementById("file").files[0];
      var formData = new FormData();
      formData.append("file", file);
      const idToken = await firebase.auth().currentUser.getIdToken();
      const header = {
        headers: {
          Authorization: "Bearer " + idToken,
          "content-type": "multipart/form-data",
        },
      };
      const { data } = await axios.post(
        `https://${process.env.REACT_APP_SERVER_NAME}/workspace/${id}/files`,
        formData,
        header
      );

      setInvited(true);
    } catch (err) {
      // alert(err.response.data.error);
      // alert("File not choosen");
      setError("Choose File to upload");
      setAlert(true);
    }
  };

  let tableBody = undefined;
  const buildTable = (file) => {
    return (
      <tr key={file._id}>
        <td>
          <a href={file.fileUrl} download>
            {file.fileName}
          </a>
        </td>
        <td>{moment(file.uploadedDate).format("MMMM Do YYYY, h:mm:ss a")}</td>
      </tr>
    );
  };
  if (getFNF) {
    return (
      <div className="row text-center mt-4">
        <h1 style={{ color: "red" }}> Error 404: Not Found</h1>
      </div>
    );
  }
  if (getFile) {
    tableBody = (
      <tbody>
        {getFile.map((el) => {
          return buildTable(el);
        })}
      </tbody>
    );
  }
  return (
    <div>
      <WorkspaceNavBar data={{ id: id, active: `3` }} />
      <div className="row text-center mt-4">
        <h1 className="h3">Files</h1>
      </div>
      <div>
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <Alert
              variant="danger"
              show={showAlert}
              onClose={() => setAlert(false)}
              dismissible
            >
              {showError}
            </Alert>
            <Form.Group>
              <Form.Label className="h6">Upload file here</Form.Label>
              <InputGroup className="mb-3">
                <Form.Control type="file" name="file" id="file" />
                <Button variant="dark" onClick={handleUpload} id="addButton">
                  Upload
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
      </div>
      <div>
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <Table striped>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Uploaded Date</th>
                </tr>
              </thead>
              {tableBody}
            </Table>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Files;
