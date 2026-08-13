import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hides the shell chrome when signed out', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.loggedIn()).toBeFalse();
    expect(el.querySelector('ion-menu')).toBeNull();
    expect(el.querySelector('.huda-utility')).toBeNull();
  });

  it('renders grouped counter navigation when signed in', () => {
    const auth = TestBed.inject(AuthService);
    auth.sessionState.set({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 'u1', email: 'pharmacist@clinic.in', name: 'Asha Patil' },
      clinic: { id: 'c1', slug: 'techlapse-clinic', name: 'Techlapse Clinic' },
      membership: { id: 'm1', role: 'pharmacist', username: 'asha' },
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.nav-group').length).toBe(4);
    expect(el.querySelectorAll('a.nav-item').length).toBe(8);
    expect(el.querySelector('.utility-clinic')?.textContent).toContain('Techlapse Clinic');
    expect(fixture.componentInstance.initials()).toBe('AP');
  });
});
