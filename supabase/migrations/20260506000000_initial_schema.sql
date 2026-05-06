create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in (
    'Managing Director',
    'Admin',
    'Project Manager',
    'Architect',
    'Structural Engineer',
    'MEP Engineer',
    'Site Engineer',
    'Quantity Surveyor',
    'Accountant',
    'HR',
    'Sales / Quotation Manager',
    'Employee',
    'Client Viewer'
  )),
  department text,
  designation text,
  employee_code text unique,
  status text not null default 'Active' check (status in ('Active', 'Inactive', 'On Leave', 'Terminated')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'Employee');
  if requested_role not in (
    'Managing Director',
    'Admin',
    'Project Manager',
    'Architect',
    'Structural Engineer',
    'MEP Engineer',
    'Site Engineer',
    'Quantity Surveyor',
    'Accountant',
    'HR',
    'Sales / Quotation Manager',
    'Employee',
    'Client Viewer'
  ) then
    requested_role := 'Employee';
  end if;

  insert into public.profiles (id, full_name, email, role, department, designation, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    requested_role,
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'designation',
    'Active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  head_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  project_name text not null,
  client_name text not null,
  location text not null,
  authority text,
  plot_no text,
  project_type text,
  project_manager_id uuid references public.profiles(id),
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0,
  status text not null default 'Active' check (status in ('Lead', 'Active', 'On Hold', 'Delayed', 'Completed', 'Closed', 'Cancelled')),
  overall_progress integer not null default 0 check (overall_progress between 0 and 100),
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_role text not null default 'Team Member',
  can_edit boolean not null default false,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_name text not null,
  stage_order integer not null,
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'On Hold')),
  progress integer not null default 0 check (progress between 0 and 100),
  planned_start date,
  planned_end date,
  actual_start date,
  actual_end date,
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, stage_order)
);

create or replace function public.create_default_project_stages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_stages (
    project_id,
    stage_name,
    stage_order,
    status,
    progress,
    planned_start,
    planned_end,
    assigned_to
  )
  values
    (new.id, 'Pre-Planning', 1, 'Pending', 0, new.start_date, (new.start_date + interval '21 days')::date, new.project_manager_id),
    (new.id, 'Concept Design', 2, 'Pending', 0, (new.start_date + interval '22 days')::date, (new.start_date + interval '42 days')::date, new.project_manager_id),
    (new.id, 'Schematic Design', 3, 'Pending', 0, (new.start_date + interval '43 days')::date, (new.start_date + interval '63 days')::date, new.project_manager_id),
    (new.id, 'Design Development', 4, 'Pending', 0, (new.start_date + interval '64 days')::date, (new.start_date + interval '91 days')::date, new.project_manager_id),
    (new.id, 'Detailed Design', 5, 'Pending', 0, (new.start_date + interval '92 days')::date, (new.start_date + interval '126 days')::date, new.project_manager_id),
    (new.id, 'Authority Approval', 6, 'Pending', 0, (new.start_date + interval '127 days')::date, (new.start_date + interval '168 days')::date, new.project_manager_id),
    (new.id, 'Tender & Procurement', 7, 'Pending', 0, (new.start_date + interval '169 days')::date, (new.start_date + interval '196 days')::date, new.project_manager_id),
    (new.id, 'Construction', 8, 'Pending', 0, (new.start_date + interval '197 days')::date, (new.start_date + interval '315 days')::date, new.project_manager_id),
    (new.id, 'Handover & Closeout', 9, 'Pending', 0, (new.start_date + interval '316 days')::date, new.end_date, new.project_manager_id)
  on conflict (project_id, stage_order) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_projects_default_stages on public.projects;
