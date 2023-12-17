import { ObjectId } from "mongodb";
import mongoCollections from "../config/mongoCollections";
import constants from "../config/constants";
import { v4 as uuidv4 } from "uuid";
const workspace = mongoCollections.workspace;
import * as validation from "../services/validation";

export async function createWorkspaceModel(name, createdBy) {
  createdBy = await validation.id(String(createdBy));
  name = await validation.checkString(name, "name");
  const WorkspaceCollection = await workspace();

  let newWorkspace = {
    name: name,
    tasks: [],
    sharedFiles: [],
    members: [
      {
        id: ObjectId(createdBy),
        role: "owner",
        status: constants.status.user.ACTIVE,
      },
    ],
    createdDate: new Date(),
    createdBy: ObjectId(createdBy),
  };

  const newInsertInformation = await WorkspaceCollection.insertOne(
    newWorkspace
  );
  if (newInsertInformation.insertedCount === 0) throw "Insert failed!";
  return newWorkspace;
}

export async function getWorkspaceById(id) {
  id = await validation.id(id);
  const WorkspaceCollection = await workspace();
  const workspaceFound = await WorkspaceCollection.findOne({
    _id: ObjectId(id),
  });
  if (!workspaceFound) {
    throw "No workspace found by this id";
  }
  return workspaceFound;
}

export async function inviteToWorkspace(id, userId) {
  id = await validation.id(id);
  userId = await validation.id(String(userId));
  const WorkspaceCollection = await workspace();
  const workspaceFound = await WorkspaceCollection.findOne({
    _id: ObjectId(id),
  });
  if (!workspaceFound) {
    throw "No workspace found by this id";
  }
  for (let elem of workspaceFound.members) {
    if (
      elem.id.toString() === userId.toString() &&
      elem.status === constants.status.user.ACTIVE
    ) {
      throw "User Already Exist in this workspace";
    } else if (
      elem.id.toString() === userId.toString() &&
      elem.status === constants.status.user.INACTIVE
    ) {
      // ADD just token which user soft deleted
    }
  }
  let memberToAdd = {
    id: ObjectId(userId),
    role: "member",
    tempToken: uuidv4(),
    status: constants.status.user.INACTIVE,
  };
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $push: {
        members: memberToAdd,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return { workspaceName: workspaceFound.name, memberToAdd };
}

export async function verifyInvite(userId, token) {
  userId = await validation.id(String(userId));
  const WorkspaceCollection = await workspace();
  const workspaceFound = await WorkspaceCollection.findOne({
    "members.tempToken": token,
  });
  if (!workspaceFound) {
    throw "Invalid Token or Token has been expired";
  }
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: workspaceFound._id, "members.id": ObjectId(userId) },
    {
      $set: {
        "members.$.tempToken": undefined,
        "members.$.status": constants.status.user.ACTIVE,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return { verified: true };
}

export async function getAllWorkspaceByUserId(userId) {
  userId = await validation.id(String(userId));
  const WorkspaceCollection = await workspace();
  const workspaceFound = await WorkspaceCollection.find({
    $or: [
      { createdBy: ObjectId(userId) },
      {
        $and: [
          { "members.id": ObjectId(userId) },
          { "members.status": constants.status.user.ACTIVE },
        ],
      },
    ],
  })
    .sort({ createdDate: -1 })
    .toArray();
  return workspaceFound;
}

export async function deleteWorkspaceById(id) {
  id = await validation.id(id);
  const WorkspaceCollection = await workspace();
  let deleteData = await WorkspaceCollection.deleteOne({
    _id: ObjectId(id),
  });
  if (!deleteData.acknowledged && !deleteData.deleteCount)
    throw "Update failed";
  return {
    deleted: true,
  };
}

export async function createTask(id, task) {
  id = await validation.id(id);
  task = await validation.validateTask(task);
  const WorkspaceCollection = await workspace();
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $push: {
        tasks: task,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return {
    added: true,
  };
}

export async function updateWorkspaceName(id, name) {
  id = await validation.id(id);
  name = await validation.checkString(name, "name");
  const WorkspaceCollection = await workspace();
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $set: {
        name: name,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return {
    updated: true,
  };
}
export async function updateTask(id, taskId, taskToUpdate) {
  id = await validation.id(id);
  taskId = await validation.id(String(taskId));
  taskToUpdate = await validation.validateTask(taskToUpdate);
  const WorkspaceCollection = await workspace();
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id), "tasks._id": ObjectId(taskId) },
    {
      $set: {
        "tasks.$": taskToUpdate,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return {
    updated: true,
  };
}

export async function getTask(id, userId) {
  id = await validation.id(id);
  userId = await validation.id(userId);
  let allTask = [],
    myTask = [],
    completedTask = [],
    activeTask = [];
  const WorkspaceCollection = await workspace();
  const tasks = await WorkspaceCollection.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    { $unwind: "$tasks" },
    {
      $lookup: {
        from: "users",
        localField: "tasks.createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: "tasks.createdBy",
      },
    },
    {
      $project: {
        _id: 1,
        task: "$tasks",
      },
    },
  ]).toArray();

  if (tasks && tasks.length > 0) {
    for (let elem of tasks) {
      allTask.push(elem.task);
      if (elem.task.createdBy[0]._id.toString() === userId.toString()) {
        myTask.push(elem.task);
      }
      if (elem.task.status === constants.status.task.COMPLETED) {
        completedTask.push(elem.task);
      }
      if (elem.task.status === constants.status.task.INCOMPLETE) {
        activeTask.push(elem.task);
      }
    }
  }

  return {
    activeTask,
    myTask,
    completedTask,
    allTask,
  };
}

export async function markTask(id, taskId, status) {
  id = await validation.id(id);
  taskId = await validation.id(String(taskId));
  const WorkspaceCollection = await workspace();
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id), "tasks._id": ObjectId(taskId) },
    {
      $set: {
        "tasks.$.status": status,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return {
    updated: true,
  };
}

export async function deleteTask(id, taskId) {
  id = await validation.id(id);
  taskId = await validation.id(taskId);
  const WorkspaceCollection = await workspace();
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $pull: {
        tasks: { _id: ObjectId(taskId) },
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return {
    updated: true,
  };
}

export async function getTeam(id) {
  id = await validation.id(id);
  const WorkspaceCollection = await workspace();
  const members = await WorkspaceCollection.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    { $unwind: "$members" },
    {
      $lookup: {
        from: "users",
        localField: "members.id",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
        as: "members.id",
      },
    },
    {
      $project: {
        _id: 0,
        members: 1,
      },
    },
  ]).toArray();
  return members;
}

export async function uploadFile(id, fileUrl, fileName) {
  id = await validation.id(id);
  fileName = await validation.checkString(fileName, "filename");
  fileUrl = await validation.checkString(fileUrl, "fileUrl");

  let fileToAdd = {
    _id: ObjectId(),
    fileUrl,
    fileName,
    uploadedDate: new Date(),
  };
  const WorkspaceCollection = await workspace();
  const updateInfo = await WorkspaceCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $push: {
        sharedFiles: fileToAdd,
      },
    }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";
  return {
    updated: true,
  };
}
