import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [],
  templateUrl: './section-title.html',
  styleUrl: './section-title.scss'
})
export class SectionTitleComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() alineacion: 'left' | 'center' = 'left';
}
