import { jwtDecode } from 'jwt-decode';

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const exp = decoded.exp * 1000;

    return Date.now() < exp;
  } catch (error) {
    return false;
  }
}
