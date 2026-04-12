import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-admin-menu-manager',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './admin-menu-manager.html',
  styleUrl: './admin-menu-manager.css'
})
export class AdminMenuManager implements OnInit {
  isAdmin$!: Observable<boolean>;
  restaurants: any[] = [];
  menus: any[] = [];
  selectedDish: any | null = null;

  createRestaurantId = 1;
  createName = '';
  createImage: File | null = null;

  editMenuId = 0;
  editRestaurantId = 1;
  editName = '';

  dishMenuId = 0;
  dishName = '';
  dishPrice = 0;
  dishImage: File | null = null;

  removeDishId = 0;
  lookupDishId = 0;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.isAdmin$ = this.proxyService.watchIsAdmin();
    this.loadLists();
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  loadLists() {
    this.proxyService.getRestaurants().subscribe((data) => {
      this.restaurants = data;
      if (data.length && !this.createRestaurantId) {
        this.createRestaurantId = data[0].id;
        this.editRestaurantId = data[0].id;
      }
    });
    this.proxyService.getMenus().subscribe((data) => this.menus = data);
  }

  onCreateImage(event: Event) {
    this.createImage = (event.target as HTMLInputElement).files?.[0] || null;
  }

  onDishImage(event: Event) {
    this.dishImage = (event.target as HTMLInputElement).files?.[0] || null;
  }

  createMenu() {
    this.proxyService.createMenuWithImage({
      restaurantId: Number(this.createRestaurantId),
      name: this.createName,
      image: this.createImage
    }).subscribe({
      next: () => {
        this.createName = '';
        this.createImage = null;
        this.setMessage('success', 'Menu created successfully.');
        this.loadLists();
      },
      error: (err) => this.setMessage('error', err?.error || 'Menu creation failed.')
    });
  }

  useMenuForEdit(menu: any) {
    this.editMenuId = menu.id;
    this.editRestaurantId = menu.restaurantId;
    this.editName = menu.name;
  }

  updateMenu() {
    if (!this.editMenuId) {
      this.setMessage('error', 'Select a menu from the list first.');
      return;
    }

    this.proxyService.updateMenu(this.editMenuId, {
      restaurantId: Number(this.editRestaurantId),
      name: this.editName
    }).subscribe({
      next: () => {
        this.setMessage('success', 'Menu updated.');
        this.loadLists();
      },
      error: (err) => this.setMessage('error', err?.error || 'Menu update failed.')
    });
  }

  deleteMenu(id: number) {
    if (!confirm('Delete this menu?')) {
      return;
    }

    this.proxyService.deleteMenu(id).subscribe({
      next: () => {
        this.setMessage('success', 'Menu deleted.');
        this.loadLists();
      },
      error: (err) => this.setMessage('error', err?.error || 'Menu delete failed.')
    });
  }

  addDish() {
    if (!this.dishMenuId) {
      this.setMessage('error', 'Choose a menu ID for the dish.');
      return;
    }

    this.proxyService.addDishToMenu(Number(this.dishMenuId), {
      name: this.dishName,
      price: Number(this.dishPrice),
      image: this.dishImage
    }).subscribe({
      next: (result: any) => {
        this.dishName = '';
        this.dishPrice = 0;
        this.dishImage = null;
        this.setMessage('success', result?.message || 'Dish added.');
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Dish add failed.')
    });
  }

  lookupDish() {
    if (!this.lookupDishId) {
      return;
    }

    this.proxyService.getDishById(Number(this.lookupDishId)).subscribe({
      next: (data) => {
        this.selectedDish = data;
        if (!data) {
          this.setMessage('error', 'Dish not found.');
        }
      },
      error: (err) => this.setMessage('error', err?.error || 'Dish lookup failed.')
    });
  }

  removeDish() {
    if (!this.removeDishId) {
      return;
    }

    this.proxyService.removeDish(Number(this.removeDishId)).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'Dish removed.');
        if (this.selectedDish?.id === Number(this.removeDishId)) {
          this.selectedDish = null;
        }
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Dish remove failed.')
    });
  }
}
