import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario, Rol } from '../models/models';
import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private dataService = inject(DataService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  usuarioActual = signal<Usuario | null>(null);

  constructor() {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      this.usuarioActual.set(JSON.parse(usuarioGuardado));
    }
  }
  
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  login(nombreUsuario: string, contrasena: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { usuario: nombreUsuario, password: contrasena })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          
          // Decode token to get user info (basic decoding, no verification needed here)
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          const usuario: Usuario = {
            id: payload.id,
            nombreUsuario: payload.usuario,
            rol: payload.rol,
            contrasena: '', // not stored
            nombreCompleto: '', // This will be enriched by DataService later
            idSocio: payload.idSocio 
          };
          
          const enrichedUser = this.dataService.usuarios().find(u => u.nombreUsuario === usuario.nombreUsuario);
          
          if(enrichedUser) {
              this.usuarioActual.set(enrichedUser);
              localStorage.setItem('usuarioActual', JSON.stringify(enrichedUser));
          }

        }),
        catchError(error => {
          console.error('Login failed:', error);
          return of(null); // Return a null observable on error
        })
      );
  }

  logout(): void {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('authToken');
    this.router.navigate(['/invitado']);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  tieneRol(rolRequerido: Rol): boolean {
    return this.usuarioActual()?.rol === rolRequerido;
  }
}
