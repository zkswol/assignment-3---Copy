import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-edit.html',
  styleUrls: ['./recipe-edit.css']
})
export class RecipeEdit implements OnInit {
  recipeForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  recipeId: string | null = null;
  userId: string | null | undefined = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private auth: AuthService
  ) {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      chef: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s\-'']+$/)]],
      cuisineType: ['', Validators.required],
      mealType: ['', Validators.required],
      prepTime: ['', [Validators.required, Validators.min(1), Validators.max(480)]],
      difficulty: ['', Validators.required],
      servings: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      ingredients: this.fb.array([]),
      instructions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.userId = this.auth.readUserIdFromUrl() || this.auth.getUserId();
    this.recipeId = this.route.snapshot.paramMap.get('id');
    
    if (!this.userId) {
      this.error = 'User not authenticated';
      return;
    }

    if (!this.recipeId) {
      this.error = 'Recipe ID not provided';
      return;
    }

    this.loadRecipe();
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get instructions() {
    return this.recipeForm.get('instructions') as FormArray;
  }

  loadRecipe() {
    this.loading = true;
    this.error = '';

    this.recipeService.getForEdit(this.recipeId!, this.userId!).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.ok && response.recipes) {
          // Find the specific recipe by recipeId
          console.log('Looking for recipeId:', this.recipeId);
          console.log('Available recipes:', response.recipes.map(r => ({ recipeId: r.recipeId, title: r.title })));
          const recipe = response.recipes.find((r: Recipe) => r.recipeId === this.recipeId);
          if (recipe) {
            console.log('Found recipe:', recipe);
            this.populateForm(recipe);
          } else {
            this.error = 'Recipe not found or you do not have permission to edit it';
          }
        } else {
          this.error = 'Failed to load recipes';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load recipe';
      }
    });
  }

  populateForm(recipe: Recipe) {
    this.recipeForm.patchValue({
      title: recipe.title,
      chef: recipe.chef,
      cuisineType: recipe.cuisineType,
      mealType: recipe.mealType,
      prepTime: recipe.prepTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings
    });

    // Clear existing arrays
    while (this.ingredients.length !== 0) {
      this.ingredients.removeAt(0);
    }
    while (this.instructions.length !== 0) {
      this.instructions.removeAt(0);
    }

    // Populate ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ingredient => {
        this.addIngredient(ingredient);
      });
    } else {
      this.addIngredient();
    }

    // Populate instructions
    if (recipe.instructions && recipe.instructions.length > 0) {
      recipe.instructions.forEach(instruction => {
        this.addInstruction(instruction);
      });
    } else {
      this.addInstruction();
    }
  }

  addIngredient(ingredient?: any) {
    const ingredientGroup = this.fb.group({
      name: [ingredient?.name || '', [Validators.required, Validators.minLength(2)]],
      quantity: [ingredient?.quantity || '', [Validators.required, Validators.min(0.1)]],
    });
    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addInstruction(instruction?: string) {
    const instructionGroup = this.fb.group({
      step: [instruction || '', [Validators.required, Validators.minLength(10)]]
    });
    this.instructions.push(instructionGroup);
  }

  removeInstruction(index: number) {
    if (this.instructions.length > 1) {
      this.instructions.removeAt(index);
    }
  }

  onSubmit() {
    if (this.recipeForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = this.recipeForm.value;
    const recipe: Partial<Recipe> & { userId: string; recipeId: string } = {
      userId: this.userId!,
      recipeId: this.recipeId!,
      title: formValue.title,
      chef: formValue.chef,
      cuisineType: formValue.cuisineType,
      mealType: formValue.mealType,
      prepTime: formValue.prepTime,
      difficulty: formValue.difficulty,
      servings: formValue.servings,
      ingredients: formValue.ingredients,
      instructions: formValue.instructions.map((inst: any) => inst.step)
    };

    console.log('Updating recipe with data:', recipe);
    this.recipeService.update(recipe).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.loading = false;
        this.success = 'Recipe updated successfully!';
        // Navigate back to recipe detail
        if (this.userId && this.recipeId) {
          this.auth.navigateWithUserId(['/recipes', this.recipeId, 'detail'], this.userId);
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.loading = false;
        this.error = err.error?.error || 'Failed to update recipe';
      }
    });
  }

  goBack() {
    if (this.userId && this.recipeId) {
      this.auth.navigateWithUserId(['/recipes', this.recipeId, 'detail'], this.userId);
    } else {
      this.router.navigate(['/list-recipes-34475338']);
    }
  }
}
