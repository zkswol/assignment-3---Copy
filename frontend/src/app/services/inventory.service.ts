import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  inventoryId: string;
  userId: string;
  addedBy: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  location: string;
  cost: number;
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private baseUrl = '';
  inventory = signal<InventoryItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // Get all inventory items
  getInventory(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory-34475338?userId=${userId}`);
  }

  // Get single inventory item
  getInventoryItem(userId: string, inventoryId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory-34475338/${inventoryId}?userId=${userId}`);
  }

  // Create new inventory item
  createInventoryItem(userId: string, item: Partial<InventoryItem>): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory-34475338`, { ...item, userId });
  }

  // Update inventory item
  updateInventoryItem(userId: string, inventoryId: string, item: Partial<InventoryItem>): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventory-34475338/${inventoryId}`, { ...item, userId });
  }

  // Delete inventory item
  deleteInventoryItem(userId: string, inventoryId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventory-34475338/${inventoryId}?userId=${userId}`);
  }

  // Fetch inventory and update signal
  async fetchInventory(userId: string) {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const response = await this.getInventory(userId).toPromise();
      if (response && response.ok) {
        this.inventory.set(response.inventory);
      } else {
        this.error.set(response?.error || 'Failed to fetch inventory');
      }
    } catch (err: any) {
      this.error.set(err.error?.error || 'Failed to fetch inventory');
    } finally {
      this.loading.set(false);
    }
  }

  // Check if item is expiring soon (within 3 days)
  isExpiringSoon(expirationDate: string): boolean {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  // Check if item is expired
  isExpired(expirationDate: string): boolean {
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  }

  // Calculate total inventory value
  calculateTotalValue(): number {
    return this.inventory().reduce((total, item) => total + item.cost, 0);
  }

  // Get expiring items
  getExpiringItems(): InventoryItem[] {
    return this.inventory().filter(item => this.isExpiringSoon(item.expirationDate));
  }

  // Get expired items
  getExpiredItems(): InventoryItem[] {
    return this.inventory().filter(item => this.isExpired(item.expirationDate));
  }
}