create trigger trg_projects_default_stages
after insert on public.projects
for each row execute function public.create_default_project_stages();

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete set null,
  task_name text not null,
  description text,
  assigned_to uuid references public.profiles(id),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Review', 'Completed', 'Pending', 'Delayed')),
  start_date date,
  due_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  attachments text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  date date not null default current_date,
  hours numeric(5,2) not null check (hours >= 0),
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  work_location text not null default 'Office' check (work_location in ('Office', 'Site', 'Work From Home')),
  status text not null default 'Present' check (status in ('Present', 'Absent', 'Late', 'Half Day', 'Leave')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  total_days numeric(5,2) not null,
  reason text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  visit_date date not null,
  site_engineer_id uuid references public.profiles(id),
  location text,
  observations text,
  action_required text,
  assigned_to uuid references public.profiles(id),
  photos text[] not null default '{}',
  status text not null default 'Scheduled' check (status in ('Scheduled', 'Completed', 'Action Pending', 'Closed')),
  next_visit_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ncr_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  raised_by uuid references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  status text not null default 'Open' check (status in ('Open', 'In Review', 'Corrective Action', 'Closed', 'Rejected')),
  corrective_action text,
  due_date date,
  closed_date date,
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  document_type text not null,
  stage_id uuid references public.project_stages(id) on delete set null,
  uploaded_by uuid references public.profiles(id),
  file_url text,
  revision_no text not null default 'R0',
  status text not null default 'Draft' check (status in ('Draft', 'Submitted', 'Approved', 'For Revision', 'Rejected', 'Archived')),
  authority_submission boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.authority_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  authority_name text not null check (authority_name in ('DCD', 'Nakheel', 'Trakhees', 'Dubai Municipality', 'DDA', 'Other')),
  submission_type text not null,
  submitted_date date,
  status text not null default 'Preparing' check (status in ('Preparing', 'Submitted', 'Under Review', 'Comments Received', 'Response Submitted', 'Approved', 'Rejected', 'NOC Issued')),
  comments text,
  response_due_date date,
  approved_date date,
  noc_status text,
  pending_action text,
  uploaded_documents text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aor_checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  checklist_item text not null,
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'Blocked')),
  assigned_to uuid references public.profiles(id),
  due_date date,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_no text not null unique,
  client_name text not null,
  project_name text not null,
  scope text,
  amount numeric(14,2) not null default 0,
  vat numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Follow-Up', 'Accepted', 'Rejected', 'LPO Pending')),
  sales_rep_id uuid references public.profiles(id),
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  project_id uuid references public.projects(id) on delete set null,
  client_name text not null,
  amount numeric(14,2) not null default 0,
  vat numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  payment_received numeric(14,2) not null default 0,
  balance numeric(14,2) generated always as (total_amount - payment_received) stored,
  status text not null default 'Draft' check (status in ('Draft', 'Issued', 'Paid', 'Overdue', 'Cancelled')),
  due_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_name text not null,
  percentage numeric(5,2) not null default 0,
  amount numeric(14,2) not null default 0,
  due_date date,
  status text not null default 'Pending' check (status in ('Pending', 'Invoiced', 'Paid', 'Overdue', 'On Hold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  project_id uuid references public.projects(id) on delete set null,
  category text not null,
  amount numeric(14,2) not null default 0,
  receipt_url text,
  status text not null default 'Submitted' check (status in ('Submitted', 'Manager Review', 'Accounts Review', 'Approved', 'Rejected', 'Paid')),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  asset_type text not null,
  assigned_to uuid references public.profiles(id),
  serial_no text,
  purchase_date date,
  status text not null default 'Available' check (status in ('Available', 'Assigned', 'Under Maintenance', 'Retired', 'Lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circulars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  category text not null default 'General' check (category in ('HR', 'IT', 'Security', 'Attendance', 'General')),
  target_department text,
  created_by uuid references public.profiles(id),
  acknowledgement_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circular_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  circular_id uuid not null references public.circulars(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique (circular_id, user_id)
);

create table if not exists public.forms_formats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  file_url text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'Info',
  read_status boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  status text not null default 'Draft' check (status in ('Draft', 'Review', 'Approved', 'Paid')),
  prepared_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid references public.payroll_runs(id) on delete cascade,
  employee_id uuid not null references public.profiles(id),
  basic_salary numeric(14,2) not null default 0,
  allowances numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  leave_deduction numeric(14,2) not null default 0,
  bonus numeric(14,2) not null default 0,
  net_salary numeric(14,2) generated always as (basic_salary + allowances + bonus - deductions - leave_deduction) stored,
  status text not null default 'Draft' check (status in ('Draft', 'Review', 'Approved', 'Paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_files (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  file_url text,
  category text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.bonuses (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null default 0,
  reason text,
  status text not null default 'Proposed' check (status in ('Proposed', 'Approved', 'Rejected', 'Paid')),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid references public.profiles(id),
  period text not null,
  rating numeric(3,1),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.document_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.authorities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_email text,
  typical_response_days integer not null default 14,
  created_at timestamptz not null default now()
);

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_manager on public.projects(project_manager_id);
create index if not exists idx_project_stages_project on public.project_stages(project_id);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_assigned on public.tasks(assigned_to);
create index if not exists idx_documents_project on public.documents(project_id);
create index if not exists idx_invoices_project on public.invoices(project_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read_status);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','projects','project_stages','tasks','attendance','leave_requests','site_visits','ncr_logs',
    'documents','authority_submissions','aor_checklists','quotations','invoices','payment_milestones',
    'expenses','assets','circulars','forms_formats','payroll_runs','payroll_items','email_templates','app_settings'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.role_in(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = any(required_roles), false)
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.role_in(array['Managing Director','Admin'])
$$;

create or replace function public.has_finance_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.role_in(array['Managing Director','Admin','Accountant'])
$$;

create or replace function public.has_hr_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.role_in(array['Managing Director','Admin','HR'])
$$;

create or replace function public.can_view_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin_role()
    or exists (
      select 1 from public.projects p
      where p.id = project_uuid and p.project_manager_id = auth.uid()
    )
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = project_uuid and pm.user_id = auth.uid()
    )
$$;

create or replace function public.can_manage_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin_role()
    or exists (
      select 1 from public.projects p
      where p.id = project_uuid and p.project_manager_id = auth.uid()
    )
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = project_uuid and pm.user_id = auth.uid() and pm.can_edit
    )
$$;

create or replace function public.notify_matching_users(target_roles text[], target_user uuid, notification_title text, notification_message text, notification_type text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, title, message, type)
  select distinct p.id, notification_title, notification_message, notification_type
  from public.profiles p
  where p.status = 'Active'
    and (p.role = any(target_roles) or (target_user is not null and p.id = target_user));
$$;

create or replace function public.handle_quotation_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status = 'Sent' then
      perform public.notify_matching_users(
        array['Managing Director','Admin','Sales / Quotation Manager'],
        new.sales_rep_id,
        'Quotation sent',
        new.quotation_no || ' for ' || new.client_name || ' has been sent and needs follow-up.',
        'Quotation'
      );
    elsif new.status = 'Accepted' then
      perform public.notify_matching_users(
        array['Managing Director','Admin','Accountant'],
        new.sales_rep_id,
        'Quotation accepted',
        new.quotation_no || ' was accepted. Accounts should prepare the advance invoice after LPO reception.',
        'Quotation'
      );
    elsif new.status = 'LPO Pending' then
      perform public.notify_matching_users(
        array['Managing Director','Admin','Sales / Quotation Manager','Accountant'],
        new.sales_rep_id,
        'LPO pending',
        new.quotation_no || ' is awaiting LPO and payment follow-up.',
        'Quotation'
      );
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.handle_task_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and (tg_op = 'INSERT' or new.assigned_to is distinct from old.assigned_to) then
    insert into public.notifications (user_id, title, message, type)
    values (new.assigned_to, 'Task assigned', new.task_name || ' has been assigned to you.', 'Task');
  end if;

  if tg_op = 'UPDATE' and new.status = 'Delayed' and new.status is distinct from old.status then
    perform public.notify_matching_users(
      array['Managing Director','Admin','Project Manager'],
      new.assigned_to,
      'Task delayed',
      new.task_name || ' is marked delayed.',
      'Task'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_quotations_notifications on public.quotations;
create trigger trg_quotations_notifications
after insert or update of status on public.quotations
for each row execute function public.handle_quotation_notifications();

drop trigger if exists trg_tasks_notifications on public.tasks;
create trigger trg_tasks_notifications
after insert or update of assigned_to, status on public.tasks
for each row execute function public.handle_task_notifications();

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_stages enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.time_logs enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.site_visits enable row level security;
alter table public.ncr_logs enable row level security;
alter table public.documents enable row level security;
alter table public.authority_submissions enable row level security;
alter table public.aor_checklists enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_milestones enable row level security;
alter table public.expenses enable row level security;
alter table public.assets enable row level security;
alter table public.circulars enable row level security;
alter table public.circular_acknowledgements enable row level security;
alter table public.forms_formats enable row level security;
alter table public.notifications enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_items enable row level security;
alter table public.employee_files enable row level security;
alter table public.bonuses enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.project_notes enable row level security;
alter table public.document_categories enable row level security;
alter table public.authorities enable row level security;
alter table public.email_templates enable row level security;
alter table public.app_settings enable row level security;

create policy "Profiles are readable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "Profiles can be inserted by admins or signup owner" on public.profiles for insert to authenticated with check (public.is_admin_role() or id = auth.uid());
create policy "Profiles can be updated by owner admins or HR" on public.profiles for update to authenticated using (id = auth.uid() or public.has_hr_access()) with check (id = auth.uid() or public.has_hr_access());

create policy "Reference settings readable" on public.departments for select to authenticated using (true);
create policy "Reference settings admin write" on public.departments for all to authenticated using (public.is_admin_role()) with check (public.is_admin_role());
create policy "Document categories readable" on public.document_categories for select to authenticated using (true);
create policy "Document categories admin write" on public.document_categories for all to authenticated using (public.is_admin_role()) with check (public.is_admin_role());
create policy "Authorities readable" on public.authorities for select to authenticated using (true);
create policy "Authorities admin write" on public.authorities for all to authenticated using (public.is_admin_role()) with check (public.is_admin_role());
create policy "Email templates admin readable" on public.email_templates for select to authenticated using (public.is_admin_role());
create policy "Email templates admin write" on public.email_templates for all to authenticated using (public.is_admin_role()) with check (public.is_admin_role());
create policy "App settings admin readable" on public.app_settings for select to authenticated using (public.is_admin_role());
create policy "App settings admin write" on public.app_settings for all to authenticated using (public.is_admin_role()) with check (public.is_admin_role());

create policy "Projects visible to assigned users" on public.projects for select to authenticated using (public.can_view_project(id));
create policy "Project managers can create projects" on public.projects for insert to authenticated with check (public.role_in(array['Managing Director','Admin','Project Manager']));
create policy "Project managers can update projects" on public.projects for update to authenticated using (public.can_manage_project(id)) with check (public.can_manage_project(id));
create policy "Admins can delete projects" on public.projects for delete to authenticated using (public.is_admin_role());

create policy "Project members visible with project" on public.project_members for select to authenticated using (public.can_view_project(project_id));
create policy "Project members manageable" on public.project_members for all to authenticated using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));

create policy "Project stages visible" on public.project_stages for select to authenticated using (public.can_view_project(project_id));
create policy "Project stages manageable" on public.project_stages for all to authenticated using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));

create policy "Tasks visible" on public.tasks for select to authenticated using (project_id is null or public.can_view_project(project_id));
create policy "Tasks can be created by project users" on public.tasks for insert to authenticated with check (
  project_id is null
  or public.can_manage_project(project_id)
  or (public.can_view_project(project_id) and not public.role_in(array['Client Viewer']))
);
create policy "Tasks can be updated by managers or assignees" on public.tasks for update to authenticated using (public.can_manage_project(project_id) or assigned_to = auth.uid() or created_by = auth.uid()) with check (public.can_manage_project(project_id) or assigned_to = auth.uid() or created_by = auth.uid());
create policy "Tasks can be deleted by managers" on public.tasks for delete to authenticated using (project_id is null or public.can_manage_project(project_id));

create policy "Task comments visible with tasks" on public.task_comments for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_id and (t.project_id is null or public.can_view_project(t.project_id))));
create policy "Task comments write with tasks" on public.task_comments for insert to authenticated with check (
  user_id = auth.uid()
  and not public.role_in(array['Client Viewer'])
  and exists (select 1 from public.tasks t where t.id = task_id and (t.project_id is null or public.can_view_project(t.project_id)))
);
create policy "Task comments owner delete" on public.task_comments for delete to authenticated using (user_id = auth.uid() or public.is_admin_role());

