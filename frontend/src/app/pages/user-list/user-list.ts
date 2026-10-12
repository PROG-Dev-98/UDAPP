import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
  const state = history.state as { successMessage?: string } | null;

  this.successMessage = state?.successMessage ?? '';

  this.loadUsers();
}

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.errorMessage = 'Unable to load users. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  deleteUser(id: number): void {
    const confirmed = window.confirm(
    'Are you sure you want to delete this user?'
    );

    if (!confirmed) {
     return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully.';
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.errorMessage = 'Unable to delete the user. Please try again.';
        this.cdr.detectChanges();
        }
      });
    }
}