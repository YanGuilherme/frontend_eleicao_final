import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExibicaoResultadoComponent } from '../../components/exibicao-resultado/exibicao-resultado.component'; // ajuste o path conforme a estrutura do seu projeto
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';

@Component({
  selector: 'app-dados-outros-grupos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExibicaoResultadoComponent,
    RouterModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: './dados-outros-grupos.component.html',
  styleUrls: ['./dados-outros-grupos.component.css'],
})
export class DadosOutrosGruposComponent implements OnInit, OnDestroy {
  dadosAgregados: any[] = [];
  tiposDisponiveis: string[] = [];
  tipoSelecionado: string | null = null;
  listaSelecionada: any[] = [];
  totalLotesProcessadosGlobal: string | null = null;
  totalItensDeDadosProcessadosGlobal: string | null = null;
  stompClient: Client;

  conectado: boolean = false;

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('https://agregador-node.onrender.com/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  ngOnInit(): void {
    this.conectarWebSocket();
    this.carregarDadosViaHttp();
  }

  ngOnDestroy(): void {
    this.desconectarWebSocket();
  }

  async carregarDadosViaHttp(): Promise<void> {
    try {
      const json = await this.buscarDados();
      this.totalItensDeDadosProcessadosGlobal = json.totalItensDeDadosProcessadosGlobal;
      this.totalLotesProcessadosGlobal = json.totalLotesProcessadosGlobal;
      this.dadosAgregados = json.dadosAgregados.filter((d: any) => d.type !== 'eleicao-gp2');
      this.tiposDisponiveis = this.dadosAgregados.map((d: any) => d.type);
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
    }
  }

  aoSelecionarTipo(tipo: string | null) {
    if (!tipo) return;
    this.tipoSelecionado = tipo;
    const dados = this.dadosAgregados.find((d) => d.type === tipo)?.lista || [];
    this.listaSelecionada = dados;
  }

  async buscarDados(): Promise<any> {
    const response = await fetch('https://agregador-node.onrender.com/api/aggregator/results');
    if (!response.ok) {
      throw new Error('Erro ao obter os dados da API');
    }
    return await response.json();
  }

  conectarWebSocket(): void {
    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/aggregated', (message: Message) => {
        try {
          const json = JSON.parse(message.body);
          this.totalItensDeDadosProcessadosGlobal = json.totalItensDeDadosProcessadosGlobal;
          this.totalLotesProcessadosGlobal = json.totalLotesProcessadosGlobal;
          this.dadosAgregados = json.dadosAgregados.filter((d: any) => d.type !== 'eleicao-gp2');
          this.tiposDisponiveis = this.dadosAgregados.map((d: any) => d.type);

          if (this.tipoSelecionado) {
            const dados =
              this.dadosAgregados.find((d) => d.type === this.tipoSelecionado)?.lista || [];
            this.listaSelecionada = dados;
          }
        } catch (err) {
          console.error('Erro ao processar dados do WebSocket:', err);
        } finally {
          this.conectado = true;
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      this.conectado = false;
    };

    this.stompClient.onWebSocketError = (event) => {
      this.conectado = false;
    };

    this.stompClient.onDisconnect = () => {
      this.conectado = false;
    };

    this.stompClient.activate();
  }
  desconectarWebSocket(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }
}
