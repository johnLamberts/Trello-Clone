import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BoardInterface } from "../types/board.interface";
import { SocketEventEnum } from "../types/socketEvents.enum";
import { SocketService } from "./socket.service";

@Injectable()

export class BoardsService {

    boardsURL = environment.apiURL
    constructor(private http: HttpClient, 
        private socketService: SocketService
        ) {}

    getBoards(): Observable<BoardInterface[]> {
        return this.http.get<BoardInterface[]>(`${this.boardsURL}boards`);
    }

    getBoard(boardId: string): Observable<BoardInterface> {
        return this.http.get<BoardInterface>(`${this.boardsURL}boards/${boardId}`);
    }

    createBoard(title: string): Observable<BoardInterface> {
        return this.http.post<BoardInterface>(`${this.boardsURL}boards`, {title})
    }

    updateBoard(boardId: string, fields: {title: string}): void {
        this.socketService.emit(SocketEventEnum.boardsUpdate, { boardId, fields });
    }
    
    deleteBoard(boardId: string): void {
        this.socketService.emit(SocketEventEnum.boardsDelete, { boardId });
    }
}