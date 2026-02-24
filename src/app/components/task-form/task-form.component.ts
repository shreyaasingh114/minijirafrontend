import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { TaskItem } from '../../models/task-item.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;
  users: User[] = [];

  statusOptions = ['ToDo', 'InProgress', 'Done'];

  ngOnInit(): void {
    this.initializeForm();
    // Load users first, then check for edit mode after users are loaded
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.checkEditMode();
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.checkEditMode();
      }
    });
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['ToDo', Validators.required],
      assigneeId: [null]
    });
  }

  private checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.taskId = +id;
        this.loadTaskForEditing(this.taskId);
      }
    });
  }

  private loadTaskForEditing(id: number): void {
    this.loading = true;
    this.error = null;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        console.log('Task loaded:', task);
        console.log('Task assigneeId:', task.assigneeId);
        console.log('Available users:', this.users);

        this.form.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          assigneeId: task.assigneeId ?? null
        });
        
        console.log('Form value after patch:', this.form.value);
        console.log('Assignee control value:', this.form.get('assigneeId')?.value);
        
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading task:', err);
        this.error = 'Failed to load task. Please try again.';
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
    const assigneeId = formValue.assigneeId !== null && formValue.assigneeId !== undefined
      ? Number(formValue.assigneeId)
      : null;
    
    const task: TaskItem = {
      id: this.taskId || 0,
      title: formValue.title,
      description: formValue.description || null,
      status: formValue.status,
      assigneeId,
      createdAt: new Date()
    };

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, task).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/tasks']);
        },
        error: (err: any) => {
          console.error('Error saving task:', err);
          this.error = 'Failed to save task. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.taskService.createTask(task).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/tasks']);
        },
        error: (err: any) => {
          console.error('Error saving task:', err);
          this.error = 'Failed to save task. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
