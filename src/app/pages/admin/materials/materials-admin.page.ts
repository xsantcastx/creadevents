import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { MaterialService } from '../../../services/material.service';
import { Material } from '../../../models/catalog';

@Component({
  selector: 'app-materials-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './materials-admin.page.html',
  styleUrl: './materials-admin.page.scss'
})
export default class MaterialsAdminComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private materialService = inject(MaterialService);

  materials: Material[] = [];
  isLoading = true;

  async ngOnInit() {
    await this.checkAdminAccess();
    this.loadMaterials();
  }

  private async checkAdminAccess() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/client/login']);
      return;
    }

    const isAdmin = await this.authService.isAdmin(user.uid);
    if (!isAdmin) {
      this.router.navigate(['/']);
      return;
    }
  }

  private loadMaterials() {
    this.isLoading = true;
    this.materialService.getAllMaterials().subscribe({
      next: (materials) => {
        this.materials = materials;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading materials:', error);
        this.isLoading = false;
      }
    });
  }
}
