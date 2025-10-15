import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InventoryService, InventoryItem } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css']
})
export class InventoryList implements OnInit {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private modalService = inject(NgbModal);

  inventory = this.inventoryService.inventory;
  loading = this.inventoryService.loading;
  error = this.inventoryService.error;
  user = this.authService.currentUser;

  // Computed properties
  totalValue = computed(() => this.inventoryService.calculateTotalValue());
  expiringItems = computed(() => this.inventoryService.getExpiringItems());
  expiredItems = computed(() => this.inventoryService.getExpiredItems());

  // Filter and sort properties
  filterCategory = '';
  filterLocation = '';
  sortBy = 'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Available options for filters
  categories = ['Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Spices', 'Beverages', 'Frozen', 'Canned', 'Other'];
  locations = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cupboard'];

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.inventoryService.fetchInventory(userId);
    }
  }

  // Filtered and sorted inventory
  get filteredInventory(): InventoryItem[] {
    let filtered = this.inventory();

    // Apply category filter
    if (this.filterCategory) {
      filtered = filtered.filter(item => item.category === this.filterCategory);
    }

    // Apply location filter
    if (this.filterLocation) {
      filtered = filtered.filter(item => item.location === this.filterLocation);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof InventoryItem];
      let bValue: any = b[this.sortBy as keyof InventoryItem];

      // Handle date sorting
      if (this.sortBy === 'createdDate' || this.sortBy === 'purchaseDate' || this.sortBy === 'expirationDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }

  // Get CSS class for expiration status
  getExpirationClass(expirationDate: string): string {
    if (this.inventoryService.isExpired(expirationDate)) {
      return 'expired';
    } else if (this.inventoryService.isExpiringSoon(expirationDate)) {
      return 'expiring-soon';
    }
    return '';
  }

  // Get expiration status text
  getExpirationStatus(expirationDate: string): string {
    if (this.inventoryService.isExpired(expirationDate)) {
      return 'Expired';
    } else if (this.inventoryService.isExpiringSoon(expirationDate)) {
      return 'Expiring Soon';
    }
    return 'Fresh';
  }

  // Open delete confirmation modal
  openDeleteModal(content: any, inventoryId: string | undefined, itemName: string | undefined) {
    if (!inventoryId || !itemName) return;
    
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title'
    });

    modalRef.result.then((result) => {
      if (result === 'yes') {
        this.confirmDelete(inventoryId);
      }
    }).catch((error) => {
      console.log('Modal dismissed:', error);
    });
  }

  // Actually delete the item
  async confirmDelete(inventoryId: string) {
    const userId = this.authService.getUserId();
    if (userId) {
      try {
        await this.inventoryService.deleteInventoryItem(userId, inventoryId).toPromise();
        // Show success alert
        alert('Inventory item deleted successfully!');
        // Refresh the inventory list
        this.inventoryService.fetchInventory(userId);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  }

  // Clear filters
  clearFilters() {
    this.filterCategory = '';
    this.filterLocation = '';
  }

  // Refresh inventory
  refreshInventory() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.inventoryService.fetchInventory(userId);
    }
  }

  // Navigate back to dashboard
  goBack() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.authService.navigateWithUserId(['/dashboard-34475338'], userId);
    }
  }
}
