import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-detail.html',
  styleUrls: ['./recipe-detail.css']
})
export class RecipeDetail implements OnInit {
  private modalService = inject(NgbModal);
  
  recipe: Recipe | null = null;
  loading = false;
  error = '';
  userId: string | null | undefined = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.auth.readUserIdFromUrl() || this.auth.getUserId();
    
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (recipeId) {
      this.loadRecipe(recipeId);
    } else {
      this.error = 'Recipe ID not provided';
    }
  }

  loadRecipe(recipeId: string) {
    this.loading = true;
    this.error = '';

    // Since we don't have a direct get by ID endpoint, we'll need to get all recipes and find the one we want
    if (!this.userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.recipeService.list(this.userId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok && response.recipes) {
          const recipe = response.recipes.find((r: Recipe) => r.recipeId === recipeId);
          if (recipe) {
            this.recipe = recipe;
          } else {
            this.error = 'Recipe not found';
          }
        } else {
          this.error = 'Failed to load recipe';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load recipe';
      }
    });
  }

  goBack() {
    if (this.userId) {
      this.auth.navigateWithUserId(['/list-recipes-34475338'], this.userId);
    } else {
      this.router.navigate(['/list-recipes-34475338']);
    }
  }

  editRecipe() {
    if (this.recipe?.recipeId && this.userId) {
      this.auth.navigateWithUserId(['/recipes', this.recipe.recipeId, 'edit'], this.userId);
    }
  }

  // Open delete confirmation modal
  openDeleteModal(content: any) {
    if (!this.recipe?.recipeId || !this.userId) return;
    
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title'
    });

    modalRef.result.then((result) => {
      if (result === 'yes') {
        this.confirmDelete();
      }
    }).catch((error) => {
      console.log('Modal dismissed:', error);
    });
  }

  // Actually delete the recipe
  confirmDelete() {
    if (this.recipe?.recipeId && this.userId) {
      this.recipeService.delete(this.recipe.recipeId, this.userId).subscribe({
        next: () => {
          alert('Recipe deleted successfully');
          this.goBack();
        },
        error: (err) => {
          alert('Failed to delete recipe: ' + (err.error?.error || 'Unknown error'));
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  isOwner(): boolean {
    return this.recipe?.ownerId === this.userId;
  }
}
