  export interface Product {
    productId: number
    name: string
    code: string
    description: string | null
    categoryId: number
    photos?: Array<{ id: number; url: string; filename: string }>
    stock: number
    minStock: number
    price: string
    status: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export interface Category {
    categoryId: number
    name: string
    code: string
    description: string
    status: 1 | 0
    createdAt: Date
    updatedAt: Date
  }

  export interface Field {
    name?: string;
    label?: string;
    description?: string;
  }

  export interface CartItem extends Product {
    quantity: number
  }

  export interface ProductImage {
    id: number 
    imageId: number 
    url: string
    order: number
  }
