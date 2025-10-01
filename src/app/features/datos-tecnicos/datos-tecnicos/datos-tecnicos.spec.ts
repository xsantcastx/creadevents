import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosTecnicosComponent } from './datos-tecnicos';

describe('DatosTecnicosComponent', () => {
  let component: DatosTecnicosComponent;
  let fixture: ComponentFixture<DatosTecnicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosTecnicosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosTecnicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
