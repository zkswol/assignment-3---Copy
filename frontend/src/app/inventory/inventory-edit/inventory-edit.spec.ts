import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryEdit } from './inventory-edit';

describe('InventoryEdit', () => {
  let component: InventoryEdit;
  let fixture: ComponentFixture<InventoryEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
