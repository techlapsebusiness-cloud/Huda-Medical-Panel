import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.login(this.email.trim(), this.password);
      await this.router.navigateByUrl('/queue');
    } catch (e: any) {
      this.error =
        e?.error?.error?.message || e?.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
