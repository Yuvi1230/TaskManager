export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}
