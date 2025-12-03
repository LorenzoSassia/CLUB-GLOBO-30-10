import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Cobrador } from '../../models/models';

@Component({
  selector: 'app-cobradores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cobradores.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CobradoresComponent {
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  cobradores = this.dataService.cobradores;

  modalAbierto = signal(false);
  cobradorEditando = signal<Cobrador | null>(null);

  modalEliminarAbierto = signal(false);
  cobradorParaEliminar = signal<Cobrador | null>(null);

  formularioCobrador = this.fb.group({
    nombre: ['', Validators.required],
    zona: ['', Validators.required],
  });

  abrirModal(cobrador: Cobrador | null) {
    this.cobradorEditando.set(cobrador);
    if (cobrador) {
      this.formularioCobrador.patchValue(cobrador);
    } else {
      this.formularioCobrador.reset();
    }
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.cobradorEditando.set(null);
  }

  guardarCobrador() {
    if (this.formularioCobrador.invalid) return;

    const valorFormulario = this.formularioCobrador.value;
    const editando = this.cobradorEditando();

    if (editando) {
      const cobradorActualizado: Cobrador = {
        ...editando,
        nombre: valorFormulario.nombre!,
        zona: valorFormulario.zona!,
      };
      this.dataService.updateCobrador(cobradorActualizado);
    } else {
      const nuevoCobrador: Omit<Cobrador, 'id'> = {
        nombre: valorFormulario.nombre!,
        zona: valorFormulario.zona!,
      };
      this.dataService.addCobrador(nuevoCobrador);
    }
    this.cerrarModal();
  }

  iniciarEliminacion(cobrador: Cobrador) {
    this.cobradorParaEliminar.set(cobrador);
    this.modalEliminarAbierto.set(true);
  }

  cancelarEliminacion() {
    this.modalEliminarAbierto.set(false);
    this.cobradorParaEliminar.set(null);
  }

  confirmarEliminacion() {
    const cobrador = this.cobradorParaEliminar();
    if (cobrador) {
      this.dataService.deleteCobrador(cobrador.id);
      this.cancelarEliminacion();
    }
  }
}
