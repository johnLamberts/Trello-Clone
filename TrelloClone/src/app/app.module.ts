import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';



import { AuthModule } from './auth/auth.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeModule } from './home/home.module';
import { AuthInterceptor } from './auth/services/auth.interceptor';
import { BoardsModule } from './boards/boards.module';
import { BoardModule } from './board/board.module';
import { SocketService } from './shared/services/socket.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    HttpClientModule,
    
    HomeModule,
    AuthModule,
    BoardsModule,
    BoardModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  SocketService
],
  bootstrap: [AppComponent]
})
export class AppModule { }
