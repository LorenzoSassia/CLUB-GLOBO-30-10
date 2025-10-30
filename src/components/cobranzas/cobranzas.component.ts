import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Correct service name and path to DataService and data.service.ts
import { DataService } from '../../services/data.service';
// FIX: Import the correct 'Cobranza' model as 'CuponCobranza' is obsolete.
import { Cobranza } from '../../models/models';

@Component({
  selector: 'app-cobranzas',
  // FIX: Make component standalone as it's loaded via routing.
  standalone: true,
  templateUrl: './cobranzas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CobranzasComponent {
  // FIX: Inject DataService instead of DatosService
  private dataService = inject(DataService);

  // FIX: Use 'cobranzas' signal from DataService as 'cupones' is obsolete.
  cobranzas = this.dataService.cobranzas;
  socios = this.dataService.socios;
  
  // FIX: Rename to 'cobranzasEnriquecidas' and update logic to work with the 'Cobranza' model.
  cobranzasEnriquecidas = computed(() => {
      const allCobranzas = this.cobranzas();
      const allSocios = this.socios();
      return allCobranzas.map(cobranza => {
          const socio = allSocios.find(s => s.id === cobranza.idSocio);
          return {
              ...cobranza,
              // FIX: Use 'socio.nombre' as 'apellido' does not exist on the Socio model.
              nombreSocio: socio ? socio.nombre : 'Socio no encontrado'
          };
      // FIX: Sort by 'fechaEmision' as 'anio' and 'mes' fields are not available on the new model.
      }).sort((a,b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());
  });
  
  // FIX: Update confirmation text to reflect the new model name ('cobranzas').
  generarCobranzas() {
      if(confirm('Esto generará las cobranzas para el mes actual para todos los socios. ¿Desea continuar?')) {
          alert('Funcionalidad de generación de cobranzas no implementada en esta demo.');
          // TODO: Implement logic to iterate through socios, calculate totals and create new Cobranza objects.
      }
  }

  // FIX: Update method parameter and confirmation text to use 'cobranza' terminology.
  reemitirConRecargo(cobranza: ReturnType<typeof this.cobranzasEnriquecidas>[number]) {
      if(confirm(`Re-emitir la cobranza de ${cobranza.nombreSocio} con un 5% de recargo?`)) {
          alert('Funcionalidad de re-emisión no implementada en esta demo.');
          // TODO: Update cobranza with 5% surcharge
      }
  }

  cuponesEnriquecidos: any[] = [];

  generarCupones(): void {
    // lógica real aquí
    this.cuponesEnriquecidos = []; 
  }

  trackById(index: number, item: any) { return item?.id; }
}
