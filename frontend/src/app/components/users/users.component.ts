import { Component, OnDestroy, OnInit } from '@angular/core';
import { apiBase } from '../../service/api';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, OnDestroy {
  nicksUsuarios: string[] = [];

  intervalId: any;

  ngOnInit(): void {
    this.carregarUsuarios();
    this.intervalId = setInterval(() => {
      this.carregarUsuarios();
    }, 10000); // 10 segundos
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async carregarUsuarios(): Promise<void> {
    const token = localStorage.getItem('token');
    try {
      const response = apiBase.get('/user', { headers: { Authorization: `Bearer ${token}` } });
      this.nicksUsuarios = (await response).data;
    } catch (error) {
      console.error('Erro ao listar users', error);
    }
  }
}
