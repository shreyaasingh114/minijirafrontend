import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = +id;
        this.loadUserForEditing(this.userId);
      }
    });
  }

  private loadUserForEditing(id: number): void {
    this.loading = true;
    this.error = null;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.form.value;
    const user: User = {
      id: this.userId || 0,
      name: formValue.name,
      email: formValue.email,
      createdAt: new Date()
    };

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, user).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error('Error saving user:', err);
          this.error = 'Failed to save user. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.userService.createUser(user).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error('Error saving user:', err);
          this.error = 'Failed to save user. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
