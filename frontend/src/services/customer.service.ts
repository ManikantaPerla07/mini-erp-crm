import api from "./api";
import type {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomersResponse,
  CustomerResponse,
  DeleteCustomerResponse,
} from "../types/customer";

export async function getCustomers(): Promise<Customer[]> {
  const response = await api.get<CustomersResponse>("/customers");

  return response.data.data;
}

export async function getCustomerById(
  id: string
): Promise<Customer> {
  const response = await api.get<CustomerResponse>(
    `/customers/${id}`
  );

  return response.data.data;
}

export async function createCustomer(
  data: CreateCustomerPayload
): Promise<Customer> {
  const response = await api.post<CustomerResponse>(
    "/customers",
    data
  );

  return response.data.data;
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerPayload
): Promise<Customer> {
  const response = await api.put<CustomerResponse>(
    `/customers/${id}`,
    data
  );

  return response.data.data;
}

export async function deleteCustomer(
  id: string
): Promise<DeleteCustomerResponse> {
  const response =
    await api.delete<DeleteCustomerResponse>(
      `/customers/${id}`
    );

  return response.data;
}