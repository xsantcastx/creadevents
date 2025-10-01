import { Component } from '@angular/core';
import { ContactoComponent } from '../../features/contacto/contacto/contacto';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [ContactoComponent],
  templateUrl: './contacto.page.html',
  styleUrl: './contacto.page.scss'
})
export class ContactoPageComponent {}
