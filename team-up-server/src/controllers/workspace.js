import * as workSpaceModels from "../models/workspace";
import * as UserModels from "../models/users";
import { sendMail } from "../services/mailer";
import { ObjectId } from "mongodb";
import * as S3 from "../services/s3";
import constants from "../config/constants";
import moment from "moment";

export async function createWorkspace(req, res) {
  try {
    let insertedWorkspace = await workSpaceModels.createWorkspaceModel(
      req.body.name,
      res.locals._id
    );
    return res.success(insertedWorkspace);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function sendInvite(req, res) {
  try {
    let email = req.body.email;
    let workspaceId = req.params.id;
    let userId,
      userName = "There";
    let isUser = await UserModels.findByEmail(email);
    if (!isUser) {
      //create
      let createdInviteUser = await UserModels.createInviteUser(email);
      userId = createdInviteUser._id;
    } else {
      userId = isUser._id;
      userName = isUser.name;
    }
    try {
      // find in workspace if find send send token again else create

      let workspace = await workSpaceModels.getWorkspaceById(workspaceId);
      if (!workspace) {
        throw "workspace not found by this id";
      }
      const found = workspace.members.find(
        (element) => element.id.toString() === userId.toString()
      );
      let addToWorkspace;
      if (!found) {
        addToWorkspace = await workSpaceModels.inviteToWorkspace(
          workspaceId,
          userId
        );
      } else {
        if (
          found.tempToken === null ||
          found.status === constants.status.user.ACTIVE
        ) {
          return res.error(400, "User Already Present In Workspace");
        }
        addToWorkspace = {
          workspaceName: workspace.name,
          memberToAdd: found,
        };
      }

      //send email Here
      sendMail(
        "invite",
        email,
        `${res.locals.name} invited to workspace ${addToWorkspace.workspaceName}`,
        {
          name: `${res.locals.name}`,
          userName: userName,
          workspaceName: addToWorkspace.workspaceName,
          url: `${process.env.INVITE_BASE_URL}/workspace/invite/${userId}/${addToWorkspace.memberToAdd.tempToken}`,
        }
      );
      return res.success({
        send: true,
      });
    } catch (e) {
      return res.error(400, e);
    }
  } catch (e) {
    return res.error(500, e);
  }
}

export async function verifyInvite(req, res) {
  try {
    let userId = req.params.userId;
    let token = req.params.token;
    try {
      let verified = await workSpaceModels.verifyInvite(userId, token);

      return res.sendFile(process.cwd() + "/src/views/verify.html");
    } catch (e) {
      return res.sendFile(process.cwd() + "/src/views/unverified.html");
    }
  } catch (e) {
    return res.error(500, e);
  }
}
export async function deleteWorkspace(req, res) {
  try {
    let id = req.params.id;
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "No Work Space Found with this id");
    }
    if (workspace.createdBy.toString() !== res.locals._id.toString()) {
      return res.unauthorizedUser();
    }
    let deleted = await workSpaceModels.deleteWorkspaceById(id);
    return res.success(deleted);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function getWorkspaceById(req, res) {
  try {
    let id = req.params.id;
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "No Work Space Found with this id");
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === res.locals._id.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }
    return res.success(workspace);
  } catch (e) {
    return res.error(404, e);
  }
}

export async function createTask(req, res) {
  try {
    let id = req.params.id;
    let userId = res.locals._id.toString();
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      throw "workspace not found by this id";
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === userId.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }
    let body = req.body;
    if (!body.title || body.title.length === 0)
      return res.error(400, "Title cannot be empty");
    if (!body.description || body.description.length === 0)
      return res.error(400, "Description cannot be empty");
    if (!body.startDate || body.startDate.length === 0)
      return res.error(400, "Start Date cannot be empty");
    if (!body.endDate || body.endDate.length === 0)
      return res.error(400, "End Date cannot be empty");
    let taskToInsert = {
      _id: new ObjectId(),
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      status: constants.status.task.INCOMPLETE,
      createdBy: ObjectId(userId),
      createdDate: new Date(),
      completedBy: undefined,
    };
    let createdTask = await workSpaceModels.createTask(id, taskToInsert);
    return res.success(createdTask);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function changeWorkSpaceName(req, res) {
  try {
    let id = req.params.id;
    let name = req.body.name;
    let workspace = await workSpaceModels.getWorkspaceById(id);
    try {
      if (!workspace) {
        throw "workspace not found by this id";
      }
      if (workspace.createdBy.toString() !== res.locals._id.toString()) {
        return res.unauthorizedUser();
      }
      let isUpdated = await workSpaceModels.updateWorkspaceName(id, name);
      return res.success(isUpdated);
    } catch (e) {
      return res, error(400, e);
    }
  } catch (e) {
    return res.error(500, e);
  }
}

export async function updateTask(req, res) {
  try {
    let id = req.params.id;
    let userId = res.locals._id.toString();
    let taskId = req.params.taskId;
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "workspace not found by this id");
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === userId.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }
    const getTask = workspace.tasks.find(
      (element) => element._id.toString() === taskId.toString()
    );
    if (!getTask) {
      return res.error(404, "Task not found by this id");
    }
    let body = req.body;
    if (!body.title || body.title.length === 0)
      return res.error(400, "Title cannot be empty");
    if (!body.description || body.description.length === 0)
      return res.error(400, "Description cannot be empty");
    if (!body.startDate || body.startDate.length === 0)
      return res.error(400, "Start Date cannot be empty");
    if (!body.endDate || body.endDate.length === 0)
      return res.error(400, "End Date cannot be empty");
    let taskToUpdate = {
      _id: ObjectId(taskId),
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      status: getTask.status,
      createdBy: getTask.createdBy,
      createdDate: getTask.createdDate,
      completedBy: getTask.completedBy,
    };
    let createdTask = await workSpaceModels.updateTask(
      id,
      taskId,
      taskToUpdate
    );
    return res.success(createdTask);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function getALLTask(req, res) {
  try {
    let id = req.params.id;
    let userId = res.locals._id.toString();
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "workspace not found by this id");
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === userId.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }

    let tasks = await workSpaceModels.getTask(id, userId);
    return res.success(tasks);
  } catch (e) {
    return res.error(404, e);
  }
}

