import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, tap } from 'rxjs';
import { 
  Usuario, 
  Socio, 
  Actividad, 
  Casillero, 
  Categoria, 
  Zona,
  Cobrador,
  SocioActividad,
  Cobranza
} from '../models/models';

// Helper to convert snake_case to camelCase
const snakeToCamel = (str: string) => str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertKeys = (obj: any, converter: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeys(v, converter));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[converter(key)] = convertKeys(obj[key], converter);
      return result;
    }, {} as any);
  }
  return obj;
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';
  
  private _usuarios = signal<Usuario[]>([]);
  private _categorias = signal<Categoria[]>([]);
  private _socios = signal<Socio[]>([]);
  private _actividades = signal<Actividad[]>([]);
  private _casilleros = signal<Casillero[]>([]);
  private _zonas = signal<Zona[]>([]);
  private _cobradores = signal<Cobrador[]>([]);
  private _socioActividades = signal<SocioActividad[]>([]);
  private _cobranzas = signal<Cobranza[]>([]);
  
  // Public readonly signals
  public readonly usuarios = this._usuarios.asReadonly();
  public readonly categorias = this._categorias.asReadonly();
  public readonly socios = this._socios.asReadonly();
  public readonly actividades = this._actividades.asReadonly();
  public readonly casilleros = this._casilleros.asReadonly();
  public readonly zonas = this._zonas.asReadonly();
  public readonly cobradores = this._cobradores.asReadonly();
  public readonly socioActividades = this._socioActividades.asReadonly();
  public readonly cobranzas = this._cobranzas.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public sociosEnriquecidos = computed(() => {
    const socios = this.socios();
    const categorias = this.categorias();
    const categoriaMap = new Map(categorias.map(c => [c.id, c.nombre]));
    return socios.map(socio => ({
      ...socio,
      nombreCompleto: `${socio.nombre} ${socio.apellido}`,
      nombreCategoria: categoriaMap.get(socio.idCategoria) || 'Sin Categoría',
      moroso: socio.status === 'Impago'
    }));
  });

  public casillerosEnriquecidos = computed(() => {
    const casilleros = this.casilleros();
    const socios = this.socios();
    const socioMap = new Map(socios.map(s => [s.id, `${s.nombre} ${s.apellido}`]));
    return casilleros.map(casillero => ({
      ...casillero,
      nombreSocio: casillero.idSocio ? socioMap.get(casillero.idSocio) || 'Socio no encontrado' : ''
    }));
  });

  // --- API Methods ---
  private loadInitialData(): void {
    forkJoin({
      categorias: this.http.get<any[]>(`${this.baseUrl}/categorias`),
      socios: this.http.get<any[]>(`${this.baseUrl}/socios`),
      actividades: this.http.get<any[]>(`${this.baseUrl}/actividades`),
      casilleros: this.http.get<any[]>(`${this.baseUrl}/casilleros`),
      cobradores: this.http.get<any[]>(`${this.baseUrl}/cobradores`),
      cobranzas: this.http.get<any[]>(`${this.baseUrl}/cobranzas`)
    }).subscribe(data => {
      this._categorias.set(convertKeys(data.categorias, snakeToCamel));
      this._socios.set(convertKeys(data.socios, snakeToCamel));
      this._actividades.set(convertKeys(data.actividades, snakeToCamel));
      this._casilleros.set(convertKeys(data.casilleros, snakeToCamel));
      this._cobradores.set(convertKeys(data.cobradores, snakeToCamel));
      this._cobranzas.set(convertKeys(data.cobranzas, snakeToCamel));
      
      // Load static data as API endpoints are not available
      this.cargarDatosEstaticos();
    });
  }

  addSocio(socio: Omit<Socio, 'id'>): void {
    const payload = convertKeys(socio, camelToSnake);
    this.http.post<{ id: number }>(`${this.baseUrl}/socios`, payload)
      .subscribe(response => {
        const nuevoSocio = { ...socio, id: response.id };
        this._socios.update(socios => [...socios, nuevoSocio]);
      });
  }

  updateSocio(socioActualizado: Socio): void {
    const payload = convertKeys(socioActualizado, camelToSnake);
    this.http.put(`${this.baseUrl}/socios/${socioActualizado.id}`, payload)
      .subscribe(() => {
        this._socios.update(socios => socios.map(s => s.id === socioActualizado.id ? socioActualizado : s));
      });
  }

  deleteSocio(id: number): void {
    this.http.delete(`${this.baseUrl}/socios/${id}`)
      .subscribe(() => {
        this._socios.update(socios => socios.filter(s => s.id !== id));
      });
  }

  addActividad(actividad: Omit<Actividad, 'id'>): void {
    this.http.post<{ id: number }>(`${this.baseUrl}/actividades`, actividad)
      .subscribe(response => {
        this._actividades.update(actividades => [...actividades, { ...actividad, id: response.id }]);
      });
  }

  updateActividad(actividadActualizada: Actividad): void {
    this.http.put(`${this.baseUrl}/actividades/${actividadActualizada.id}`, actividadActualizada)
      .subscribe(() => {
        this._actividades.update(actividades => 
          actividades.map(a => a.id === actividadActualizada.id ? actividadActualizada : a)
        );
      });
  }
  
  deleteActividad(id: number): void {
    this.http.delete(`${this.baseUrl}/actividades/${id}`)
      .subscribe(() => {
        this._actividades.update(actividades => actividades.filter(a => a.id !== id));
      });
  }
  
  addCasillero(casillero: Omit<Casillero, 'id' | 'estado' | 'idSocio'>): void {
    const payload = { ...convertKeys(casillero, camelToSnake), estado: 'Disponible' };
    this.http.post<{ id: number }>(`${this.baseUrl}/casilleros`, payload)
      .subscribe(response => {
          const nuevoCasillero: Casillero = { ...casillero, id: response.id, estado: 'Disponible' };
          this._casilleros.update(casilleros => [...casilleros, nuevoCasillero]);
      });
  }

  updateCasillero(casilleroActualizado: Pick<Casillero, 'id' | 'montoMensual' | 'estado' | 'nroCasillero'>): void {
    const payload = convertKeys(casilleroActualizado, camelToSnake);
    this.http.put(`${this.baseUrl}/casilleros/${casilleroActualizado.id}`, payload)
      .subscribe(() => {
        this._casilleros.update(casilleros => casilleros.map(c => 
          c.id === casilleroActualizado.id 
            ? { ...c, ...casilleroActualizado } 
            : c
        ));
      });
  }
  
  deleteCasillero(id: number): void {
    this.http.delete(`${this.baseUrl}/casilleros/${id}`)
      .subscribe(() => {
        this._casilleros.update(casilleros => casilleros.filter(c => c.id !== id));
      });
  }

  // --- Methods modifying local state (API endpoints not available) ---
  
  public asignarCasillero(idCasillero: number, idSocio: number): void {
    this._casilleros.update(casilleros => casilleros.map(c => 
      c.id === idCasillero ? { ...c, idSocio, estado: 'Ocupado' } : c
    ));
    this._socios.update(socios => socios.map(s => 
      s.id === idSocio ? { ...s, idCasillero } : s
    ));
    // NOTE: This should ideally be a single API call to avoid inconsistent states.
  }

  public liberarCasillero(idCasillero: number): void {
    const casillero = this.casilleros().find(c => c.id === idCasillero);
    if (!casillero) return;
    
    this._socios.update(socios => socios.map(s => 
      s.id === casillero.idSocio ? { ...s, idCasillero: undefined } : s
    ));
    this._casilleros.update(casilleros => casilleros.map(c => 
      c.id === idCasillero ? { ...c, idSocio: undefined, estado: 'Disponible' } : c
    ));
  }
  
  public registrarPago(idCobranza: number, idCobrador: number): void {
    // This is a complex operation that should be handled by the backend.
    // Simulating it on the frontend for now.
    const cobranza = this._cobranzas().find(c => c.id === idCobranza);
    if (!cobranza) return;

    const updatedCobranza = { ...cobranza, estado: 'Pago' as const, idCobrador };
    const payload = convertKeys(updatedCobranza, camelToSnake);
    
    this.http.put(`${this.baseUrl}/cobranzas/${idCobranza}`, payload).subscribe(() => {
      this._cobranzas.update(cobranzas => cobranzas.map(c => c.id === idCobranza ? updatedCobranza : c));
      this._socios.update(socios => socios.map(s => s.id === cobranza.idSocio ? { ...s, status: 'Pago' as const } : s));
    });
  }

  public alquilarCasillero(idSocio: number, idCasillero: number): void {
    this.asignarCasillero(idCasillero, idSocio);
    console.log(`Socio ${idSocio} alquiló casillero ${idCasillero}. El costo se agregará a la próxima facturación.`);
  }
  
  public inscribirSocioEnActividad(idSocio: number, idActividad: number): void {
    console.warn('API endpoint for activity enrollment not available. Modifying local state only.');
    const alreadyEnrolled = this._socioActividades().some(sa => sa.idSocio === idSocio && sa.idActividad === idActividad);
    if (alreadyEnrolled) return;
    
    this._socioActividades.update(sa => {
      const newId = sa.length > 0 ? Math.max(...sa.map(x => x.id)) + 1 : 1;
      return [...sa, {id: newId, idSocio, idActividad}];
    });
  }

  public darDeBajaSocioDeActividad(idSocio: number, idActividad: number): void {
    console.warn('API endpoint for activity unenrollment not available. Modifying local state only.');
    this._socioActividades.update(sa => sa.filter(x => !(x.idSocio === idSocio && x.idActividad === idActividad)));
  }

  private cargarDatosEstaticos(): void {
    // Static data because API endpoints are not available in the provided code
    const zonas: Zona[] = [
      { id: 1, nombre: 'NORTE' },
      { id: 2, nombre: 'SUR' },
      { id: 3, nombre: 'ESTE' },
      { id: 4, nombre: 'OESTE' },
    ];
    this._zonas.set(zonas);

    const socioActividades: SocioActividad[] = [
      { id: 1, idSocio: 3, idActividad: 5 },
      { id: 2, idSocio: 1, idActividad: 6 },
      { id: 3, idSocio: 1, idActividad: 4 },
    ];
    this._socioActividades.set(socioActividades);

    // This is also static as the auth API doesn't provide user details beyond id/role.
    const usuarios: Usuario[] = [
       { id: 1, nombreUsuario: 'jose', contrasena: '123456', nombreCompleto: 'Ricardo Darin', rol: 'Socio', idSocio: 3 },
       { id: 2, nombreUsuario: 'admin', contrasena: '654321', nombreCompleto: 'Administrador', rol: 'Administrador' },
       { id: 3, nombreUsuario: 'jperez', contrasena: '1234', nombreCompleto: 'Juan Perez', rol: 'Socio', idSocio: 1 },
       { id: 4, nombreUsuario: 'mgomez', contrasena: '1234', nombreCompleto: 'Maria Gomez', rol: 'Socio', idSocio: 2 },
       { id: 5, nombreUsuario: 'cobrador', contrasena: 'cobranza', nombreCompleto: 'Jose', rol: 'Cobrador' },
    ];
    this._usuarios.set(usuarios);
  }
}
