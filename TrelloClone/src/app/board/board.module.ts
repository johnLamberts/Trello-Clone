import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth/services/auth-guard.service';
import { InlineFormModule } from '../shared/modules/inline-form.module';
import { TopbarModule } from '../shared/modules/topbar.module';
import { ColumnsService } from '../shared/services/columns.service';
import { TaskService } from '../shared/services/task.service';
import { BoardComponent } from './components/board.component';
import { TaskModalComponent } from './components/task-modal/task-modal.component';
import { BoardService } from './services/board.service';

const routes: Routes = [
  {
    path: 'boards/:boardId',
    component: BoardComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'tasks/:taskId',
        component: TaskModalComponent
      }
    ]
  },
];

@NgModule({
  declarations: [BoardComponent, TaskModalComponent], //geneated component
  imports: [CommonModule, RouterModule.forChild(routes), TopbarModule, InlineFormModule, ReactiveFormsModule], // module
  exports: [], //to exports component to reuse in other way
  providers: [BoardService, ColumnsService, TaskService], //inject services
})
export class BoardModule {}
