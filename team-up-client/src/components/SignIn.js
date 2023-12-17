import React, { useContext, useState } from "react";
import SocialSignIn from "./SocialSignIn";
// import { Navigate } from "react-router-dom";
import { AuthContext } from "../firebase/Auth";
import {
  doSignInWithEmailAndPassword,
  doPasswordReset,
} from "../firebase/FirebaseFunctions";
import axios from "axios";
import firebase from "firebase/compat/app";
import Card from "react-bootstrap/Card";
import Cookies from "js-cookie";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useNavigate, Navigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
function SignIn() {
  const { currentUser } = useContext(AuthContext);
  const user = Cookies.get("user");

  const navigate = useNavigate();

  const [showAlert, setAlert] = useState(false);
  const [showError, setError] = useState("");
  const [showSuccess, setSuccess] = useState(false);
  // if (currentUser) {
  //   navigate("/workspaces");
  // }
  const handleLogin = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    }

    if (form.checkValidity() === true) {
      event.preventDefault();
      let { email, password } = event.target;
      try {
        await doSignInWithEmailAndPassword(email.value, password.value);
        let idToken = await firebase.auth().currentUser.getIdToken();
        let { data } = await axios.post(
          "http://localhost:4000/users/login",
          null,
          {
            headers: {
              // "Content-Type": "application/json",
              Authorization: "Bearer " + idToken,
              // "Accept":"application/json"
            },
          }
        );
        if (data) {
          Cookies.set("user", data._id);
          Cookies.set("userName", data.name);
          if (data) {
            navigate("/workspaces");
          }
        }
      } catch (error) {
        setError(error.toString());
        setSuccess(false);
        setAlert(true);

        // alert(error);
      }
    }
  };
  const [validated, setValidated] = useState(false);

  const passwordReset = (event) => {
    event.preventDefault();
    let email = document.getElementById("validationCustom01").value;
    if (email) {
      doPasswordReset(email);
      // alert("Password reset email was sent");
      setError("Password reset email has been sent");
      setSuccess(true);
      setAlert(true);
    } else {
      // alert(
      //   "Please enter an email address below before you click the forgot password link"
      // );
      setError(
        "Please enter an email address below before you click the forgot password link"
      );
      setAlert(true);
    }
  };
  if (user) {
    return <Navigate to="/workspaces" />;
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <Card className="p-3" style={{ width: "40%", marginTop: "20px" }}>
        <Card.Title className="d-flex justify-content-center">
          SIGN IN
        </Card.Title>
        <Card.Body>
          <Alert
            variant={showSuccess ? "success" : "danger"}
            show={showAlert}
            onClose={() => setAlert(false)}
            dismissible
          >
            {showError}
          </Alert>
          <Form noValidate validated={validated} onSubmit={handleLogin}>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="validationCustom01">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                />
                <Form.Control.Feedback type="invalid">
                  Enter valid Email
                </Form.Control.Feedback>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="validationCustom03">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Enter valid Password
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group className="mb-3">
              <a role={"button"} onClick={passwordReset}>
                Forgot Password?
              </a>
            </Form.Group>
            <Button type="submit">Sign In</Button>
          </Form>

          <br />
          <SocialSignIn />
        </Card.Body>
      </Card>
    </div>
  );
}

export default SignIn;
