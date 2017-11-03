import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AtListComponent } from './at-list.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from '../../services/common';
import { SanitizePipeModule } from '../../pipes';

@NgModule({
  declarations: [
    AtListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    SanitizePipeModule
  ],
  exports: [
      AtListComponent
  ],
  providers: []
})

export class AtListModule {}
