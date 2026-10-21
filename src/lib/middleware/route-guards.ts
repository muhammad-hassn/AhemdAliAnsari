export interface RouteGuard {
  prefix: string;
  roles: string[];
}

export const ROUTE_GUARDS: RouteGuard[] = [
  { prefix: "/account", roles: ["customer", "editor", "admin"] },
  { prefix: "/admin", roles: ["editor", "admin"] },
];

