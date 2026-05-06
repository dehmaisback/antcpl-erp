-- Run this if seeded users show "Database error querying schema" on login.
-- It rebuilds only the Supabase Auth rows for the sample ANTCPL accounts.

create extension if not exists pgcrypto;

do $$
declare
  seed_user record;
begin
  for seed_user in
    select * from (values
      ('00000000-0000-0000-0000-00000000a001'::uuid, 'md@antcpl.ae', 'Aisha N. Thomas', 'Managing Director', 'Executive', 'Managing Director'),
      ('00000000-0000-0000-0000-00000000a002'::uuid, 'admin@antcpl.ae', 'Ravi Menon', 'Admin', 'Administration', 'ERP Administrator'),
      ('00000000-0000-0000-0000-00000000a003'::uuid, 'pm@antcpl.ae', 'Nadia Khan', 'Project Manager', 'Projects', 'Senior Project Manager'),
      ('00000000-0000-0000-0000-00000000a004'::uuid, 'architect@antcpl.ae', 'Omar Siddiqui', 'Architect', 'Architecture', 'Lead Architect'),
      ('00000000-0000-0000-0000-00000000a005'::uuid, 'structural@antcpl.ae', 'Priya Das', 'Structural Engineer', 'Structural', 'Structural Engineer'),
      ('00000000-0000-0000-0000-00000000a006'::uuid, 'mep@antcpl.ae', 'Bilal Farooq', 'MEP Engineer', 'MEP', 'MEP Engineer'),
      ('00000000-0000-0000-0000-00000000a007'::uuid, 'site@antcpl.ae', 'Sana Ibrahim', 'Site Engineer', 'Site Supervision', 'Site Engineer'),
      ('00000000-0000-0000-0000-00000000a008'::uuid, 'qs@antcpl.ae', 'Hassan Ali', 'Quantity Surveyor', 'Commercial', 'Quantity Surveyor'),
      ('00000000-0000-0000-0000-00000000a009'::uuid, 'accounts@antcpl.ae', 'Meera Joseph', 'Accountant', 'Accounts', 'Accountant'),
      ('00000000-0000-0000-0000-00000000a010'::uuid, 'hr@antcpl.ae', 'Farah Shah', 'HR', 'HR', 'HR Manager'),
      ('00000000-0000-0000-0000-00000000a011'::uuid, 'sales@antcpl.ae', 'Karim Haddad', 'Sales / Quotation Manager', 'Sales', 'Quotation Manager'),
      ('00000000-0000-0000-0000-00000000a012'::uuid, 'employee@antcpl.ae', 'Lina Mathew', 'Employee', 'Administration', 'Document Controller'),
      ('00000000-0000-0000-0000-00000000a013'::uuid, 'client@antcpl.ae', 'Client Viewer', 'Client Viewer', 'Client', 'Client Representative')
    ) as users(id, email, full_name, role, department, designation)
  loop
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      seed_user.id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      seed_user.email,
      crypt('Password123!', gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', seed_user.full_name,
        'role', seed_user.role,
        'department', seed_user.department,
        'designation', seed_user.designation
      ),
      now(),
      now()
    )
    on conflict (id) do update set
      email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = now(),
      confirmation_token = '',
      recovery_token = '',
      email_change = '',
      email_change_token_new = '',
      raw_app_meta_data = excluded.raw_app_meta_data,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = now();

    delete from auth.identities
    where user_id = seed_user.id
       or (provider = 'email' and provider_id in (seed_user.id::text, seed_user.email));

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      seed_user.id,
      seed_user.id,
      seed_user.id::text,
      jsonb_build_object(
        'sub', seed_user.id::text,
        'email', seed_user.email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );

    insert into public.profiles (id, full_name, email, role, department, designation, status)
    values (seed_user.id, seed_user.full_name, seed_user.email, seed_user.role, seed_user.department, seed_user.designation, 'Active')
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      role = excluded.role,
      department = excluded.department,
      designation = excluded.designation,
      status = excluded.status;
  end loop;
end $$;

update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, '')
where email in (
  'md@antcpl.ae',
  'admin@antcpl.ae',
  'pm@antcpl.ae',
  'architect@antcpl.ae',
  'structural@antcpl.ae',
  'mep@antcpl.ae',
  'site@antcpl.ae',
  'qs@antcpl.ae',
  'accounts@antcpl.ae',
  'hr@antcpl.ae',
  'sales@antcpl.ae',
  'employee@antcpl.ae',
  'client@antcpl.ae'
);
