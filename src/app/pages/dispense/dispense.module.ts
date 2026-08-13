import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HudaUiModule } from '../../shared/ui';
import { DispensePage } from './dispense.page';

const routes: Routes = [{ path: '', component: DispensePage }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HudaUiModule,
    RouterModule.forChild(routes),
  ],
  declarations: [DispensePage],
})
export class DispensePageModule {}
