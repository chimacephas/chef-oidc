import {  AuthConfig } from "angular-oauth2-oidc";
import { environment } from "src/environments/environment";

 export const authConfig: AuthConfig = {
  issuer: environment.issuerUrl,
  clientId: 'ChefSpice', // The "Auth Code + PKCE" client
  responseType: 'code',
  logoutUrl:environment.issuerUrl + '/Identity/Account/Logout',
  requireHttps: false,
  // redirectUri: window.location.origin,
  // silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
   redirectUri: environment.clientUri,
  silentRefreshRedirectUri: environment.clientUri + '/silent-refresh.html',
  scope: 'openid profile email chefspice id permissions', // Ask offline_access to support refresh token refreshes
  useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes
  //silentRefreshTimeout: 5000, // For faster testing
  //timeoutFactor: 0.25, // For faster testing
  sessionChecksEnabled: true,
  showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
  clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
  nonceStateSeparator : 'semicolon', // Real semicolon gets mangled by IdentityServer's URI encoding
  //openUri: () => 'https://localhost:5002/Identity/Account/Login/'
};

// export const authConfig: AuthConfig = {
//   issuer: 'https://demo.identityserver.io',
//   clientId: 'interactive.public', // The "Auth Code + PKCE" client
//   responseType: 'code',
//   redirectUri: window.location.origin + '/index.html',
//   silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
//   scope: 'openid profile email api', // Ask offline_access to support refresh token refreshes
//   useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes
//   silentRefreshTimeout: 5000, // For faster testing
//   timeoutFactor: 0.25, // For faster testing
//   sessionChecksEnabled: true,
//   showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
//   clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
//   nonceStateSeparator : 'semicolon' // Real semicolon gets mangled by IdentityServer's URI encoding
// };
