import { NextFunction, Response } from "express";
import BoardModel from "../models/boards";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socketUser.interface";
import { SocketEventEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helper";
import boards from "../models/boards";
export const getBoards = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const boards = await BoardModel.find({ userId: req.user.id });
    res.send(boards);
  } catch (err) {
    next(err);
  }
};

export const createBoards = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const newBoard = new BoardModel({
      title: req.body.title,
      userId: req.user.id,
    });

    const savedBoard = await newBoard.save();
    res.send(savedBoard);
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const boardId = await BoardModel.findById(req.params.boardId);
    res.send(boardId);
  } catch (err) {
    next(err);
  }
};

export const joinBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  console.log("sever socket io join", socket.user);
  socket.join(data.boardId);
};

export const leaveBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  console.log("sever socket io leave", data.boardId);
  socket.leave(data.boardId);
};

export const updateBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; fields: { tile: string } }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventEnum.boardsUpdateFailure,
        "User is not authorized"
      );
        return;
    }
      const updatedBoard = await BoardModel.findByIdAndUpdate(
        data.boardId,
        data.fields,
        { new: true }
      );
      io.to(data.boardId).emit(
        SocketEventEnum.boardsUpdateSuccess,
        updatedBoard
      );
  } catch (err) {
    socket.emit(SocketEventEnum.boardsUpdateFailure, getErrorMessage(err));
  }
};

export const deleteBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; }
) => {
  try {
    if (!socket.user) {
      socket.emit(
        SocketEventEnum.boardsDeleteFailure,
        "User is not authorized"
      );
        return;
    }
      await BoardModel.deleteOne({_id: data.boardId});
      io.to(data.boardId).emit(
        SocketEventEnum.boardsDeleteSuccess);
  } catch (err) {
    socket.emit(SocketEventEnum.boardsDeleteFailure, getErrorMessage(err));
  }
};