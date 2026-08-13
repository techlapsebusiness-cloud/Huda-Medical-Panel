import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage {
  apiBase = environment.apiBaseUrl;
  isProduction = environment.production;

  constructor(public auth: AuthService) {}

  logout() {
    void this.auth.logout();
  }
}
