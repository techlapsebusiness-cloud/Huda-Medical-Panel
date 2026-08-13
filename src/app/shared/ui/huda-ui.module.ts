import { NgModule } from '@angular/core';
import { HudaPageHeaderComponent } from './huda-page-header.component';
import { HudaEmptyStateComponent } from './huda-empty-state.component';
import { HudaBadgeComponent } from './huda-badge.component';
import { HudaAvatarComponent } from './huda-avatar.component';

const UI = [
  HudaPageHeaderComponent,
  HudaEmptyStateComponent,
  HudaBadgeComponent,
  HudaAvatarComponent,
];

/** Single import for the NgModule-based pages in this app. */
@NgModule({
  imports: UI,
  exports: UI,
})
export class HudaUiModule {}