export async function getTaskById(req, res) {
  try {
    let id = req.params.id;
    let taskId = req.params.taskId;
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "workspace not found by this id");
    }
    const task = workspace.tasks.find(
      (element) => element._id.toString() === taskId.toString()
    );
    if (!task) {
      return res.error(404, "Task Not found");
    }

    return res.success(task);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function markTask(req, res) {
  try {
    let isCompleted = req.body.isCompleted;
    let id = req.params.id;
    let taskId = req.params.taskId;
    let status = constants.status.task.INCOMPLETE;
    if (isCompleted) {
      status = constants.status.task.COMPLETED;
    }
    let updated = await workSpaceModels.markTask(id, taskId, status);
    if (status === constants.status.task.COMPLETED) {
      let workspace = await workSpaceModels.getWorkspaceById(id);
      if (!workspace) {
        return res.error(404, "workspace not found by this id");
      }
      const task = workspace.tasks.find(
        (element) => element._id.toString() === taskId.toString()
      );
      if (!task) {
        return res.error(404, "Task Not found");
      }
      let user = await UserModels.findById(task.createdBy);
      let mailerData = {
        tName: user.name,
        title: task.title,
        cName: res.locals.name,
        wName: workspace.name,
      };
      sendMail("task-complete", user.email, "Task Completed", mailerData);
    }
    return res.success(updated);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function deleteTask(req, res) {
  try {
    let id = req.params.id;
    let taskId = req.params.taskId;
    let deleted = await workSpaceModels.deleteTask(id, taskId);
    return res.success(deleted);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function getTeam(req, res) {
  try {
    let id = req.params.id;
    let userId = res.locals._id.toString();
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "workspace not found by this id");
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === userId.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }
    let getTeam = await workSpaceModels.getTeam(id);
    return res.success(getTeam);
  } catch (e) {
    return res.error(404, e);
  }
}

export async function uploadFile(req, res) {
  try {
    let id = req.params.id;
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(400, "workspace not found by this id");
    }
    let originalname = req.file.originalname;
    let data = await S3.uploadFile(req.file, id);
    let isUpdated = await workSpaceModels.uploadFile(
      id,
      data.Location,
      originalname
    );
    return res.success(isUpdated);
  } catch (e) {
    return res.error(500, e);
  }
}

export async function getFiles(req, res) {
  try {
    let id = req.params.id;
    let userId = res.locals._id.toString();
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "workspace not found by this id");
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === userId.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }
    return res.success(workspace.sharedFiles);
  } catch (e) {
    return res.error(404, e);
  }
}

export async function sendMeetingLink(req, res) {
  try {
    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let startDate = req.body.startDate;
    let userId = res.locals._id.toString();
    let workspace = await workSpaceModels.getWorkspaceById(id);
    if (!workspace) {
      return res.error(404, "workspace not found by this id");
    }
    const found = workspace.members.find(
      (element) => element.id.toString() === userId.toString()
    );
    if (!found) {
      return res.unauthorizedUser();
    }
    let getTeam = await workSpaceModels.getTeam(id);
    let emails = "";
    if (getTeam.length > 0) {
      getTeam.forEach((element) => {
        if (element.members.status === constants.status.user.ACTIVE) {
          emails = emails + element.members.id[0].email + ",";
        }
      });
    }
    sendMail("send-schedule", emails, title, {
      name: res.locals.name,
      workspaceName: workspace.name,
      description,
      startDate: moment(startDate).format("MMMM Do YYYY, h:mm:ss a"),
    });
    return res.success({ send: true });
  } catch (e) {
    return res.error(500, e);
  }
}
