-- 001_foundation.sql — Core tables for APEX-CODE
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','team','enterprise')),
  plan_status text NOT NULL DEFAULT 'active' CHECK (plan_status IN ('active','trialing','past_due','canceled','paused')),
  monthly_token_limit bigint DEFAULT 100000,
  tokens_used_this_month bigint DEFAULT 0,
  token_reset_date date DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  github_username text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  language text DEFAULT 'typescript',
  framework text,
  system_prompt text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  title text DEFAULT 'New conversation',
  model text NOT NULL DEFAULT 'kimi-k2.5',
  mode text NOT NULL DEFAULT 'instant' CHECK (mode IN ('instant','thinking')),
  total_input_tokens bigint DEFAULT 0,
  total_output_tokens bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content text NOT NULL,
  reasoning_content text,
  model text,
  input_tokens int DEFAULT 0,
  output_tokens int DEFAULT 0,
  task_type text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  language text NOT NULL,
  code text NOT NULL,
  stdout text,
  stderr text,
  exit_code int,
  runtime_ms int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
