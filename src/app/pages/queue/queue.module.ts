import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HudaUiModule } from '../../shared/ui';
import { QueuePage } from './queue.page';

const routes: Routes = [{ path: '', component: QueuePage }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HudaUiModule,
    RouterModule.forChild(routes),
  ],
  declarations: [QueuePage],
})
export class QueuePageModule {}
