
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../auth/services/auth-guard.service';
import { InlineFormModule } from '../shared/modules/inline-form.module';
import { TopbarModule } from '../shared/modules/topbar.module';
import { BoardsService } from '../shared/services/boards.service';
import { BoardsComponent } from './components/boards.component';


const routes: Routes = [
    {path: 'boards', component: BoardsComponent, canActivate: [AuthGuardService]}
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), InlineFormModule, TopbarModule],
    declarations: [BoardsComponent],
    providers: [BoardsService]
})
export class BoardsModule {}
