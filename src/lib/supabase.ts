import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Business {
  id: string
  name: string
  owner_id: string
  email?: string
  phone?: string
  address?: string
  gst_number?: string
  subscription_plan: 'free' | 'premium' | 'enterprise'
  subscription_expires_at?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  business_id: string
  name: string
  description?: string
  price: number
  cost_price?: number
  wholesale_price?: number
  stock_quantity: number
  low_stock_threshold: number
  barcode?: string
  category?: string
  brand?: string
  unit?: string
  tax_rate?: number
  supplier?: string
  location?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  business_id: string
  name: string
  phone?: string
  email?: string
  address?: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  business_id: string
  customer_id?: string
  total_amount: number
  discount?: number
  tax_amount?: number
  payment_method: 'cash' | 'card' | 'upi' | 'credit'
  payment_status: 'pending' | 'paid' | 'partial'
  status: 'draft' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}
