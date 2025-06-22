import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { apiBase } from '../../service/api';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginNick: string = '';
  loginSenha: string = '';
  createNick: string = '';
  createSenha: string = '';

  errorLogin: string = '';
  errorCreate: string = '';

  carregando: boolean = false;

  constructor(private router: Router) {
    this.errorLogin = '';
    this.errorCreate = '';
  }

  async login(): Promise<void> {
    if (this.loginNick && this.loginSenha) {
      this.carregando = true;
      try {
        const response = await apiBase.post('/user/token', {
          nick: this.loginNick,
          senha: this.loginSenha,
        });
        localStorage.setItem('token', response.data);
        this.router.navigate(['/list-candidate']);
      } catch (error: any) {
        this.errorLogin = error?.response?.data || 'Erro ao fazer login.';
        this.errorCreate = '';
      } finally {
        this.carregando = false;
      }
    } else {
      this.errorLogin = 'Por favor, insira o nick e a senha para entrar.';
      this.errorCreate = '';
    }
  }

  async createAccount(): Promise<void> {
    if (this.createNick && this.createSenha) {
      if (/\s/.test(this.createNick)) {
        this.errorCreate = 'Nick não pode conter espaços.';
        this.errorLogin = '';

        return;
      }

      if (this.createSenha.length < 6 || this.createSenha.length > 16) {
        this.errorCreate = 'Senha inválida. Use de 6 a 16 caracteres.';
        this.errorLogin = '';

        return;
      }

      this.carregando = true;

      try {
        const response = await apiBase.post('/user', {
          nick: this.createNick,
          senha: this.createSenha,
        });
        localStorage.setItem('token', response.data);
        this.router.navigate(['/list-candidate']);
      } catch (error: any) {
        this.errorCreate = error?.response?.data || 'Erro ao criar conta.';
        this.errorLogin = '';
      } finally {
        this.carregando = false;
      }
    } else {
      this.errorCreate = 'Por favor, preencha o nick e a senha.';
      this.errorLogin = '';
    }
  }
}
