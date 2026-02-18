export interface CreateEmployeeInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  commissionRate: number;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  commissionRate?: number;
  isActive?: boolean;
}

export interface EmployeeFilters {
  isActive?: boolean;
  search?: string;
}

export interface EmployeeEarningsFilters {
  startDate?: Date;
  endDate?: Date;
  period?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

export interface EmployeeEarnings {
  employeeId: string;
  employeeName: string;
  totalServices: number;
  totalRevenue: number;
  totalCommission: number;
  salonEarnings: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface EmployeeWithUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  photoUrl: string | null;
  commissionRate: number;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
