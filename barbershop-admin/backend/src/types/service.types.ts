export interface CreateServiceInput {
  tenantId: string;
  employeeId: string;
  serviceTypeId?: string;
  clientName: string;
  clientPhone?: string;
  price: number;
  notes?: string;
}

export interface UpdateServiceInput {
  employeeId?: string;
  serviceTypeId?: string | null;
  clientName?: string;
  clientPhone?: string;
  price?: number;
  notes?: string;
}

export interface ServiceFilters {
  tenantId?: string;
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
  clientName?: string;
}

export interface ServiceWithDetails {
  id: string;
  employeeId: string;
  serviceTypeId: string | null;
  clientName: string;
  clientPhone: string | null;
  price: any;
  commissionRate: any;
  commissionAmount: any;
  serviceDate: Date;
  notes: string | null;
  createdAt: Date;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  serviceType: {
    id: string;
    name: string;
  } | null;
}

export interface CreateServiceTypeInput {
  tenantId: string;
  name: string;
  description?: string;
  defaultPrice: number;
  durationMinutes?: number;
}

export interface UpdateServiceTypeInput {
  name?: string;
  description?: string;
  defaultPrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
}
