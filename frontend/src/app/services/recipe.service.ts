// src/app/recipes/recipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Recipe {
  recipeId?: string;
  userId?: string;
  ownerId?: string;
  title: string;
  chef: string;
  ingredients: any[];
  instructions: string[];
  mealType: string;
  cuisineType: string;
  prepTime: number;
  difficulty: string;
  servings: number;
  createdDate?: Date;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private apiUrl = '';
  constructor(private http: HttpClient) {}

  // Get all recipes (for chefs)
  list(userId: string) {
    return this.http.get<{ ok: boolean; recipes: Recipe[] }>(`${this.apiUrl}/view-recipes-34475338?userId=${userId}`);
  }

  // Get my recipes only
  getMyRecipes(userId: string) {
    return this.http.get<{ ok: boolean; recipes: Recipe[] }>(`${this.apiUrl}/my-recipes-34475338?userId=${userId}`);
  }

  // Create new recipe
  create(recipe: Partial<Recipe> & { userId: string }) {
    return this.http.post<{ ok: boolean; recipe: Recipe }>(`${this.apiUrl}/add-recipe-34475338`, recipe);
  }

  // Update existing recipe
  update(recipe: Partial<Recipe> & { userId: string; recipeId: string }) {
    return this.http.put<{ ok: boolean; recipe: Recipe }>(`${this.apiUrl}/edit-recipe-34475338`, recipe);
  }

  // Delete recipe
  delete(recipeId: string, userId: string) {
    return this.http.delete(`${this.apiUrl}/delete-recipe-34475338/${recipeId}?userId=${userId}`);
  }

  // Get recipe for editing - we'll get it from the list and find the specific recipe
  getForEdit(recipeId: string, userId: string) {
    return this.http.get<{ ok: boolean; recipes: Recipe[] }>(`${this.apiUrl}/view-recipes-34475338?userId=${userId}`);
  }
}
