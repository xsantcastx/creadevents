import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlotImgComponent } from '../../shared/slot-img/slot-img.component';

@Component({
  selector: 'app-site-footer',
  imports: [CommonModule, RouterLink, SlotImgComponent],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.css']
})
export class SiteFooterComponent {
  currentYear = new Date().getFullYear();
}