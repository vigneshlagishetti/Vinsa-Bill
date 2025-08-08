-- Create businesses table
create table businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id text not null, -- Clerk user ID
  email text,
  phone text,
  address text,
  gst_number text,
  subscription_plan text default 'free' check (subscription_plan in ('free', 'premium', 'enterprise')),
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null default 0,
  wholesale_price decimal(10,2),
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 10,
  barcode text unique,
  category text,
  unit text default 'pcs',
  tax_rate decimal(5,2) default 18.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create customers table
create table customers (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  balance decimal(10,2) default 0,
  credit_limit decimal(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  order_number text not null,
  total_amount decimal(10,2) not null default 0,
  discount decimal(10,2) default 0,
  tax_amount decimal(10,2) default 0,
  payment_method text check (payment_method in ('cash', 'card', 'upi', 'credit')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'partial')),
  status text default 'completed' check (status in ('draft', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create order_items table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  created_at timestamptz default now()
);

-- Create RLS policies
alter table businesses enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Businesses policies
create policy "Users can view their own business"
  on businesses for select
  using (auth.jwt() ->> 'sub' = owner_id);

create policy "Users can insert their own business"
  on businesses for insert
  with check (auth.jwt() ->> 'sub' = owner_id);

create policy "Users can update their own business"
  on businesses for update
  using (auth.jwt() ->> 'sub' = owner_id);

-- Products policies
create policy "Users can view their business products"
  on products for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = products.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can insert products to their business"
  on products for insert
  with check (
    exists (
      select 1 from businesses
      where businesses.id = products.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can update their business products"
  on products for update
  using (
    exists (
      select 1 from businesses
      where businesses.id = products.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

-- Customers policies
create policy "Users can view their business customers"
  on customers for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = customers.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can insert customers to their business"
  on customers for insert
  with check (
    exists (
      select 1 from businesses
      where businesses.id = customers.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can update their business customers"
  on customers for update
  using (
    exists (
      select 1 from businesses
      where businesses.id = customers.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

-- Orders policies
create policy "Users can view their business orders"
  on orders for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = orders.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can insert orders to their business"
  on orders for insert
  with check (
    exists (
      select 1 from businesses
      where businesses.id = orders.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can update their business orders"
  on orders for update
  using (
    exists (
      select 1 from businesses
      where businesses.id = orders.business_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

-- Order items policies
create policy "Users can view order items for their business orders"
  on order_items for select
  using (
    exists (
      select 1 from orders
      join businesses on businesses.id = orders.business_id
      where orders.id = order_items.order_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can insert order items to their business orders"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      join businesses on businesses.id = orders.business_id
      where orders.id = order_items.order_id
      and businesses.owner_id = auth.jwt() ->> 'sub'
    )
  );

-- Create indexes for performance
create index idx_businesses_owner_id on businesses(owner_id);
create index idx_products_business_id on products(business_id);
create index idx_products_barcode on products(barcode);
create index idx_customers_business_id on customers(business_id);
create index idx_orders_business_id on orders(business_id);
create index idx_orders_customer_id on orders(customer_id);
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);

-- Create triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_businesses_updated_at before update on businesses for each row execute function update_updated_at_column();
create trigger update_products_updated_at before update on products for each row execute function update_updated_at_column();
create trigger update_customers_updated_at before update on customers for each row execute function update_updated_at_column();
create trigger update_orders_updated_at before update on orders for each row execute function update_updated_at_column();
