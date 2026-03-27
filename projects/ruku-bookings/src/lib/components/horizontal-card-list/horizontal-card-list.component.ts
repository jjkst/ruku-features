import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-horizontal-card-list',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterModule],
  templateUrl: './horizontal-card-list.component.html',
  styleUrls: ['./horizontal-card-list.component.scss']
})
export class HorizontalCardListComponent<T extends { Id?: number | null }> {
  @Input() items: T[] = [];
  @Input() itemsPerPage = 3;
  @Input() contentTemplate!: TemplateRef<any>;
  @Input() getImageUrl: (item: T) => string = () => '';
  @Input() getTitle: (item: T) => string = () => '';
  @Input() showImage: boolean = true;
  @Input() showTitle: boolean = true;
  @Input() showActions: boolean = true;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  currentIndex = 0;
  currentPage = 0;

  constructor(
    private router: Router
  ) { }

  get visibleItems(): T[] {
    const startIndex = this.currentIndex;
    const endIndex = startIndex + this.itemsPerPage;
    return this.items.slice(startIndex, endIndex);
  }

  get maxIndex(): number {
    return Math.max(0, this.items.length - this.itemsPerPage);
  }

  get paginationDots(): number[] {
    const totalPages = Math.ceil(this.items.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  scrollLeft(): void {
    if (this.currentIndex > 0) {
      this.currentIndex -= this.itemsPerPage;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerPage);
    }
  }

  scrollRight(): void {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex += this.itemsPerPage;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerPage);
    }
  }

  goToPage(pageIndex: number): void {
    this.currentIndex = pageIndex * this.itemsPerPage;
    this.currentPage = pageIndex;
  }

  goToProject(item: T) {
    if (item.Id) {
      this.router.navigate(['/project', item.Id]);
    }
  }

  onEdit(item: T, event: Event): void {
    event.stopPropagation();
    this.edit.emit(item);
  }

  onDelete(item: T, event: Event): void {
    event.stopPropagation();
    this.delete.emit(item);
  }
}
