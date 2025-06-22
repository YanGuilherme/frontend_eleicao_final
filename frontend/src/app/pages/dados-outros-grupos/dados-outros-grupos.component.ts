import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExibicaoResultadoComponent } from '../../components/exibicao-resultado/exibicao-resultado.component'; // ajuste o path conforme a estrutura do seu projeto
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import SockJS from 'sockjs-client';

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

  conectado: boolean = false;
  private socket: WebSocket | null = null;

  async ngOnInit() {
    await this.carregarDadosViaHttp();
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }

  async carregarDadosViaHttp(): Promise<void> {
    try {
      const json = await this.buscarDados();
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
    this.socket = new SockJS('https://agregador-node.onrender.com/ws');

    this.socket.onopen = () => {
      this.conectado = true;
      console.log('Conectado ao WebSocket');
    };

    this.socket.onclose = () => {
      this.conectado = false;
      console.warn('WebSocket desconectado');
    };

    this.socket.onerror = (err) => {
      console.error('Erro no WebSocket:', err);
      this.conectado = false;
    };

    this.socket.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        this.dadosAgregados = json.dadosAgregados.filter((d: any) => d.type !== 'eleicao-gp2');
        this.tiposDisponiveis = this.dadosAgregados.map((d: any) => d.type);

        if (this.tipoSelecionado) {
          const dados =
            this.dadosAgregados.find((d) => d.type === this.tipoSelecionado)?.lista || [];
          this.listaSelecionada = dados;
        }
      } catch (err) {
        console.error('Erro ao processar dados do WebSocket:', err);
      }
    };
  }
}
