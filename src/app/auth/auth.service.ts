import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { JwksValidationHandler, OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { authConfig } from './auth-config';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

  /**
   * Publishes `true` if and only if (a) all the asynchronous initial
   * login calls have completed or errorred, and (b) the user ended up
   * being authenticated.
   *
   * In essence, it combines:
   *
   * - the latest known state of whether the user is authorized
   * - whether the ajax calls for initial log in have all been done
   */
  public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$
  ]).pipe(map(values => values.every(b => b)));

  // private navigateToLoginPage() {
  //   this.router.navigateByUrl('/should-login');
  // }

  constructor(
    private oauthService: OAuthService,
    private router: Router
  )
  {
    // Useful for debugging:
    //Remove on prod
    this.oauthService.events.subscribe(event => {
      if (event instanceof OAuthErrorEvent) {
        //console.error('OAuthErrorEvent Object:', event);
      } else {
        //console.warn('OAuthEvent Object:', event);
      }
    });

    // This is tricky, as it might cause race conditions (where access_token is set in another
    // tab before everything is said and done there.
    // TODO: Improve this setup. See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2

     window.addEventListener('storage', (event) => {
      // The `key` is `null` if the event was caused by `.clear()`

      if (event.key !== 'access_token' && event.key !== null) {
        return;
      }
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

      // if (!this.oauthService.hasValidAccessToken()) {
      //   this.navigateToLoginPage();
      // }
      }

    );


    this.oauthService.events
      .subscribe(_ => {
        this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
      });

    this.oauthService.events
      .pipe(filter(e => ['token_received'].includes(e.type)))
      .subscribe(e => this.oauthService.loadUserProfile());

    // this.oauthService.events
    //   .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
    //   .subscribe(e => this.navigateToLoginPage());

    this.oauthService.setupAutomaticSilentRefresh();
  }

  public runInitialLoginSequence(): Promise<void> {
    if (location.hash) {
      console.table(location.hash.substr(1).split('&').map(kvp => kvp.split('=')));
    }
   this.oauthService.configure(authConfig);
    // 0. LOAD CONFIG:
    // First we have to check to see how the IdServer is
    // currently configured:
     //return this.oauthService.loadDiscoveryDocument('https://localhost:5002/Identity/Account/Login')
    return this.oauthService.loadDiscoveryDocument()
      // 1. HASH LOGIN:
      // Try to log in via hash fragment after redirect back
      // from IdServer from initImplicitFlow:
      .then(() => this.oauthService.tryLogin())

      .then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          //return Promise.resolve();
        }
        // 2. SILENT LOGIN:
        // Try to log in via a refresh because then we can prevent
        // needing to redirect the user:
        // return this.oauthService.silentRefresh()
        //   .then(() => {  console.log("3");Promise.resolve()})
        //   .catch(result => {
        //       console.log("4");
        //     // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
        //     // Only the ones where it's reasonably sure that sending the
        //     // user to the IdServer will help.
        //     const errorResponsesRequiringUserInteraction = [
        //       'interaction_required',
        //       'login_required',
        //       'account_selection_required',
        //       'consent_required',
        //     ];

        //     if (result
        //       && result.reason
        //       && errorResponsesRequiringUserInteraction.indexOf(result.reason.error) >= 0) {

        //       // 3. ASK FOR LOGIN:
        //       // At this point we know for sure that we have to ask the
        //       // user to log in, so we redirect them to the IdServer to
        //       // enter credentials.
        //       //
        //       // Enable this to ALWAYS force a user to login.
        //       // this.login();
        //       //
        //       // Instead, we'll now do this:
        //       console.warn('User interaction is needed to log in, we will wait for the user to manually log in.');
        //       return Promise.resolve();
        //     }

        //     // We can't handle the truth, just pass on the problem to the
        //     // next handler.
        //     return Promise.reject(result);
        //   });
      })

      .then(() => {
        this.isDoneLoadingSubject$.next(true);

        // Check for the strings 'undefined' and 'null' just to be sure. Our current
        // login(...) should never have this, but in case someone ever calls
        // initImplicitFlow(undefined | null) this could happen.
        if (this.oauthService.state && this.oauthService.state !== 'undefined' && this.oauthService.state !== 'null') {
          let stateUrl = this.oauthService.state;
          if (stateUrl.startsWith('/') === false) {
            stateUrl = decodeURIComponent(stateUrl);
          }
          this.router.navigateByUrl(stateUrl);
        }
      })
      .catch((e) => { console.log(e);this.isDoneLoadingSubject$.next(true)});
  }

  public login(targetUrl?: string) {
    this.oauthService.initLoginFlow(targetUrl || this.router.url);
  }

  public logout() { this.oauthService.logOut(); }

  public refresh() { this.oauthService.silentRefresh(); }
  public hasValidToken() { return this.oauthService.hasValidAccessToken(); }

   getRole(){
      if(this.oauthService.hasValidAccessToken()){
           return this.oauthService.getIdentityClaims()['role'];
     }
     this.login();
  }

   getUserId(){
     if(this.oauthService.hasValidAccessToken()){
       return this.oauthService.getIdentityClaims()['id'];
     }
     this.login();
  }
}
