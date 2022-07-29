import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnRequestInterface } from '../types/columnRequest.interface';
import { ColumnInterface } from '../types/columns.interface';
import { SocketEventEnum } from '../types/socketEvents.enum';
import { TaskInterface } from '../types/task.interface';
import { TaskRequestInterface } from '../types/taskRequest.interface';
import { SocketService } from './socket.service';

@Injectable()
export class TaskService {
  tasksUrl = environment.apiURL;
  constructor(private http: HttpClient, private socketService: SocketService) {}

  getTasks(boardId: string): Observable<TaskInterface[]> {
    return this.http.get<TaskInterface[]>(
      `${this.tasksUrl}boards/${boardId}/tasks`
    );
  }

  createTask(taskInput: TaskRequestInterface): void {
    this.socketService.emit(SocketEventEnum.tasksCreate, taskInput);
  }

  updateTask(
    boardId: string,
    taskId: string,
    fields: { title?: string; description?: string; columnId?: string }
  ): void {
    this.socketService.emit(SocketEventEnum.tasksUpdate, {
      boardId,
      taskId,
      fields,
    });
  }

  deleteTask(boardId: string, taskId: string): void {
    this.socketService.emit(SocketEventEnum.tasksDelete, { boardId, taskId });
  }
}
