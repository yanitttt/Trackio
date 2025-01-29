export interface Product {
  id: string;
  name: string;
  description: string;
}

export interface Consumption {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  note?: string;
}

export interface DailyConsumption {
  date: string;
  total: number;
  products: {
    [key: string]: number;
  };
}