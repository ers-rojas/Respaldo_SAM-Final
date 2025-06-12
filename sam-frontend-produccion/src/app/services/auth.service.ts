import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/logout`, {});
  }

  // ✅ Método que permite registrar un nuevo usuario
  register(data: {
    name: string;
    institucion?: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, data);
  }
}
