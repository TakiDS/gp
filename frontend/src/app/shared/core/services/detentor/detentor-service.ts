import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

interface DetentorResquestType {
  nome: string;
  email: string;
  cpf: string;
  tipoPerfil: string;
}

@Injectable({
  providedIn: 'root',
})
export class DetentorService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/titular`;

  create(data: DetentorResquestType): Observable<any[]> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any[]>(this.API, data, { headers });
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

    return this.http.get<any[]>(this.API, { headers, params: httpParams });
  }

  getById(uuid: string): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.API}/${uuid}`, { headers });
  }

  update(uuid: string, data: any): Observable<any> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<any>(`${this.API}/${uuid}`, data, { headers });
  }

  delete(uuid: string): Observable<void> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.API}/${uuid}`, { headers });
  }
}
