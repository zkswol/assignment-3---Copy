import { Routes } from '@angular/router';
import { Register } from './register/register';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { RecipeList } from './recipes/recipe-list/recipe-list';
import { RecipeCreate } from './recipes/recipe-create/recipe-create';
import { RecipeDetail } from './recipes/recipe-detail/recipe-detail';
import { RecipeEdit } from './recipes/recipe-edit/recipe-edit';
import { InventoryList } from './inventory/inventory-list/inventory-list';
import { InventoryCreate } from './inventory/inventory-create/inventory-create';
import { InventoryEdit } from './inventory/inventory-edit/inventory-edit';
import { NotFound } from './not-found/not-found';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [  
  // Public routes (no auth required)
  { path: '', redirectTo: 'login-34475338', pathMatch: 'full' },
  { path: 'login-34475338', component: Login },
  { path: 'register-34475338', component: Register },
  
  // Protected routes (auth required)
  { path: 'dashboard-34475338', component: Dashboard, canActivate: [authGuard] },
  { path: 'list-recipes-34475338', component: RecipeList, canActivate: [authGuard] },
  { path: 'recipes/new', component: RecipeCreate, canActivate: [authGuard] },
  { path: 'recipes/:id/detail', component: RecipeDetail, canActivate: [authGuard] },
  { path: 'recipes/:id/edit', component: RecipeEdit, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryList, canActivate: [authGuard] },
  { path: 'inventory/new', component: InventoryCreate, canActivate: [authGuard] },
  { path: 'inventory/:id/edit', component: InventoryEdit, canActivate: [authGuard] },
  
  // 404 page for invalid routes (must be last)
  { path: '**', component: NotFound }
];
