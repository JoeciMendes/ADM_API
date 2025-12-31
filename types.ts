
export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
}

export enum DashboardView {
  OVERVIEW = 'OVERVIEW',
  REQUESTS = 'REQUESTS',
  REPORTS = 'REPORTS',
  ADMIN = 'ADMIN',
  SETTINGS = 'SETTINGS',
}

export interface Task {
  id: number;
  title: string;
  time: string;
  isNew?: boolean;
}

export interface RequestEntry {
  id: string;
  method: string;
  endpoint: string;
  type: string;
  status: number;
  timestamp: string;
  latency: string;
  expectedDate: string;
  attendedOnTime: boolean;
  fulfillmentStatus: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
}

export interface AppState {
  isDarkMode: boolean;
  currentPage: Page;
  currentView: DashboardView;
  user: string | null;
  isLogoutModalOpen: boolean;
}
