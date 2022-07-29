import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from 'src/app/shared/services/socket.service';
import { BoardInterface } from 'src/app/shared/types/board.interface';
import { ColumnInterface } from 'src/app/shared/types/columns.interface';
import { SocketEventEnum } from 'src/app/shared/types/socketEvents.enum';
import { TaskInterface } from 'src/app/shared/types/task.interface';

@Injectable()
export class BoardService {
  board$ = new BehaviorSubject<BoardInterface | null>(null);
  columns$ = new BehaviorSubject<ColumnInterface[]>([]);
  task$ = new BehaviorSubject<TaskInterface[]>([]);

  constructor(private socketService: SocketService) {}
  setBoard(board: BoardInterface): void {
    this.board$.next(board);
  }

  leaveBoard(boardId: string): void {
    this.board$.next(null);
    this.socketService.emit(SocketEventEnum.boardsLeave, { boardId });
  }

  setColumn(columns: ColumnInterface[]): void {
    this.columns$.next(columns);
  }

  addColumn(column: ColumnInterface): void {
    const updatedColumns = [...this.columns$.getValue(), column];
    this.columns$.next(updatedColumns);
  }

  setTasks(tasks: TaskInterface[]): void {
    this.task$.next(tasks);
  }

  addTasks(task: TaskInterface): void {
    const updatedTaks = [...this.task$.getValue(), task];
    this.task$.next(updatedTaks);
  }

  updateBoard(boardName: BoardInterface): void {
    const board = this.board$.getValue();
    if (!board) {
      throw new Error('Board is not initialized!');
    }
    this.board$.next({ ...board, title: boardName.title });
  }

  deleteColumn(columnId: string): void {
    const updatedColumns = this.columns$
      .getValue()
      .filter((column) => column.id !== columnId);

    this.columns$.next(updatedColumns);
  }

  deleteCoTask(taskId: string): void {
    const updatedTask = this.task$
      .getValue()
      .filter((task) => task.id !== taskId);
    this.task$.next(updatedTask);
  }

  updateColumn(updatedColumn: ColumnInterface): void {
    const updatedColumns = this.columns$.getValue().map((column) => {
      if (column.id === updatedColumn.id) {
        return {
          ...column,
          title: updatedColumn.title,
        };
      }
      return column;
    });
    this.columns$.next(updatedColumns);
  }

  updateTask(updatedTask: TaskInterface): void {
    const updatedTasks = this.task$.getValue().map((task) => {
      if (task.id === updatedTask.id) {
        return {
          ...task,
          title: updatedTask.title,
          description: updatedTask.description,
          columnId: updatedTask.columnId,
        };
      }
      return task;
    });
    this.task$.next(updatedTasks);
  }
}
