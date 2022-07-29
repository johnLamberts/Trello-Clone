import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "./types/socketUser.interface";
import * as usersController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import * as columnsController from "./controllers/columns";
import * as tasksController from "./controllers/task";
import bodyParser from "body-parser";
import authMiddleware from "./middlewares/auth";
import cors from "cors";
import { SocketEventEnum } from "./types/socketEvents.enum";
import { secretPrivateKey } from "./config";
import User from "./models/user";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id;
  },
});

app.get("/", (req, res) => {
  res.send("Plain api is now starting!");
});

app.post("/api/users", usersController.register);
app.post("/api/users/login", usersController.login);
app.get("/api/user", authMiddleware, usersController.currrentUser);

app.get("/api/boards", authMiddleware, boardsController.getBoards);
app.get("/api/boards/:boardId", authMiddleware, boardsController.getBoard);

app.get(
  "/api/boards/:boardId/columns",
  authMiddleware,
  columnsController.getColumns
);
app.post("/api/boards", authMiddleware, boardsController.createBoards);

app.get("/api/boards/:boardId/tasks", authMiddleware, tasksController.getTasks);

io.use(async (socket: Socket, next) => {
  try {
    const token = (socket.handshake.auth.token as string) ?? "";
    const data = jwt.verify(token.split(" ")[1], secretPrivateKey) as {
      id: string;
      email: string;
    };
    const user = await User.findById(data.id);

    if (!user) {
      return next(new Error("Authentication Error!"));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication Error!"));
  }
}).on("connection", (socket) => {
  socket.on(SocketEventEnum.boardsJoin, (data) => {
    boardsController.joinBoard(io, socket, data);
  });
  socket.on(SocketEventEnum.boardsLeave, (data) => {
    boardsController.leaveBoard(io, socket, data);
  });
  socket.on(SocketEventEnum.columnsCreate, (data) => {
    columnsController.createColumn(io, socket, data);
  });
  socket.on(SocketEventEnum.taskCreate, (data) => {
    tasksController.createTask(io, socket, data);
  });

  //boards update
  socket.on(SocketEventEnum.boardsUpdate, (data) => {
    boardsController.updateBoard(io, socket, data);
  });

  //delete boards
  socket.on(SocketEventEnum.boardsDelete, (data) => {
    boardsController.deleteBoard(io, socket, data);
  });

  //delete column
  socket.on(SocketEventEnum.columnsDelete, (data) => {
    columnsController.deleteColumn(io, socket, data);
  });

  //update columns
  socket.on(SocketEventEnum.columnsUpdate, (data) => {
    columnsController.updateColumn(io, socket, data);
  });

  //task update
  socket.on(SocketEventEnum.tasksUpdate, (data) => {
    tasksController.updateTask(io, socket, data);
  });
  
  //task delete
  socket.on(SocketEventEnum.tasksDelete, (data) => {
    tasksController.deleteTask(io, socket, data);
  });
});

mongoose
  .connect(
    "mongodb+srv://john:muted@cluster0.9oggk.mongodb.net/Trello?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to Mongodb");

    httpServer.listen(4001, () => {
      console.log(`API is listening on port 4001`);
    });
  });
