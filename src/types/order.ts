export interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  lessonDate?: string;
  productId: string;
  productName: string;
  selectedOptions: Record<string, string>;
  amount: number;
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface Order {
  id: string;
  order_id: string;
  payment_key?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  lesson_date?: string;
  product_id: string;
  product_name: string;
  selected_options: Record<string, string>;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface PaymentLog {
  id: string;
  order_id: string;
  payment_key?: string;
  method?: string;
  approved_at?: string;
  receipt_url?: string;
  raw_response: Record<string, unknown>;
  created_at: string;
}
