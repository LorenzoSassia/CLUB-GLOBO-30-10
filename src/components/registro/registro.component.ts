import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  errorMsg = '';
  exitosMsg = '';

  formRegistro: FormGroup;

  constructor (private fb: FormBuilder,
    private auth: AuthService,
    private router: Router) {
    this.formRegistro = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rol: ['usuario', [Validators.required]] // Valor por defecto 'usuario'
    });
    }

  onSubmit(): void {
    if (this.formRegistro.invalid) return;

    this.auth.registrar(this.formRegistro.value).subscribe({
      next: (res) => {
        this.exitosMsg = 'Usuario registrado con éxito.';
        this.errorMsg = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
          }, 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.mensaje || 'Error al registrar el usuario.';
        this.exitosMsg = '';
      }
    });
 }

 
}
