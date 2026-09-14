import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UsuarioDTO {
  uuid: string;
  nome: string;
  login: string;
  role: 'ADMIN' | 'USER';
  status: 'ATIVO' | 'PENDENTE' | 'INATIVO';
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  listar(params?: any): Observable<any> {
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

    return this.http.get<any>(`${this.API_URL}/usuarios`, { headers, params: httpParams });
  }

  convidar(dados: any): Observable<any> {
    return this.http.post(`${this.API_URL}/usuarios/convidar`, dados, {
      headers: this.getHeaders(),
    });
  }

  atualizar(uuid: string, dados: any): Observable<any> {
    return this.http.put(`${this.API_URL}/usuarios/${uuid}`, dados, {
      headers: this.getHeaders(),
    });
  }

  excluir(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/usuarios/${uuid}`, {
      headers: this.getHeaders(),
    });
  }

  getProfileUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/usuarios/${id}`, {
      headers: this.getHeaders(),
    });
  }

  alterarRole(
    uuid: string,
    role: string,
  ): Observable<{ logoutImediato: boolean; message: string }> {
    return this.http.patch<{ logoutImediato: boolean; message: string }>(
      `${this.API_URL}/usuarios/${uuid}/role`,
      { role },
      { headers: this.getHeaders() },
    );
  }
}
