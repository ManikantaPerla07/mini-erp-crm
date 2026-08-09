export type CustomerType =
  | "RETAIL"
  | "WHOLESALE"
  | "DISTRIBUTOR";

export type CustomerStatus =
  | "LEAD"
  | "ACTIVE"
  | "INACTIVE";

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  customerName: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
}

export type UpdateCustomerPayload =
  Partial<CreateCustomerPayload>;

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
}

export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
}