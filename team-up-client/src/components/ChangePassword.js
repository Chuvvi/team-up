import React, { useContext, useState } from "react";
import { AuthContext } from "../firebase/Auth";
import { doChangePassword } from "../firebase/FirebaseFunctions";
import "../App.css";
import { Button, Card, Form, Row, Col } from "react-bootstrap";

function ChangePassword() {
  const { currentUser } = useContext(AuthContext);
  const [pwMatch, setPwMatch] = useState("");

  const submitForm = async (event) => {
    event.preventDefault();
    const { currentPassword, newPasswordOne, newPasswordTwo } =
      event.target.elements;

    if (newPasswordOne.value !== newPasswordTwo.value) {
      setPwMatch("New Passwords do not match, please try again");
      return false;
    }

    try {
      await doChangePassword(
        currentUser.email,
        currentPassword.value,
        newPasswordOne.value
      );
      alert("Password has been changed, you will now be logged out");
    } catch (error) {
      alert(error);
    }
  };

  if (currentUser.providerData[0].providerId === "password") {
    return (
      <div>
        <Card className="p-3">
          <Card.Title className="d-flex justify-content-center">
            Change Password
          </Card.Title>
          <Card.Body>
            {pwMatch && <h4 className="error">{pwMatch}</h4>}
            <Form onSubmit={submitForm}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationCustom03">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    name="currentPassword"
                    type="password"
                    placeholder="Current Password"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter valid Password
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationCustom04">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    name="newPasswordOne"
                    type="password"
                    placeholder="Password"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter valid Password
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationCustom05">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    name="newPasswordTwo"
                    type="password"
                    placeholder="Confirm Password"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter valid Password
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              {/* <div className="form-group">
                <label>
                  Current Password:
                  <input
                    className="form-control"
                    name="currentPassword"
                    id="currentPassword"
                    type="password"
                    placeholder="Current Password"
                    autoComplete="off"
                    required
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  New Password:
                  <input
                    className="form-control"
                    name="newPasswordOne"
                    id="newPasswordOne"
                    type="password"
                    placeholder="Password"
                    autoComplete="off"
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Confirm New Password:
                  <input
                    className="form-control"
                    name="newPasswordTwo"
                    id="newPasswordTwo"
                    type="password"
                    placeholder="Confirm Password"
                    autoComplete="off"
                    required
                  />
                </label>
              </div> */}

              <Button type="submit">Change Password</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  } else {
    return (
      <div>
        <h2 className="h4">
          You are signed in using a Social Media Provider, You cannot change
          your password
        </h2>
      </div>
    );
  }
}

export default ChangePassword;
