-- Wallet list. Unowned rows (no accounts). Unique on normalized wallet.
create table if not exists submissions (
  id          serial primary key,
  wallet      text not null,
  preference  text not null check (preference in ('GTD', 'WL')),
  created_at  timestamptz not null default now()
);

create unique index if not exists submissions_wallet_idx on submissions (wallet);
