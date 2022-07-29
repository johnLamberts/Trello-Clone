import { Component, HostBinding, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { SocketService } from 'src/app/shared/services/socket.service';
import { TaskService } from 'src/app/shared/services/task.service';
import { ColumnInterface } from 'src/app/shared/types/columns.interface';
import { SocketEventEnum } from 'src/app/shared/types/socketEvents.enum';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'task-modal',
  templateUrl: './task-modal.component.html',
})
export class TaskModalComponent implements OnDestroy {
  @HostBinding('class') classes = 'task-modal';

  boardId: string;
  taskId: string;
  task$: Observable<TaskInterface>;
  data$: Observable<{ task: TaskInterface; columns: ColumnInterface[] }>;

  columnForm: FormGroup = this.fb.group({
    columnId: [null],
  });

  unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private boardService: BoardService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private socketService: SocketService
  ) {
    const taskId = this.route.snapshot.paramMap.get('taskId');
    const boardId = this.route.parent?.snapshot.paramMap.get('boardId');

    if (!boardId) {
      throw new Error("Can't get boardID from URL");
    }

    if (!taskId) {
      throw new Error("Can't get taskId from URL");
    }

    this.taskId = taskId;
    this.boardId = boardId;
    this.task$ = this.boardService.task$.pipe(
      map((tasks) => {
        return tasks.find((task) => task.id === this.taskId);
      }),
      filter(Boolean)
    );

    this.data$ = combineLatest([this.task$, this.boardService.columns$]).pipe(
      map(([task, columns]) => ({
        task,
        columns,
      }))
    );

    this.task$.pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
      this.columnForm.patchValue({ columnId: task.columnId });
    });

    combineLatest([this.task$, this.columnForm.get('columnId')!.valueChanges])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([task, columnId]) => {
        console.log('changed column id', columnId, task.columnId);

        if (task.columnId === columnId) {
          this.taskService.updateTask(this.boardId, task.id, { columnId });
        }
      });

    this.socketService
      .listen<string>(SocketEventEnum.tasksDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.goToBoard();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  goToBoard(): void {
    this.router.navigate(['boards', this.boardId]);
  }

  updateTaskName(taskName: string): void {
    console.log('updateTaskname', taskName);
    this.taskService.updateTask(this.boardId, this.taskId, { title: taskName });
  }

  updateTaskDesc(taskDesc: string): void {
    console.log('taskDesc', taskDesc);
    this.taskService.updateTask(this.boardId, this.taskId, {
      description: taskDesc,
    });
  }

  deleteTask(): void {
    this.taskService.deleteTask(this.boardId, this.taskId);
  }
}
