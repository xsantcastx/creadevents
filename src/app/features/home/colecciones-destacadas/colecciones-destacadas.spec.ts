import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColeccionesDestacadasComponent } from './colecciones-destacadas';

describe('ColeccionesDestacadasComponent', () => {
  let component: ColeccionesDestacadasComponent;
  let fixture: ComponentFixture<ColeccionesDestacadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColeccionesDestacadasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ColeccionesDestacadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
