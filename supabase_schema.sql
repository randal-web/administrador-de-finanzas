-- Create Debts table
create table if not exists debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for debts
alter table debts enable row level security;

create policy "Users can view their own debts"
  on debts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own debts"
  on debts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own debts"
  on debts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own debts"
  on debts for delete
  using (auth.uid() = user_id);

-- Update Subscriptions table (run this if you haven't added these columns yet)
alter table subscriptions 
add column if not exists frequency text default 'monthly',
add column if not exists status text default 'active',
add column if not exists last_payment_date timestamp with time zone;

-- Create Subscription Payments table
create table if not exists subscription_payments (
  id uuid default gen_random_uuid() primary key,
  subscription_id uuid references subscriptions(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  amount numeric not null,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for subscription_payments
alter table subscription_payments enable row level security;

create policy "Users can view their own subscription payments"
  on subscription_payments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription payments"
  on subscription_payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscription payments"
  on subscription_payments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscription payments"
  on subscription_payments for delete
  using (auth.uid() = user_id);

-- Add type column to debts
alter table debts 
add column if not exists type text default 'personal'; -- 'personal' or 'credit-card'

-- Add debt_id column to transactions
alter table transactions
add column if not exists debt_id uuid references debts(id) on delete set null;

-- Add debt_id to subscriptions table
alter table subscriptions
add column if not exists debt_id uuid references debts(id) on delete cascade;
