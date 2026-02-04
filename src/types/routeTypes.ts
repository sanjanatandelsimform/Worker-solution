/**
 * Route access level types
 */
export enum RouteAccess {
  PUBLIC = "PUBLIC",
  PROTECTED = "PROTECTED",
  UNRESTRICTED = "UNRESTRICTED",
}

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string;
  access: RouteAccess;
  element: React.ComponentType;
  redirectWhenAuthenticated?: string;
  redirectWhenUnauthenticated?: string;
}
