import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all Material modules you intend to use globally
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatGridList, MatGridTile, MatGridTileFooterCssMatStyler } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { MatListItem, MatListModule } from '@angular/material/list';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    MatGridList,
    MatGridTile,
    MatGridTileFooterCssMatStyler,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListItem
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    MatGridList,
    MatGridTile,
    MatGridTileFooterCssMatStyler,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListItem,
    MatListModule
  ]
})
export class MaterialModule { }