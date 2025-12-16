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
