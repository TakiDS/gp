import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComodatoService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/comodato`;

  create(dados: any): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.API}`, dados, {
      headers,
    });
  }

  listAll(params?: any): Observable<any[]> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    const comodatos = this.http.get<any[]>(this.API, { headers });

    return comodatos;
  }

  getById(uuid: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.get<any>(`${this.API}/${uuid}`, { headers });
  }

  atualizarEstado(uuid: string, estado: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch<any>(`${this.API}/${uuid}`, { estado }, { headers });
  }

  delete(uuid: string): Observable<void> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.API}/${uuid}`, { headers });
  }
}
