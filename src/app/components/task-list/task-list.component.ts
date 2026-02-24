import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { TaskItem } from '../../models/task-item.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  tasks: TaskItem[] = [];
  users: User[] = [];
  userMap: Map<number, string> = new Map();
  loading = false;
  error: string | null = null;

  statusOptions = ['ToDo', 'InProgress', 'Done'];

  getTasksByStatus(status: string): TaskItem[] {
    return this.tasks.filter(task => task.status === status);
  }

  getAssigneeInitials(assigneeId: number | null): string {
    if (!assigneeId) return '?';
    const name = this.userMap.get(assigneeId);
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  ngOnInit(): void {
    // Load users first, then tasks
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        // Create a map of user ID -> name for quick lookup
        data.forEach(user => {
          this.userMap.set(user.id, user.name);
        });
        this.loadTasks();
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.loadTasks(); // Still load tasks even if users fail
      }
    });
  }

  getAssigneeName(assigneeId: number | null): string {
    if (!assigneeId) return '-';
    return this.userMap.get(assigneeId) || '-';
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        console.log('All tasks loaded:', data);
        data.forEach(task => {
          if (task.assigneeId) {
            console.log(`Task ${task.id} (${task.title}) has assigneeId: ${task.assigneeId}`);
          }
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading tasks:', err);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          this.error = 'Failed to delete task. Please try again.';
        }
      });
    }
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/tasks/edit', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/tasks/new']);
  }
}
