import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
    UserLoggedSubscription: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router) {}
    
    ngOnInit(): void {
        this.UserLoggedSubscription = this.authService.isLoggedin$.subscribe(isLoggedIn => {
            if(isLoggedIn) {
                this.router.navigateByUrl('/boards')
            }
        })
    }

    ngOnDestroy(): void {
        this.UserLoggedSubscription.unsubscribe();
    }
}
