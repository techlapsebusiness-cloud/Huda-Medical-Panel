import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HudaUiModule } from '../../shared/ui';
import { CollectPage } from './collect.page';
import { CollectDetailPage } from './collect-detail.page';

const routes: Routes = [
  { path: '', component: CollectPage },
  { path: ':billId', component: CollectDetailPage },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HudaUiModule,
    RouterModule.forChild(routes),
  ],
  declarations: [CollectPage, CollectDetailPage],
})
export class CollectPageModule {}
