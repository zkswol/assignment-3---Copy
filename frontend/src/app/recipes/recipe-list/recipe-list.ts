import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-list.html'
})
export class RecipeList implements OnInit {
  private modalService = inject(NgbModal);
  
  rows: Recipe[] = [];
  loading = false;
  error = '';
  deleting = false;
  recipeToDelete: { recipeId?: string; title?: string } | null = null;

  constructor(private api: RecipeService, private auth: AuthService, private router: Router) {}

  userId: string | undefined;

  ngOnInit() {
    // Get userId from URL first, then fallback to auth service
    const urlUserId = this.auth.readUserIdFromUrl();
    const authUserId = this.auth.getUserId();
    this.userId = urlUserId || authUserId || undefined;
    this.load();
  }

  load() {
    this.loading = true; this.error = '';
    if (!this.userId) {
      this.error = 'User not logged in';
      this.loading = false;
      return;
    }
    this.api.list(this.userId).subscribe({
      next: res => { this.rows = res.recipes || []; this.loading = false; },
      error: (err) => { this.error = err.error?.error ||'Failed to load recipes'; this.loading = false; }
    });
  }

  // Open delete confirmation modal
  openDeleteModal(content: any, recipeId: string | undefined, title: string | undefined) {
    if (!recipeId || !title) return;
    
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title'
    });
    console.log('Modal opened for recipe:', recipeId, title);
    modalRef.result.then((result) => {
      if (result === 'yes') {
        this.confirmDelete(recipeId, title);
      }
    }).catch((error) => {
      console.log('Modal dismissed:', error);
    });
  }

  confirmDelete(recipeId?: string, title?: string) {
    if (!recipeId) return;
    console.log('Delete button clicked for recipe:', recipeId, title);
    
    this.recipeToDelete = { recipeId, title };
    this.onDelete();
  }

  onDelete() {
    if (!this.recipeToDelete?.recipeId || !this.userId) return;
    
    console.log('Deleting recipe:', this.recipeToDelete.recipeId);
    this.deleting = true;
    
    this.api.delete(this.recipeToDelete.recipeId, this.userId).subscribe({
      next: () => {
        console.log('Recipe deleted successfully');
        this.deleting = false;
        this.recipeToDelete = null;
        alert('Recipe deleted successfully!');
        this.load();
      },
      error: (error) => {
        this.deleting = false;
        console.error('Delete failed:', error);
        alert('Delete failed: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  isOwner(recipe: Recipe): boolean {
    return recipe.ownerId === this.userId;
  }

  getIngredientDisplay(ingredients: any[]): string {
    if (!ingredients) return '—';
    return ingredients.map(ing => ing?.name + ' ' + ing?.quantity || '').join(', ') || '—';
  }

  goBack() {
    if (this.userId) {
      this.auth.navigateWithUserId(['/dashboard-34475338'], this.userId);
    } else {
      this.router.navigate(['/dashboard-34475338']);
    }
  }
}