create policy "Time logs visible to owner manager finance" on public.time_logs for select to authenticated using (user_id = auth.uid() or public.has_finance_access() or public.can_view_project(project_id));
create policy "Time logs owner insert" on public.time_logs for insert to authenticated with check (user_id = auth.uid() or public.is_admin_role());
create policy "Time logs owner update" on public.time_logs for update to authenticated using (user_id = auth.uid() or public.is_admin_role()) with check (user_id = auth.uid() or public.is_admin_role());
create policy "Time logs manager delete" on public.time_logs for delete to authenticated using (user_id = auth.uid() or public.is_admin_role());

create policy "Attendance visible to owner HR" on public.attendance for select to authenticated using (user_id = auth.uid() or public.has_hr_access());
create policy "Attendance owner or HR insert" on public.attendance for insert to authenticated with check (user_id = auth.uid() or public.has_hr_access());
create policy "Attendance owner or HR update" on public.attendance for update to authenticated using (user_id = auth.uid() or public.has_hr_access()) with check (user_id = auth.uid() or public.has_hr_access());
create policy "Attendance HR delete" on public.attendance for delete to authenticated using (public.has_hr_access());

create policy "Leave visible to owner HR" on public.leave_requests for select to authenticated using (user_id = auth.uid() or public.has_hr_access());
create policy "Leave owner insert" on public.leave_requests for insert to authenticated with check (user_id = auth.uid() or public.has_hr_access());
create policy "Leave owner HR update" on public.leave_requests for update to authenticated using (user_id = auth.uid() or public.has_hr_access()) with check (user_id = auth.uid() or public.has_hr_access());
create policy "Leave HR delete" on public.leave_requests for delete to authenticated using (public.has_hr_access());

