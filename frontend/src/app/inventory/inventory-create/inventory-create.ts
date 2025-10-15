import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventory-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-create.html',
  styleUrls: ['./inventory-create.css']
})
export class InventoryCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);

  inventoryForm: FormGroup;
  loading = false;
  error: string | null = null;

  // Available options
  units = ['pieces', 'kg', 'g', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'dozen'];
  categories = ['Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Spices', 'Beverages', 'Frozen', 'Canned', 'Other'];
  locations = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cupboard'];

  constructor() {
    this.inventoryForm = this.fb.group({
      ingredientName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      quantity: ['', [Validators.required, Validators.min(0.01), Validators.max(9999)]],
      unit: ['', Validators.required],
      category: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      expirationDate: ['', Validators.required],
      location: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0.01), Validators.max(999.99)]]
    });
  }

  ngOnInit() {
    // Set default purchase date to today
    const today = new Date().toISOString().split('T')[0];
    this.inventoryForm.patchValue({
      purchaseDate: today
    });

    // Add custom validators for date validation
    this.inventoryForm.get('purchaseDate')?.addValidators(this.purchaseDateValidator.bind(this));
    this.inventoryForm.get('expirationDate')?.addValidators(this.expirationDateValidator.bind(this));
  }

  // Custom validator for purchase date
  purchaseDateValidator(control: any) {
    if (!control.value) return null;
    
    const purchaseDate = new Date(control.value);
    const today = new Date();
    
    if (purchaseDate > today) {
      return { futureDate: true };
    }
    
    return null;
  }

  // Custom validator for expiration date
  expirationDateValidator(control: any) {
    if (!control.value) return null;
    
    const expirationDate = new Date(control.value);
    const purchaseDate = new Date(this.inventoryForm.get('purchaseDate')?.value);
    
    if (expirationDate <= purchaseDate) {
      return { beforePurchaseDate: true };
    }
    
    return null;
  }

  // Get form control for easy access in template
  get f() {
    return this.inventoryForm.controls;
  }

  // Get error message for a field
  getFieldError(fieldName: string): string {
    const field = this.inventoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must be no more than ${field.errors['max'].max}`;
      }
      if (field.errors['futureDate']) {
        return 'Purchase date cannot be in the future';
      }
      if (field.errors['beforePurchaseDate']) {
        return 'Expiration date must be after purchase date';
      }
    }
    return '';
  }

  // Get field label for error messages
  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      ingredientName: 'Ingredient name',
      quantity: 'Quantity',
      unit: 'Unit',
      category: 'Category',
      purchaseDate: 'Purchase date',
      expirationDate: 'Expiration date',
      location: 'Location',
      cost: 'Cost'
    };
    return labels[fieldName] || fieldName;
  }

  async onSubmit() {
    if (this.inventoryForm.valid) {
      this.loading = true;
      this.error = null;

      const userId = this.authService.getUserId();
      if (!userId) {
        this.error = 'User not found';
        this.loading = false;
        return;
      }

      try {
        const formData = this.inventoryForm.value;
        await this.inventoryService.createInventoryItem(userId, formData).toPromise();
        
        // Navigate back to inventory list
        this.router.navigate(['/inventory'], { queryParams: { userId } });
      } catch (error: any) {
        this.error = error.error?.error || 'Failed to create inventory item';
        this.loading = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.inventoryForm.controls).forEach(key => {
        this.inventoryForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    const userId = this.authService.getUserId();
    this.router.navigate(['/inventory'], { queryParams: { userId } });
  }

  // Navigate back to inventory list
  goBack() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.router.navigate(['/inventory'], { queryParams: { userId } });
    }
  }
}
