import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate.component.html',
  styleUrl: './candidate.component.css',
})
export class CandidateComponent implements OnInit {
  @Input() nome!: string;
  @Input() id!: number | string;
  @Input() quantidadeVotos!: number;
  @Input() porcentagem!: number;

  animar = false;

  ngOnInit(): void {
    this.animar = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['quantidadeVotos']) {
      this.animar = true;

      setTimeout(() => {
        this.animar = false;
      }, 700);
    }
  }
}
