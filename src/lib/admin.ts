export const ADMIN_EMAIL = "bezzo19@gmx.de";

export function isAdmin(email: string | undefined | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
