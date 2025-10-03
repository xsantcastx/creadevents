import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Service } from '../../../models/data.models';

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.css']
})
export class ServicesListComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);
  
  services$!: Observable<Service[]>;
  filteredServices$!: Observable<Service[]>;
  selectedCategory = 'all';

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.services$ = this.firestoreService.getServices();
    this.filteredServices$ = this.services$;
  }

  filterServices(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredServices$ = this.services$;
    } else {
      this.filteredServices$ = this.services$.pipe(
        map((services: Service[]) => services.filter((service: Service) => service.category === category))
      );
    }
  }

  formatBudget(minBudget: number): string {
    if (minBudget >= 1000) {
      return `Starting at $${(minBudget / 1000).toFixed(1)}k`;
    }
    return `Starting at $${minBudget}`;
  }
}