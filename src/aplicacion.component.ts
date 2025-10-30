import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraLateralComponent } from './components/compartido/barra-lateral/barra-lateral.component';
import { EncabezadoComponent } from './components/compartido/encabezado/encabezado.component';
import { AutenticacionService } from './services/autenticacion.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  // FIX: Make component standalone as it is the root component.
  standalone: true,
  templateUrl: './aplicacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, BarraLateralComponent, EncabezadoComponent, ReactiveFormsModule]
})
export class AplicacionComponent {
  autenticacionService = inject(AutenticacionService);
  
  titulo = 'Club El Globo Management System';

  esAdmin = computed(() => this.autenticacionService.usuarioActual()?.rol === 'Administrador');
}
