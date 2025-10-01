import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialGridComponent } from './material-grid';

describe('MaterialGridComponent', () => {
  let component: MaterialGridComponent;
  let fixture: ComponentFixture<MaterialGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
