import React, { useContext } from "react";
import { doSocialSignIn } from "../firebase/FirebaseFunctions";
import axios from "axios";
import firebase from "firebase/compat/app";
import Cookies from "js-cookie";
import { AuthContext } from "../firebase/Auth";
import { useNavigate } from "react-router-dom";

const SocialSignIn = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  // if (currentUser) {
  //   navigate("/workspaces");
  // }
  const socialSignOn = async (provider) => {
    try {
      await doSocialSignIn(provider);
      let idToken = await firebase.auth().currentUser.getIdToken();
      try {
        let { data } = await axios.post(
          `http://${process.env.REACT_APP_SERVER_NAME}:4000/users/login`,
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
          navigate("/workspaces");
        }
      } catch (e) {
        console.log(e);
      }
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div>
      <img
        onClick={() => socialSignOn("google")}
        alt="google signin"
        src="/imgs/btn_google_signin.png"
      />
    </div>
  );
};

export default SocialSignIn;