create policy "Site visits visible" on public.site_visits for select to authenticated using (public.can_view_project(project_id));
create policy "Site visits write" on public.site_visits for all to authenticated using (public.can_manage_project(project_id) or site_engineer_id = auth.uid() or public.role_in(array['Site Engineer'])) with check (public.can_manage_project(project_id) or site_engineer_id = auth.uid() or public.role_in(array['Site Engineer']));

create policy "NCR visible" on public.ncr_logs for select to authenticated using (public.can_view_project(project_id));
create policy "NCR write" on public.ncr_logs for all to authenticated using (public.can_manage_project(project_id) or raised_by = auth.uid() or assigned_to = auth.uid()) with check (public.can_manage_project(project_id) or raised_by = auth.uid() or assigned_to = auth.uid());

create policy "Documents visible" on public.documents for select to authenticated using (project_id is null or public.can_view_project(project_id));
create policy "Documents write" on public.documents for insert to authenticated with check (
  (project_id is null or public.can_view_project(project_id))
  and not public.role_in(array['Client Viewer'])
);
create policy "Documents update" on public.documents for update to authenticated using (
  not public.role_in(array['Client Viewer'])
  and (project_id is null or public.can_manage_project(project_id) or uploaded_by = auth.uid())
) with check (
  not public.role_in(array['Client Viewer'])
  and (project_id is null or public.can_manage_project(project_id) or uploaded_by = auth.uid())
);
create policy "Documents delete" on public.documents for delete to authenticated using (
  not public.role_in(array['Client Viewer'])
  and (project_id is null or public.can_manage_project(project_id) or uploaded_by = auth.uid())
);

