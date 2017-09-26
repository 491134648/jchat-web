import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { CardModalComponent } from './card-modal.component';
import { SearchCardModule } from '../search-card';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from '../../services/common';

@NgModule({
  declarations: [
    CardModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    SearchCardModule
  ],
  exports: [
      CardModalComponent
  ],
  providers: []
})
export class CardModalModule {}
