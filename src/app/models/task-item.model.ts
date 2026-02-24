import { User } from './user.model';

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: 'ToDo' | 'InProgress' | 'Done';
  assigneeId: number | null;
  assignee?: User | null;
  createdAt: Date;
}
