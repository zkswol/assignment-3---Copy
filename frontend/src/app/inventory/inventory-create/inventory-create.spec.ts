import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryCreate } from './inventory-create';

describe('InventoryCreate', () => {
  let component: InventoryCreate;
  let fixture: ComponentFixture<InventoryCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
