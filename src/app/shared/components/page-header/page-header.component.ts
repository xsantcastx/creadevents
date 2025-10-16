import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface Breadcrumb {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() titleHighlight: string = '';
  @Input() subtitle: string = '';
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() icon: string = '';
  @Input() showBadge: boolean = false;
  @Input() badgeCount: number = 0;
  @Input() compact: boolean = false; // For pages that need less vertical space
}
