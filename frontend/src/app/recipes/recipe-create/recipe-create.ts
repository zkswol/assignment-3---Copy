import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-create.html',
  styleUrls: ['./recipe-create.css']
})
export class RecipeCreate implements OnInit {
  recipeForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private auth: AuthService,
    private router: Router
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
    // Add initial ingredient and instruction
    this.addIngredient();
    this.addInstruction();
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get instructions() {
    return this.recipeForm.get('instructions') as FormArray;
  }

  addIngredient() {
    const ingredientGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      quantity: ['', [Validators.required, Validators.min(0.1)]]
    });
    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addInstruction() {
    const instructionGroup = this.fb.group({
      step: ['', [Validators.required, Validators.minLength(10)]]
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

    const userId = this.auth.readUserIdFromUrl() || this.auth.getUserId();
    if (!userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    const formValue = this.recipeForm.value;
    const recipe: Partial<Recipe> & { userId: string } = {
      userId,
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

    this.recipeService.create(recipe).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Recipe created successfully!';
        // Navigate back to recipe list with userId
        if (userId) {
          this.auth.navigateWithUserId(['/list-recipes-34475338'], userId);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to create recipe';
      }
    });
  }

  goBack() {
    const userId = this.auth.readUserIdFromUrl() || this.auth.getUserId();
    if (userId) {
      this.auth.navigateWithUserId(['/list-recipes-34475338'], userId);
    } else {
      this.router.navigate(['/list-recipes-34475338']);
    }
  }
}