create policy "Authority visible" on public.authority_submissions for select to authenticated using (public.can_view_project(project_id));
create policy "Authority write" on public.authority_submissions for all to authenticated using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));
create policy "AOR visible" on public.aor_checklists for select to authenticated using (public.can_view_project(project_id));
create policy "AOR write" on public.aor_checklists for all to authenticated using (public.can_manage_project(project_id) or assigned_to = auth.uid()) with check (public.can_manage_project(project_id) or assigned_to = auth.uid());

create policy "Quotations visible to sales finance admins" on public.quotations for select to authenticated using (public.role_in(array['Managing Director','Admin','Sales / Quotation Manager','Accountant']));
create policy "Quotations write sales admins" on public.quotations for all to authenticated using (public.role_in(array['Managing Director','Admin','Sales / Quotation Manager'])) with check (public.role_in(array['Managing Director','Admin','Sales / Quotation Manager']));

create policy "Invoices visible finance or project managers" on public.invoices for select to authenticated using (public.has_finance_access() or public.can_view_project(project_id));
create policy "Invoices finance write" on public.invoices for all to authenticated using (public.has_finance_access()) with check (public.has_finance_access());
create policy "Milestones visible with project" on public.payment_milestones for select to authenticated using (public.can_view_project(project_id));
create policy "Milestones write finance managers" on public.payment_milestones for all to authenticated using (public.has_finance_access() or public.can_manage_project(project_id)) with check (public.has_finance_access() or public.can_manage_project(project_id));

create policy "Expenses visible owner finance manager" on public.expenses for select to authenticated using (user_id = auth.uid() or public.has_finance_access() or public.can_view_project(project_id));
create policy "Expenses owner insert" on public.expenses for insert to authenticated with check (user_id = auth.uid() or public.has_finance_access());
create policy "Expenses review update" on public.expenses for update to authenticated using (user_id = auth.uid() or public.has_finance_access() or public.can_manage_project(project_id)) with check (user_id = auth.uid() or public.has_finance_access() or public.can_manage_project(project_id));
create policy "Expenses finance delete" on public.expenses for delete to authenticated using (public.has_finance_access());

