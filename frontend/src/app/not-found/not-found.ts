import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css']
})
export class NotFound {
  private location = inject(Location);
  
  currentYear = new Date().getFullYear();

  goBack(): void {
    (this.location as Location).back();
  }
}
