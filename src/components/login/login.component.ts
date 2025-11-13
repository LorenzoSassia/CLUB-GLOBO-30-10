import { Usuario } from './../../models/models';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/src/services/autenticacion.service';
import { RespuestaLogin } from '../interfaces/respuesta-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  // Use a loose any token to avoid compile-time error when the module doesn't export the type
  private authService = inject(AuthService);

  errorLogin = signal<string | null>(null);
  cargando = signal(false);

  formularioLogin = this.fb.group({
    nombreUsuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  iniciarSesion() {
    this.errorLogin.set(null);
    if (this.formularioLogin.invalid) {
      return;
    }
    this.cargando.set(true);

    const { nombreUsuario, contrasena } = this.formularioLogin.value;

    this.authService.login(nombreUsuario!, contrasena!).subscribe({
      next: (responresponse: RespuestaLogin) => {
        this.cargando.set(false);
        if (responresponse) {
          const rol = responresponse.usuario.rol;
          switch (rol) {
            case 'admin':
              this.router.navigate(['/panel']);
              break;
            case 'socio':
              this.router.navigate(['/portal-socio']);
              break;
            case 'cobrador':
              this.router.navigate(['/portal-cobrador']);
              break;
            default:
              this.router.navigate(['/invitado']);
          }
        } else {
          this.errorLogin.set('Nombre de usuario o contraseña incorrectos.');
        }
      },
      error: () => {
        this.cargando.set(false);
        this.errorLogin.set('Ocurrió un error de conexión. Intente nuevamente.');
      }
    });
  }
}
