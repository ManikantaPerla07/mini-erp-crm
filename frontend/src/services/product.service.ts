import api from "./api";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductsResponse,
  ProductResponse,
} from "../types/product";

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<ProductsResponse>("/products");

  return response.data.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ProductResponse>(`/products/${id}`);

  return response.data.data;
}

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const response = await api.post<ProductResponse>("/products", data);

  return response.data.data;
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput
): Promise<Product> {
  const response = await api.put<ProductResponse>(
    `/products/${id}`,
    data
  );

  return response.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}