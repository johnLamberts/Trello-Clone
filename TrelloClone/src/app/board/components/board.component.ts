import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { combineLatest, filter, map, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { ColumnsService } from 'src/app/shared/services/columns.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { TaskService } from 'src/app/shared/services/task.service';
import { BoardInterface } from 'src/app/shared/types/board.interface';
import { ColumnRequestInterface } from 'src/app/shared/types/columnRequest.interface';
import { ColumnInterface } from 'src/app/shared/types/columns.interface';
import { SocketEventEnum } from 'src/app/shared/types/socketEvents.enum';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { TaskRequestInterface } from 'src/app/shared/types/taskRequest.interface';
import { BoardService } from '../services/board.service';


@Component({
  selector: 'board',
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit, OnDestroy {
  boardId: string;
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>;

  unsubscribe$ = new Subject<void>();

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private taskService: TaskService
  ) {
    const boardId = this.route.snapshot.paramMap.get('boardId');

    if (!boardId) {
      throw new Error('Cant get the BoardId From the url');
    }

    this.boardId = boardId;
    // this.board$ = this.boardService.board$.pipe(filter(Boolean));
    // this.columns$ = this.boardService.columns$;
    this.data$ = combineLatest([
      this.boardService.board$.pipe(filter(Boolean)),
      this.boardService.columns$,
      this.boardService.task$,
    ]).pipe(
      map(([board, columns, tasks]) => ({
        board,
        columns,
        tasks,
      }))
    );
  }

  ngOnInit(): void {
    this.socketService.emit(SocketEventEnum.boardsJoin, {
      boardId: this.boardId,
    });
    this.fetchData();
    this.initializeListeners();
  }

  ngOnDestroy(): void {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
  }

  initializeListeners(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && !event.url.includes('/boards/')) {
        this.boardService.leaveBoard(this.boardId);
      }
    });

    this.socketService
      .listen<ColumnInterface>(SocketEventEnum.columnsCreateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((column) => {
        console.log(column);
        this.boardService.addColumn(column);
      });

    this.socketService
      .listen<string>(SocketEventEnum.columnsDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((columnId) => {
        console.log(columnId);
        this.boardService.deleteColumn(columnId);
      });

    this.socketService
      .listen<ColumnInterface>(SocketEventEnum.columnsUpdateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updatedColumn) => {
        this.boardService.updateColumn(updatedColumn);
      });

      this.socketService
      .listen<TaskInterface>(SocketEventEnum.tasksUpdateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updatedTask) => {
        this.boardService.updateTask(updatedTask);
      });

    this.socketService
      .listen<TaskInterface>(SocketEventEnum.tasksCreateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((task) => {
        console.log(task);
        this.boardService.addTasks(task);
      });

    this.socketService
      .listen<BoardInterface>(SocketEventEnum.boardsUpdateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updatedBoard) => {
        this.boardService.updateBoard(updatedBoard);
      });

    this.socketService
      .listen<void>(SocketEventEnum.boardsDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigateByUrl('/boards');
      });

      this.socketService
      .listen<string>(SocketEventEnum.tasksDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((taskId) => {
        this.boardService.deleteCoTask(taskId)
      });
  }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).pipe(takeUntil(this.unsubscribe$)).subscribe((board) => {
      this.boardService.setBoard(board);
    });

    this.columnsService.getColumns(this.boardId).pipe(takeUntil(this.unsubscribe$)).subscribe((columns) => {
      console.log(columns);
      this.boardService.setColumn(columns);
    });

    this.taskService.getTasks(this.boardId).pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
      console.log(task);
      this.boardService.setTasks(task);
    });
  }

  /* 
    test the socket io if its working!
  test(): void {
    this.socketService.emit(SocketEventEnum.columnsCreate, {
      boardId: this.boardId,
      title: 'asdadasd',
    });
  } */

  onCreateColumn(title: string): void {
    const columnInput: ColumnRequestInterface = {
      title,
      boardId: this.boardId,
    };
    this.columnsService.createColumn(columnInput);
  }

  getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] {
    return tasks.filter((task) => task.columnId === columnId);
  }

  createTask(title: string, columnId: string): void {
    const taskInput: TaskRequestInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };
    this.taskService.createTask(taskInput);
  }

  updateBoardName(boardName: string): void {
    this.boardsService.updateBoard(this.boardId, { title: boardName });
    console.log('workedz', boardName);
  }

  deleteBoard(): void {
    if (confirm('Are you sure you want to delete?')) {
      this.boardsService.deleteBoard(this.boardId);
    }
  }

  deleteColumn(columnId: string): void {
    this.columnsService.deleteColumn(this.boardId, columnId);
  }

  updateColumnName(columnName: string, columnId: string): void {
    this.columnsService.updateColumn(this.boardId, columnId, {
      title: columnName,
    });
  }

  openTask(taskId: string): void {
    this.router.navigate(['boards', this.boardId, 'tasks', taskId]);
  }
}
