import constants from "../config/constants";
import admin from "../config/firebase-config";
import RedisClient from "../config/redisClient";
import * as UserModels from "../models/users";
import * as workSpaceModels from "../models/workspace";

export async function signUp(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  try {
    let decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken) {
      let uid = decodedToken.uid;
      let email = decodedToken.email;
      let name;
      if (decodedToken.name) {
        name = decodedToken.name;
      } else {
        name = req.body.name;
      }

      const exisiting_user = await UserModels.findByEmail(email);
      if (exisiting_user) {
        const updateToken = await UserModels.updateAuthToken(
          token,
          email,
          name
        );
        // update token in redis
        await RedisClient.hSet("users", token.toString(), email);
        return res.success(updateToken);
      } else {
        try {
          let userData = await admin.auth().getUser(uid);
          let signinDataStore = await UserModels.signinData(
            token,
            userData.email,
            name
          );
          //add token in redis
          await RedisClient.hSet("users", token.toString(), email);
          return res.success(signinDataStore);
        } catch (e) {
          return res.error(500, e);
        }
      }
    }
  } catch (e) {
    return res.error(500, e);
  }
}

export async function login(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  try {
    let decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken) {
      let uid = decodedToken.uid;
      let email = decodedToken.email;
      const exisiting_user = await UserModels.findByEmail(email);
      if (exisiting_user) {
        const updateToken = await UserModels.updateAuthToken(
          token,
          email,
          decodedToken.name
        );
        // update token in redis
        await RedisClient.hSet("users", token.toString(), email);
        return res.success(updateToken);
      } else {
        try {
          let userData = await admin.auth().getUser(uid);

          let signinDataStore = await UserModels.signinData(
            token,
            userData.email,
            decodedToken.name
          );
          //add token in redis
          await RedisClient.hSet("users", token.toString(), email);
          return res.success(signinDataStore);
        } catch (e) {
          return res.error(500, e);
        }
      }
    }
  } catch (e) {
    return res.error(500, e);
  }
}

export async function logout(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await RedisClient.hDel("users", token);
    return res.success({
      logout: true,
    });
  } catch (e) {
    return res.error(500, e);
  }
}

// export async function completeProfile(req, res) {
//   try {
//     let data = await S3.uploadProfilePic(req.file, res.locals._id);
//     let isUpdated = await UserModels.completeProfile(
//       res.locals._id,
//       req.body.firstName,
//       req.body.lastName,
//       data.Location
//     );
//     return res.success(isUpdated);
//   } catch (e) {
//     return res.error(500, e);
//   }
// }

export async function getAllWorkspaceByUserId(req, res) {
  try {
    let id = req.params.id;
    if (id.toString() !== res.locals._id.toString()) {
      return res.accessDenied();
    }
    let allWorkspace = await workSpaceModels.getAllWorkspaceByUserId(id);
    return res.success(allWorkspace);
  } catch (e) {
    return res.error(500, e);
  }
}
