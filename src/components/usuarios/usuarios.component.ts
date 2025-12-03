import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
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
  cobradores = this.dataService.cobradores;
 
  
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
    idSocio: [null as number | null], 
    idCobrador: [null as number | null]
  });

  sociosDisponibles = computed(() => {
    const sociosVinculados = new Set(this.usuarios().filter(u => u.idSocio).map(u => u.idSocio));
    const socioEditando = this.usuarioEditando();
    if (socioEditando && socioEditando.idSocio) {
        sociosVinculados.delete(socioEditando.idSocio);
    }
    return this.socios().filter(s => !sociosVinculados.has(s.id));
  });

  cobradoresDisponibles = computed(() => {
    const cobradoresVinculados = new Set(this.usuarios().filter(u => u.idCobrador).map(u => u.idCobrador));
    const usuarioEditando = this.usuarioEditando();
    if (usuarioEditando && usuarioEditando.idCobrador) {
        cobradoresVinculados.delete(usuarioEditando.idCobrador);
    }
    return this.cobradores().filter(c => !cobradoresVinculados.has(c.id));
  });

  constructor() {
    effect(() => {
      const rol = this.formularioUsuario.get('rol')?.value;
      const idSocioControl = this.formularioUsuario.get('idSocio');
      const idCobradorControl = this.formularioUsuario.get('idCobrador');
      
      // Lógica para Socio
      if (rol === 'Socio') {
        idSocioControl?.setValidators(Validators.required);
      } else {
        idSocioControl?.clearValidators();
        idSocioControl?.setValue(null, { emitEvent: false });
      }
      idSocioControl?.updateValueAndValidity({ emitEvent: false });
      
      // Lógica para Cobrador
      if (rol === 'Cobrador') {
        idCobradorControl?.setValidators(Validators.required);
      } else {
        idCobradorControl?.clearValidators();
        idCobradorControl?.setValue(null, { emitEvent: false });
      }
      idCobradorControl?.updateValueAndValidity({ emitEvent: false });
    });
  }


  abrirModal(usuario: Usuario | null) {
    this.usuarioEditando.set(usuario);
    if (usuario) {
      this.formularioUsuario.patchValue({
        nombreUsuario: usuario.nombreUsuario, 
        // Usamos string vacío si no viene nada
        nombreCompleto: usuario.nombreCompleto || '',
        rol: usuario.rol,
        idSocio: usuario.idSocio ?? null,
        idCobrador: usuario.idCobrador ?? null
      });
      this.formularioUsuario.controls['contrasena'].removeValidators(Validators.required);
    } else {
      this.formularioUsuario.reset({
        rol: 'Socio',
        idSocio: null,
        idCobrador: null
      });
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
        idSocio: formVal.idSocio || undefined,
        idCobrador: formVal.idCobrador || undefined,
      };
      this.dataService.updateUsuario(usuarioActualizado);
    } else {
      // FIX: Usamos 'any' aquí también para omitir 'nombreCompleto'
      const nuevoUsuario: any = {
        usuario: formVal.nombreUsuario!, 
        contrasena: formVal.contrasena!,
        rol: rolValido,
        // No enviamos nombreCompleto
        idSocio: formVal.idSocio || undefined,
        idCobrador: formVal.idCobrador || undefined,
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