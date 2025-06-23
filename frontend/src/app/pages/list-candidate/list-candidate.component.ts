import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateComponent } from '../../components/candidate/candidate.component';
import { FormsModule } from '@angular/forms';
import { apiBase, apiProd } from '../../service/api';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isTokenValid } from '../../utils/auth.utils';
import { UsersComponent } from '../../components/users/users.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExibicaoResultadoComponent } from '../../components/exibicao-resultado/exibicao-resultado.component';

interface Candidato {
  id: string;
  nome: string;
  media?: number;
  mediana?: number;
  somatorio?: number;
  contagem?: number;
  porcentagem?: number;
  objectIdentifier?: string;
}

@Component({
  selector: 'app-list-candidate',
  standalone: true,
  imports: [
    CommonModule,
    CandidateComponent,
    FormsModule,
    UsersComponent,
    MatProgressBarModule,
    ExibicaoResultadoComponent,
  ],
  templateUrl: './list-candidate.component.html',
  styleUrls: ['./list-candidate.component.css'],
})
export class ListCandidateComponent implements OnInit, OnDestroy {
  candidatos: Candidato[] = [];
  stompClient: Client;

  isConnected = false;
  isConnecting = false;
  error: string | null = null;
  hit: string | null = null;

  mostrarModal = false;
  isSubmitting = false;
  tipoSelecionado: string = 'eleicao-gp2';

  constructor(private router: Router) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('https://agregador-node.onrender.com/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  ngOnInit(): void {
    this.conectarWebSocket();
    this.carregarTudo();
  }

  ngOnDestroy(): void {
    this.desconectarWebSocket();
  }

  conectarWebSocket(): void {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    this.stompClient.onConnect = () => {
      this.hit = 'Conectado ao WebSocket';
      this.isConnected = true;
      this.isConnecting = false;
      this.error = null;

      this.stompClient.subscribe('/topic/aggregated', (message: Message) => {
        try {
          const payload = JSON.parse(message.body);
          const dadosAgregados = payload.dadosAgregados;

          this.candidatos = this.relacionarDadosAgregadosComCandidatos(
            this.candidatos,
            dadosAgregados
          );
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
          this.error = 'Erro ao processar dados recebidos';
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      this.error = `Erro de conexão WebSocket: ${frame.headers['message'] || 'Erro desconhecido'}`;
      this.isConnected = false;
      this.isConnecting = false;
    };

    this.stompClient.onWebSocketError = (event) => {
      this.error = 'Erro de conexão WebSocket';
      this.isConnected = false;
      this.isConnecting = false;
    };

    this.stompClient.onDisconnect = () => {
      this.isConnected = false;
      this.isConnecting = false;
    };

    this.stompClient.activate();
  }

  desconectarWebSocket(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
    this.isConnected = false;
    this.isConnecting = false;
  }

  async carregarTudo(): Promise<void> {
    try {
      const candidatos = await this.carregarCandidatos();
      const dadosAgregados = await this.carregarDadosAgregados();

      this.candidatos = this.relacionarDadosAgregadosComCandidatos(
        candidatos,
        dadosAgregados,
        'eleicao-gp2'
      );
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.candidatos = [];
      this.error = 'Erro ao carregar dados';
    }
  }

  async carregarCandidatos(): Promise<Candidato[]> {
    if (this.logout_no_token()) return [];

    const token = localStorage.getItem('token');
    const response = await apiBase.get('/candidatos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  async carregarDadosAgregados(): Promise<any[]> {
    const response = await apiProd.get('/api/aggregator/results');
    return response.data.dadosAgregados;
  }

  relacionarDadosAgregadosComCandidatos(
    candidatos: Candidato[],
    dadosAgregados: any[],
    tipo: string = 'eleicao-gp2'
  ): Candidato[] {
    const dadosFiltrados = dadosAgregados.find((dado) => dado.type === tipo);

    if (!dadosFiltrados || !Array.isArray(dadosFiltrados.lista)) {
      return candidatos;
    }

    for (const dado of dadosFiltrados.lista) {
      const candidato = candidatos.find((c) => String(c.id) === String(dado.objectIdentifier));
      if (candidato) {
        Object.assign(candidato, {
          objectIdentifier: candidato.nome,
          media: dado.media,
          mediana: dado.mediana,
          somatorio: dado.somatorio,
          contagem: dado.contagem,
          porcentagem: dado.porcentagem,
        });
      }
    }

    return candidatos;
  }

  votar(candidato: Candidato): void {
    if (this.logout_no_token()) return;

    const token = localStorage.getItem('token');

    try {
      apiBase.post(
        `/eleicao-gp2/votar/${candidato.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      this.hit = `Votou no candidato: ${candidato.nome}`;
    } catch (error) {
      this.error = 'Erro ao votar';
    }
  }

  logout_no_token(): boolean {
    const token = localStorage.getItem('token');

    if (!token || !isTokenValid(token)) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      alert('Deslogado');
      return true;
    }

    return false;
  }

  returnNick() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded: any = jwtDecode(token);
    return decoded.nick;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    alert('Faça o login novamente');
    return;
  }

  levarParaTelaInicial() {
    this.router.navigate(['/home']);
  }
}
