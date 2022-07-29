import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { SocketService } from './shared/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private socketService: SocketService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        this.socketService.setupSocketConnection(currentUser)
        this.authService.setCurrentUser(currentUser);
      },
      error: (err) => {
        console.log('err', err);
        this.authService.setCurrentUser(null);
      },
    });

    // check me if the user logged in or not 
    // this.authService.currentUser$.subscribe(res => {
    //   console.log('res', res)
    // });

    // this.authService.isLoggedin$.subscribe(isLoggedIn => {
    //   console.log(`isLoggedin: ${isLoggedIn}`);
    // })

  }
}
