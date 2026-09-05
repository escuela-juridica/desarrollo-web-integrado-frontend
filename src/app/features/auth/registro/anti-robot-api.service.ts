import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface DesafioAntiRobot {
  desafioId: string;
  pregunta: string;
  vigenciaSegundos: number;
}
export interface EvidenciaAntiRobot {
  evidencia: string;
  vigenciaSegundos: number;
}

@Injectable({ providedIn: 'root' })
export class AntiRobotApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/auth/registro/antirobot';

  crear() {
    return this.http.post<DesafioAntiRobot>(`${this.url}/desafios`, {}, { withCredentials: true });
  }

  verificar(desafioId: string, respuesta: number) {
    return this.http.post<EvidenciaAntiRobot>(
      `${this.url}/verificar`,
      { desafioId, respuesta },
      { withCredentials: true },
    );
  }
}