create policy "Assets visible to authenticated" on public.assets for select to authenticated using (true);
create policy "Assets HR admin write" on public.assets for all to authenticated using (public.has_hr_access()) with check (public.has_hr_access());

create policy "Circulars visible by target" on public.circulars for select to authenticated using (target_department is null or target_department = (select department from public.profiles where id = auth.uid()) or public.has_hr_access());
create policy "Circulars HR write" on public.circulars for all to authenticated using (public.has_hr_access()) with check (public.has_hr_access());
create policy "Circular acknowledgement owner" on public.circular_acknowledgements for all to authenticated using (user_id = auth.uid() or public.has_hr_access()) with check (user_id = auth.uid() or public.has_hr_access());

create policy "Forms visible" on public.forms_formats for select to authenticated using (true);
create policy "Forms HR admin write" on public.forms_formats for all to authenticated using (public.has_hr_access() or public.is_admin_role()) with check (public.has_hr_access() or public.is_admin_role());

create policy "Notifications owner select" on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin_role());
create policy "Notifications authenticated insert" on public.notifications for insert to authenticated with check (true);
create policy "Notifications owner update" on public.notifications for update to authenticated using (user_id = auth.uid() or public.is_admin_role()) with check (user_id = auth.uid() or public.is_admin_role());
create policy "Notifications owner delete" on public.notifications for delete to authenticated using (user_id = auth.uid() or public.is_admin_role());

create policy "Payroll HR finance visible" on public.payroll_runs for select to authenticated using (public.has_hr_access() or public.has_finance_access());
create policy "Payroll HR finance write" on public.payroll_runs for all to authenticated using (public.has_hr_access() or public.has_finance_access()) with check (public.has_hr_access() or public.has_finance_access());
create policy "Payroll items owner HR finance visible" on public.payroll_items for select to authenticated using (employee_id = auth.uid() or public.has_hr_access() or public.has_finance_access());
create policy "Payroll items HR finance write" on public.payroll_items for all to authenticated using (public.has_hr_access() or public.has_finance_access()) with check (public.has_hr_access() or public.has_finance_access());

create policy "Employee files owner HR visible" on public.employee_files for select to authenticated using (employee_id = auth.uid() or public.has_hr_access());
create policy "Employee files HR write" on public.employee_files for all to authenticated using (public.has_hr_access()) with check (public.has_hr_access());
create policy "Bonuses owner HR visible" on public.bonuses for select to authenticated using (employee_id = auth.uid() or public.has_hr_access());
create policy "Bonuses HR write" on public.bonuses for all to authenticated using (public.has_hr_access()) with check (public.has_hr_access());
create policy "Performance owner HR visible" on public.performance_reviews for select to authenticated using (employee_id = auth.uid() or reviewer_id = auth.uid() or public.has_hr_access());
create policy "Performance HR reviewer write" on public.performance_reviews for all to authenticated using (reviewer_id = auth.uid() or public.has_hr_access()) with check (reviewer_id = auth.uid() or public.has_hr_access());

create policy "Project notes visible" on public.project_notes for select to authenticated using (public.can_view_project(project_id));
create policy "Project notes write" on public.project_notes for insert to authenticated with check (public.can_view_project(project_id) and not public.role_in(array['Client Viewer']));
create policy "Project notes owner update" on public.project_notes for update to authenticated using (created_by = auth.uid() or public.can_manage_project(project_id)) with check (created_by = auth.uid() or public.can_manage_project(project_id));
create policy "Project notes owner delete" on public.project_notes for delete to authenticated using (created_by = auth.uid() or public.can_manage_project(project_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'erp-documents',
  'erp-documents',
  true,
  52428800,
  array['application/pdf','image/png','image/jpeg','image/webp','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/csv']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "ERP documents readable" on storage.objects for select to authenticated using (bucket_id = 'erp-documents');
create policy "ERP documents uploadable" on storage.objects for insert to authenticated with check (bucket_id = 'erp-documents');
create policy "ERP documents updatable by owner" on storage.objects for update to authenticated using (bucket_id = 'erp-documents' and owner = auth.uid()) with check (bucket_id = 'erp-documents');
create policy "ERP documents deletable by owner or admin" on storage.objects for delete to authenticated using (bucket_id = 'erp-documents' and (owner = auth.uid() or public.is_admin_role()));
