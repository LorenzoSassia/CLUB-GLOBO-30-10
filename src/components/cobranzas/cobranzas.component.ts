import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service'; 
import { Cobranza } from '../../models/models';

@Component({
  selector: 'app-cobranzas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cobranzas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CobranzasComponent {
  private dataService = inject(DataService);
  private fb: FormBuilder = inject(FormBuilder);
  
  cobranza = this.dataService.cobranzas;
  socios = this.dataService.socios;
  cobradores = this.dataService.cobradores;
 
  
  modalAbierto = signal(false);
  cobranzaEditanda = signal<Cobranza | null>(null);
  modalEliminarAbierto = signal(false);
  cobranzaParaEliminar = signal<Cobranza | null>(null);

   cobranzasEnriquecidas = computed(() => {
    const allCobranzas = this.dataService.cobranzas();
    //const sociosMap = new Map(this.socios().map(s => [s.id, `${s.nombre} ${s.apellido}`]));
    //const cobradoresMap = new Map(this.cobradores().map(c => [c.id, c.nombre]));
    
    return allCobranzas.map(cobranza => ({
      ...cobranza,
      nombreSocio: cobranza.nombreSocio || 'Socio no encontrado',
      nombreCobrador: cobranza.nombreCobrador || 'Cobrador no encontrado'
    })).sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());
  });

  formularioCobranza = this.fb.group({
    mes: ['', Validators.required],
    fechaEmision: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(0)]],
    estado: ['Impago' as const, Validators.required],
    recargo: [0, [Validators.required, Validators.min(0)]],
    descuento: [0, [Validators.required, Validators.min(0)]],
    idSocio: [null as number | null], 
    idCobrador: [null as number | null]
  });

  /*sociosDisponibles = computed(() => {
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
  */

  /*constructor() {
    effect(() => {
      const idSocioControl = this.formularioCobranza.get('idSocio');
      const idCobradorControl = this.formularioCobranza.get('idCobrador');
      
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
*/

  abrirModal(cobranza: Cobranza | null) {
    this.cobranzaEditanda.set(cobranza);
    if (cobranza) {
      this.formularioCobranza.patchValue({
        mes: cobranza.mes,
        fechaEmision: cobranza.fechaEmision,
        monto: cobranza.monto,
        //estado: cobranza.estado ,
        recargo: cobranza.recargo,
        descuento: cobranza.descuento,
        idSocio: cobranza.idSocio ?? null, 
        idCobrador: cobranza.idCobrador ?? null

      });

    } else {
      this.formularioCobranza.reset({
        idSocio: null,
        idCobrador: null
      });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.cobranzaEditanda.set(null);
  }

  guardarCobranza() {
    if (this.formularioCobranza.invalid) return;

    const formVal = this.formularioCobranza.getRawValue();
    const cobranzaEditanda = this.cobranzaEditanda();
     

    if (cobranzaEditanda) {
      // FIX: Usamos 'any' para poder omitir 'nombreCompleto' sin que TypeScript marque error
      const cobranzaActualizada: any = {
        ...cobranzaEditanda,
        mes: formVal.mes!,
        fechaEmision: formVal.fechaEmision!,
        monto: formVal.monto!,
        estado: formVal.estado!,
        recargo: formVal.recargo!,
        descuento: formVal.descuento!,
        idSocio: formVal.idSocio || undefined,
        idCobrador: formVal.idCobrador || undefined,
      };

      this.dataService.updateCobranza(cobranzaActualizada);
    } else {
      // FIX: Usamos 'any' aquí también para omitir 'nombreCompleto'
      const nuevaCobranza: any = {
        mes: formVal.mes!,
        fechaEmision: formVal.fechaEmision!,
        monto: formVal.monto!,
        estado: formVal.estado!,
        recargo: formVal.recargo!,
        descuento: formVal.descuento!,
        idSocio: formVal.idSocio || undefined,
        idCobrador: formVal.idCobrador || undefined,
      };

      this.dataService.addCobranza(nuevaCobranza);
    }
    this.cerrarModal();
  }

  iniciarEliminacion(cobranza: Cobranza) {
    this.cobranzaParaEliminar.set(cobranza);
    this.modalEliminarAbierto.set(true);
  }

  cancelarEliminacion() {
    this.modalEliminarAbierto.set(false);
    this.cobranzaParaEliminar.set(null);
  }

  confirmarEliminacion() {
    const cobranza = this.cobranzaParaEliminar();
    if (cobranza) {
      this.dataService.deleteCobranza(cobranza.id);
      this.cancelarEliminacion();
    }
  }
}