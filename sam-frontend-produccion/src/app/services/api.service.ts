import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // 🔹 Perfil
  getProfile(): Observable<any> {
    const url = `${this.baseUrl}/api/perfil`;
    return this.http.get(url);
  }

  // 🔹 Personas
  getAllPeople(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/people`);
  }

  importarPersonasExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('excel', file);
    return this.http.post(`${this.baseUrl}/api/importar-personas`, formData);
  }

  eliminarTodosLosRegistros(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/people`);
  }

  subirPersonasConUsuario(personas: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/personas`, personas);
  }

  // 🔹 Plantillas
  getPlantillasPorUsuario(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/plantillas?usuario_email=${email}`);
  }

  guardarPlantilla(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/plantillas`, payload);
  }

  getPlantillaPorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/plantillas/${id}`);
  }

  actualizarPlantilla(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/plantillas/${id}`, data);
  }

  eliminarPlantilla(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/plantillas/${id}`);
  }

  // 🔹 Correos
  enviarCorreos(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/enviar-correos`, data);
  }

  guardarSeleccionados(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/destinatarios-seleccionados`, payload);
  }

  verificarDestinatarios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/destinatarios-temporales/verificar`);
  }

  getCantidadDestinatarios(email: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/api/cantidad-destinatarios/${email}`);
  }

  getSmtpSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/smtp-settings`);
  }

  saveSmtpSettings(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/smtp-settings`, data);
  }

  eliminarDestinatariosTemporales(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/eliminar-destinatarios-temporales`, {
      usuario_email: email
    });
  }

  esperarTokenDisponible(): Promise<void> {
    return new Promise((resolve) => {
      const checkToken = () => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
          resolve();
        } else {
          setTimeout(checkToken, 50);
        }
      };
      checkToken();
    });
  }
  //revisar* 'http://127.0.0.1:8000/sanctum/csrf-cookie'
  obtenerCookieSanctum(): Promise<void> {
  return new Promise((resolve, reject) => {
      this.http.get(`${this.baseUrl}/sanctum/csrf-cookie`, { withCredentials: true })
      .subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error('[Error] al obtener cookie de Sanctum:', err);
          reject(err);
        }
      });
  });
}

  // 🔹 Puestos
  getPuestos(): Observable<any> {
    const url = `${this.baseUrl}/api/puestos`;
    return this.http.get(url);
  }

  // 🔹 Turnos
  getTurnos(): Observable<any> {
    const url = `${this.baseUrl}/api/turnos`;
    return this.http.get(url);
  }
}
