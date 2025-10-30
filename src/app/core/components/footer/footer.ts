import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  private translate = inject(TranslateService);
  readonly year = new Date().getFullYear();
}
