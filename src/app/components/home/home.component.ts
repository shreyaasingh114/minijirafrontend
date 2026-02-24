import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { TaskItem } from '../../models/task-item.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);

  tasks: TaskItem[] = [];
  filteredTasks: TaskItem[] = [];
  users: User[] = [];
  userMap: Map<number, string> = new Map();
  loading = false;
  error: string | null = null;

  selectedFilter: 'All' | 'ToDo' | 'InProgress' | 'Done' = 'All';
  
  filterOptions: Array<{label: string, value: 'All' | 'ToDo' | 'InProgress' | 'Done', icon: string, color: string}> = [
    { label: 'All', value: 'All', icon: '📋', color: 'all' },
    { label: 'To Do', value: 'ToDo', icon: '📝', color: 'todo' },
    { label: 'In Progress', value: 'InProgress', icon: '⚙️', color: 'inprogress' },
    { label: 'Done', value: 'Done', icon: '✅', color: 'done' }
  ];

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        data.forEach(user => {
          this.userMap.set(user.id, user.name);
        });
        this.loadTasks();
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.loadTasks();
      }
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading tasks:', err);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  selectFilter(filter: 'All' | 'ToDo' | 'InProgress' | 'Done'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'All') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === this.selectedFilter);
    }
  }

  getAssigneeName(assigneeId: number | null): string {
    if (!assigneeId) return '-';
    return this.userMap.get(assigneeId) || '-';
  }

  getAssigneeInitials(assigneeId: number | null): string {
    if (!assigneeId) return '?';
    const name = this.userMap.get(assigneeId);
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getTaskCountByFilter(filter: string): number {
    if (filter === 'All') {
      return this.tasks.length;
    }
    return this.tasks.filter(task => task.status === filter).length;
  }
}
