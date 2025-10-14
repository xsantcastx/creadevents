import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-admin-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './admin-quick-actions.component.html',
  styleUrls: ['./admin-quick-actions.component.scss']
})
export class AdminQuickActionsComponent {
  @Input() currentPage: string = '';

  quickActions: QuickAction[] = [
    {
      label: 'admin.dashboard.title',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/admin/dashboard',
      color: 'blue'
    },
    {
      label: 'admin.catalog.title',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      route: '/admin/catalog',
      color: 'purple'
    },
    {
      label: 'admin.products.title',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      route: '/admin/products',
      color: 'orange'
    },
    {
      label: 'admin.gallery.title',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      route: '/admin/gallery',
      color: 'green'
    },
    {
      label: 'admin.orders.title',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      route: '/admin/orders',
      color: 'yellow'
    },
    {
      label: 'admin.users.title',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/admin/users',
      color: 'red'
    }
  ];

  isCurrentPage(route: string): boolean {
    return this.currentPage === route;
  }

  getColorClasses(color: string, isCurrent: boolean): string {
    if (isCurrent) {
      return 'bg-bitcoin-orange/20 border-bitcoin-orange text-bitcoin-orange';
    }

    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50',
      'purple': 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50',
      'orange': 'bg-bitcoin-orange/10 border-bitcoin-orange/30 text-bitcoin-orange hover:bg-bitcoin-orange/20 hover:border-bitcoin-orange/50',
      'green': 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50',
      'yellow': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/50',
      'red': 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50'
    };

    return colorMap[color] || colorMap['blue'];
  }
}
