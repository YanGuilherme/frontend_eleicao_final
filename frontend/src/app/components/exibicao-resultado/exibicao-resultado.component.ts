import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-exibicao-resultado',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './exibicao-resultado.component.html',
  styleUrls: ['./exibicao-resultado.component.css'],
})
export class ExibicaoResultadoComponent implements OnChanges {
  @Input() tipoSelecionado: string = '';
  @Input() listaSelecionada: any[] = [];

  chartLabels: string[] = [];
  chartData: number[] = [];

  ngOnChanges(): void {
    if (this.listaSelecionada?.length > 0) {
      const listaOrdenada = [...this.listaSelecionada].sort((a, b) => b.contagem - a.contagem);

      this.chartLabels = listaOrdenada.map((item) => item.objectIdentifier);
      this.chartData = listaOrdenada.map((item) => item.porcentagem);

      this.listaSelecionada = listaOrdenada;
    }
  }
}
