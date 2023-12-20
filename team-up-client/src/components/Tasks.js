import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import WorkspaceNavBar from "./WorkspaceNavBar";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import axios from "axios";
import firebase from "firebase/compat/app";
import Cookies from "js-cookie";

function Tasks() {
  const userID = Cookies.get("user");
  const { id } = useParams();
  let navigate = useNavigate();
  const [taskList, setTaskList] = useState(undefined);
  const [getFNF, setFNF] = useState(false);
  let allTasks, myTask, completedTask, activeTask;
  let header;

  const getHeader = async () => {
    const idToken = await firebase.auth().currentUser.getIdToken();
    const header = {
      headers: {
        Authorization: "Bearer " + idToken,
      },
    };
    return header;
  };

  const getData = async () => {
    try {
      header = await getHeader();
      const { data } = await axios.get(
        `https://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/${id}/tasks`,
        header
      );
      setTaskList(data);
    } catch (e) {
      if (e.response.status === 404) {
        setFNF(true);
      } else {
        alert(e.response.data.error);
      }
    }
  };

  useEffect(() => {
    getData();
  }, [id, setTaskList]);

  const completeTask = async (taskData) => {
    try {
      header = await getHeader();
      let dataa = {
        id: id,
        taskId: taskData._id,
        isCompleted: false,
      };
      if (taskData.status === 2) dataa.isCompleted = true;
      await axios.patch(
        `https://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/task/${id}/${taskData._id}`,
        dataa,
        header
      );
      await getData();
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
  };

  const deleteTask = async (taskID) => {
    try {
      header = await getHeader();
      await axios.delete(
        `https://${process.env.REACT_APP_SERVER_NAME}:4000/workspace/task/${id}/${taskID}`,
        header
      );
      await getData();
    } catch (e) {
      console.log(e);
      alert(e.response.data.error);
    }
  };

  let eventKey = -1;
  const createTask = (taskData) => {
    let returnData = taskData.map((d) => {
      let taskName = d.title;
      let taskDesc = d.description;
      let startDate = d.startDate.substr(0, 10);
      let endDate = d.endDate.substr(0, 10);
      let createdName = d.createdBy[0].name;
      let complete = (
        <Button variant="success" onClick={() => completeTask(d)}>
          Mark As Completed
        </Button>
      );
      if (d.status !== 2) {
        complete = (
          <Button variant="warning" onClick={() => completeTask(d)}>
            Mark As Incomplete
          </Button>
        );
      }
      let deleteBtn = null;
      if (d.createdBy[0]._id === userID)
        deleteBtn = (
          <Button variant="danger" onClick={() => deleteTask(d._id)}>
            Delete Task
          </Button>
        );
      eventKey += 1;
      return (
        <div className="mt-2" key={d._id}>
          <Accordion>
            <Accordion.Item eventKey={eventKey}>
              <Accordion.Header>{taskName}</Accordion.Header>
              <Accordion.Body>{taskDesc}</Accordion.Body>
              <Accordion.Body>
                Start Date: {startDate} || End Date: {endDate}
                <br />
                Created By: {createdName}
              </Accordion.Body>
              <Accordion.Body>
                <Link to={`/workspace/${id}/tasks/edit/${d._id}`}>
                  <Button variant="secondary">Edit</Button>{" "}
                </Link>
                {complete} {deleteBtn}{" "}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      );
    });
    return returnData;
  };

  if (getFNF) {
    return (
      <div className="row text-center mt-4">
        <h1 style={{ color: "red" }}> Error 404: Not Found</h1>
      </div>
    );
  }

  if (taskList) {
    allTasks = createTask(taskList.allTask);
    myTask = createTask(taskList.myTask);
    completedTask = createTask(taskList.completedTask);
    activeTask = createTask(taskList.activeTask);
  }

  return (
    <div>
      <WorkspaceNavBar data={{ id: id, active: `2` }} />
      <div className="row text-center mt-4">
        <h1 className="h3">Tasks</h1>
      </div>
      <div className="mt-4">
        <Tab.Container
          id="list-group-tabs-example"
          defaultActiveKey="#ActiveTask"
        >
          <Row>
            <Col sm={3}>
              <ListGroup>
                <ListGroup.Item action href="#AllTask">
                  All Task
                </ListGroup.Item>
                <ListGroup.Item action href="#ActiveTask">
                  Active Task
                </ListGroup.Item>
                <ListGroup.Item action href="#MyTask">
                  My Task
                </ListGroup.Item>
                <ListGroup.Item action href="#CompletedTask">
                  Completed Task
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="#AllTask">{allTasks}</Tab.Pane>
                <Tab.Pane eventKey="#ActiveTask">{activeTask}</Tab.Pane>
                <Tab.Pane eventKey="#MyTask">{myTask}</Tab.Pane>
                <Tab.Pane eventKey="#CompletedTask">{completedTask}</Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
      <div>
        <Link to={`/workspace/${id}/meetings`}>
          <Button
            variant="dark"
            style={{
              position: "fixed",
              bottom: "70px",
              left: "10px",
              borderRadius: "20PX",
            }}
          >
            Schedule Meeting
          </Button>
        </Link>

        <Link to={`/workspace/${id}/tasks/create`}>
          <Button
            variant="dark"
            style={{
              position: "fixed",
              bottom: "12px",
              left: "10px",
              borderRadius: "20PX",
            }}
          >
            Create New Task
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Tasks;
