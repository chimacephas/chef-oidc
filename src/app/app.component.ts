import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chef-oidc';
  isLoading:boolean = false;

  constructor(private authService:AuthService, router:Router){

       this.authService.isDoneLoading$.subscribe(x=>{
          this.isLoading = x;
       });


       this.authService.runInitialLoginSequence();


  }

  public login($event:any) {
    $event.preventDefault();
    this.authService.login();
  }
  public logout() { this.authService.logout(); }

  public refresh() { this.authService.refresh(); }
}
