import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service'; 
import { Usuario } from '../../models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosComponent {
  private dataService = inject(DataService);
  private fb: FormBuilder = inject(FormBuilder);
  
  usuarios = this.dataService.usuarios;
  roles = ['admin', 'socio', 'cobrador'];
  socios = this.dataService.socios;
 
  
  modalAbierto = signal(false);
  usuarioEditando = signal<Usuario | null>(null);
  modalEliminarAbierto = signal(false);
  usuarioParaEliminar = signal<Usuario | null>(null);

  formularioUsuario = this.fb.group({
    nombreUsuario: ['', Validators.required],
    contrasena: [''], 
    // Lo dejamos opcional para que no rompa el HTML si existe, pero no lo usaremos
    nombreCompleto: [''], 
    rol: ['socio', Validators.required],
    idSocio: [null as number | null] 
  });

  abrirModal(usuario: Usuario | null) {
    this.usuarioEditando.set(usuario);
    if (usuario) {
      this.formularioUsuario.patchValue({
        nombreUsuario: usuario.nombreUsuario, 
        // Usamos string vacío si no viene nada
        nombreCompleto: usuario.nombreCompleto || '',
        rol: usuario.rol,
        idSocio: usuario.idSocio
      });
      this.formularioUsuario.controls['contrasena'].removeValidators(Validators.required);
    } else {
      this.formularioUsuario.reset({ rol: 'Socio' });
      this.formularioUsuario.controls['contrasena'].addValidators(Validators.required);
    }
    this.formularioUsuario.controls['contrasena'].updateValueAndValidity();
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.usuarioEditando.set(null);
  }

  guardarUsuario() {
    if (this.formularioUsuario.invalid) return;

    const formVal = this.formularioUsuario.getRawValue();
    const usuarioEditando = this.usuarioEditando();
    const rolValido = formVal.rol as any; 

    if (usuarioEditando) {
      // FIX: Usamos 'any' para poder omitir 'nombreCompleto' sin que TypeScript marque error
      const usuarioActualizado: any = {
        ...usuarioEditando,
        usuario: formVal.nombreUsuario!, 
        rol: rolValido,
        // No enviamos nombreCompleto
        idSocio: formVal.idSocio || undefined
      };
      this.dataService.updateUsuario(usuarioActualizado);
    } else {
      // FIX: Usamos 'any' aquí también para omitir 'nombreCompleto'
      const nuevoUsuario: any = {
        usuario: formVal.nombreUsuario!, 
        contrasena: formVal.contrasena!,
        rol: rolValido,
        // No enviamos nombreCompleto
        idSocio: formVal.idSocio || undefined
      };
      this.dataService.addUsuario(nuevoUsuario);
    }
    this.cerrarModal();
  }

  iniciarEliminacion(usuario: Usuario) {
    this.usuarioParaEliminar.set(usuario);
    this.modalEliminarAbierto.set(true);
  }

  cancelarEliminacion() {
    this.modalEliminarAbierto.set(false);
    this.usuarioParaEliminar.set(null);
  }

  confirmarEliminacion() {
    const usuario = this.usuarioParaEliminar();
    if (usuario) {
      this.dataService.deleteUsuario(usuario.id);
      this.cancelarEliminacion();
    }
  }
}