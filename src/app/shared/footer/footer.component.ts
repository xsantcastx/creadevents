import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { Settings } from '../../models/data.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  
  settings$!: Observable<Settings | undefined>;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.settings$ = this.firestoreService.getSettings();
  }
}