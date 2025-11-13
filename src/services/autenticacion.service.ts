// src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// Asegúrate que esta ruta sea correcta
import { RespuestaLogin } from '../components/interfaces/respuesta-login'; 


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = 'http://localhost:3000/api/auth';
  private usuarioActualSubject = new BehaviorSubject<RespuestaLogin | null>(null);

  usuarioActual = this.usuarioActualSubject.asObservable();

  constructor(private http: HttpClient) {
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      this.usuarioActualSubject.next(JSON.parse(guardado));
    }
  }

  registrar(datos: { usuario: string; contrasena: string; rol: string }): Observable<any> {
    return this.http.post(`${this.URL}/registro`, datos);
  }

  login(usuario: string, contrasena: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.URL}/login`, { usuario, contrasena })
    .pipe(
      tap(res => {
        localStorage.setItem('usuario', JSON.stringify(res)); // guardo toda la respuesta del login
        localStorage.setItem('token', res.token);           // token aparte
        this.usuarioActualSubject.next(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.usuarioActualSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * ¡CORREGIDO!
   * Obtiene el ROL desde el objeto anidado 'usuario' en localStorage.
   */
  getRol(): string | null {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) return null;
    
    const respuesta: RespuestaLogin = JSON.parse(usuarioString);
    // El rol está en respuesta.usuario.rol, no en respuesta.rol
    return respuesta.usuario ? respuesta.usuario.rol : null;
  }

  /**
   * Obtiene el objeto de usuario COMPLETO guardado en localStorage.
   * (Nombre de función corregido para mayor claridad).
   */
  getUsuarioLogueado(): RespuestaLogin | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  estaLogueado(): boolean {
    return !!this.getToken();
  }
}