import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { SocketService } from 'src/app/shared/services/socket.service';
import { environment } from 'src/environments/environment';
import { CurrentUserInterface } from '../types/currentUser.interface';
import { LoginRequestInterface } from '../types/loginRequest.interface';
import { RegisterRequestInterface } from '../types/registerRequest.interface';
@Injectable()
export class AuthService {
  currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(
    undefined
  );

  isLoggedin$ = this.currentUser$.pipe(filter(currentUser => currentUser !== undefined),
  map(Boolean));

  currentUserURL = environment.apiURL;

  constructor(
    private http: HttpClient,
    private socketService: SocketService) {}

  getCurrentUser(): Observable<CurrentUserInterface> {
    return this.http.get<CurrentUserInterface>(`${this.currentUserURL}user`);
  }



  registerUser(
    registerRequest: RegisterRequestInterface
  ): Observable<CurrentUserInterface> {
    return this.http.post<CurrentUserInterface>(
      `${this.currentUserURL}users`,
      registerRequest
    );
  }

  loginUser(
    loginRequest: LoginRequestInterface
  ): Observable<CurrentUserInterface> {
    return this.http.post<CurrentUserInterface>(
      `${this.currentUserURL}users/login`,
      loginRequest
    );
  }

  setToken(currentUser: CurrentUserInterface): void {
    localStorage.setItem('token', currentUser.token);
  }

  setCurrentUser(currentUser: CurrentUserInterface | null): void {
    this.currentUser$.next(currentUser);
  }

  logout(): void {
    localStorage.removeItem('token');  
    this.currentUser$.next(null);
    this.socketService.disconnect();
  }
}
