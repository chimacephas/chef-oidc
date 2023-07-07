// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
// import { Observable } from 'rxjs';
// import { filter, switchMap, tap } from 'rxjs/operators';

// import { AuthService } from './auth.service';

// @Injectable({providedIn:'root'})
// export class AuthGuard implements CanActivate {
//   constructor(
//     private authService: AuthService,
//   ) { }

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot,
//   ): Observable<boolean> | Promise<boolean> | boolean{

//     if(this.authService.hasValidToken()){
//       return true;
//     }
//     this.authService.login(state.url);
//   }
// }
