do $$
declare
  seed_user record;
begin
  for seed_user in
    select * from (values
      ('00000000-0000-0000-0000-00000000a001'::uuid, 'md@antcpl.ae', 'Aisha N. Thomas', 'Managing Director', 'Executive', 'Managing Director', 'ANT-001'),
      ('00000000-0000-0000-0000-00000000a002'::uuid, 'admin@antcpl.ae', 'Ravi Menon', 'Admin', 'Administration', 'ERP Administrator', 'ANT-002'),
      ('00000000-0000-0000-0000-00000000a003'::uuid, 'pm@antcpl.ae', 'Nadia Khan', 'Project Manager', 'Projects', 'Senior Project Manager', 'ANT-003'),
      ('00000000-0000-0000-0000-00000000a004'::uuid, 'architect@antcpl.ae', 'Omar Siddiqui', 'Architect', 'Architecture', 'Lead Architect', 'ANT-004'),
      ('00000000-0000-0000-0000-00000000a005'::uuid, 'structural@antcpl.ae', 'Priya Das', 'Structural Engineer', 'Structural', 'Structural Engineer', 'ANT-005'),
      ('00000000-0000-0000-0000-00000000a006'::uuid, 'mep@antcpl.ae', 'Bilal Farooq', 'MEP Engineer', 'MEP', 'MEP Engineer', 'ANT-006'),
      ('00000000-0000-0000-0000-00000000a007'::uuid, 'site@antcpl.ae', 'Sana Ibrahim', 'Site Engineer', 'Site Supervision', 'Site Engineer', 'ANT-007'),
      ('00000000-0000-0000-0000-00000000a008'::uuid, 'qs@antcpl.ae', 'Hassan Ali', 'Quantity Surveyor', 'Commercial', 'Quantity Surveyor', 'ANT-008'),
      ('00000000-0000-0000-0000-00000000a009'::uuid, 'accounts@antcpl.ae', 'Meera Joseph', 'Accountant', 'Accounts', 'Accountant', 'ANT-009'),
      ('00000000-0000-0000-0000-00000000a010'::uuid, 'hr@antcpl.ae', 'Farah Shah', 'HR', 'HR', 'HR Manager', 'ANT-010'),
      ('00000000-0000-0000-0000-00000000a011'::uuid, 'sales@antcpl.ae', 'Karim Haddad', 'Sales / Quotation Manager', 'Sales', 'Quotation Manager', 'ANT-011'),
      ('00000000-0000-0000-0000-00000000a012'::uuid, 'employee@antcpl.ae', 'Lina Mathew', 'Employee', 'Administration', 'Document Controller', 'ANT-012'),
      ('00000000-0000-0000-0000-00000000a013'::uuid, 'client@antcpl.ae', 'Client Viewer', 'Client Viewer', 'Client', 'Client Representative', 'CLIENT-001')
    ) as users(id, email, full_name, role, department, designation, employee_code)
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
      jsonb_build_object('full_name', seed_user.full_name),
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
       or (provider = 'email' and provider_id = seed_user.email);

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
    )
    on conflict (provider, provider_id) do nothing;

    insert into public.profiles (
      id,
      full_name,
      email,
      phone,
      role,
      department,
      designation,
      employee_code,
      status
    )
    values (
      seed_user.id,
      seed_user.full_name,
      seed_user.email,
      '+971 4 555 ' || right(seed_user.employee_code, 3),
      seed_user.role,
      seed_user.department,
      seed_user.designation,
      seed_user.employee_code,
      'Active'
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      role = excluded.role,
      department = excluded.department,
      designation = excluded.designation,
      employee_code = excluded.employee_code,
      status = excluded.status;
  end loop;
end $$;

insert into public.departments (name, head_id) values
  ('Executive', '00000000-0000-0000-0000-00000000a001'),
  ('Projects', '00000000-0000-0000-0000-00000000a003'),
  ('Architecture', '00000000-0000-0000-0000-00000000a004'),
  ('Structural', '00000000-0000-0000-0000-00000000a005'),
  ('MEP', '00000000-0000-0000-0000-00000000a006'),
  ('Site Supervision', '00000000-0000-0000-0000-00000000a007'),
  ('Commercial', '00000000-0000-0000-0000-00000000a008'),
  ('Accounts', '00000000-0000-0000-0000-00000000a009'),
  ('HR', '00000000-0000-0000-0000-00000000a010'),
  ('Sales', '00000000-0000-0000-0000-00000000a011')
on conflict (name) do update set head_id = excluded.head_id;

insert into public.document_categories (name) values
  ('Architectural'), ('Structural'), ('MEP'), ('Authority Submission'), ('BOQ'), ('Tender'), ('Contract'), ('Site Report'), ('Invoice'), ('Quotation'), ('Forms & Formats')
on conflict (name) do nothing;

insert into public.authorities (name, contact_email, typical_response_days) values
  ('DCD', 'submissions@dcd.gov.ae', 14),
  ('Nakheel', 'approvals@nakheel.com', 21),
  ('Trakhees', 'permits@trakhees.ae', 18),
  ('Dubai Municipality', 'dm-submissions@dm.gov.ae', 14),
  ('DDA', 'authority@dda.gov.ae', 20),
  ('Other', null, 14)
on conflict (name) do update set contact_email = excluded.contact_email, typical_response_days = excluded.typical_response_days;

delete from public.invoices where invoice_no in ('INV-ANT-2026-101', 'INV-ANT-2026-102', 'INV-ANT-2026-103');
delete from public.quotations where quotation_no in ('Q-ANT-2026-041', 'Q-ANT-2026-042', 'Q-ANT-2026-043');
delete from public.payroll_items where employee_id in (
  '00000000-0000-0000-0000-00000000a003',
  '00000000-0000-0000-0000-00000000a004',
  '00000000-0000-0000-0000-00000000a007',
  '00000000-0000-0000-0000-00000000a012'
);
delete from public.payroll_runs where month = date_trunc('month', current_date)::date;
delete from public.assets where serial_no in ('ANT-LAP-044', 'ANT-TAB-012', 'ANT-SITE-007');
delete from public.circulars where title in ('Office timing during Ramadan', 'DCD submission checklist update');
delete from public.forms_formats where title in ('Site Visit Report Format', 'NCR Format', 'Quotation Format', 'Leave Request Form');
delete from public.expenses where user_id in ('00000000-0000-0000-0000-00000000a007', '00000000-0000-0000-0000-00000000a004');
delete from public.leave_requests where user_id in ('00000000-0000-0000-0000-00000000a012', '00000000-0000-0000-0000-00000000a006');
delete from public.attendance where user_id in (
  '00000000-0000-0000-0000-00000000a003',
  '00000000-0000-0000-0000-00000000a004',
  '00000000-0000-0000-0000-00000000a007',
  '00000000-0000-0000-0000-00000000a012'
) and date = current_date;
delete from public.notifications where type in ('Quotation', 'Task');
delete from public.projects where id in (
  '10000000-0000-0000-0000-000000000026',
  '10000000-0000-0000-0000-000000000027',
  '10000000-0000-0000-0000-000000000028',
  '10000000-0000-0000-0000-000000000029',
  '10000000-0000-0000-0000-000000000030'
);

insert into public.projects (
  id,
  project_code,
  project_name,
  client_name,
  location,
  authority,
  plot_no,
  project_type,
  project_manager_id,
  start_date,
  end_date,
  budget,
  status,
  overall_progress,
  description,
  cover_image_url
) values
  ('10000000-0000-0000-0000-000000000026', 'ANT-PRJ-026', 'Tower 26', 'Al Noor Properties', 'Dubai Marina', 'Dubai Municipality', 'DM-392-26', 'Residential Tower', '00000000-0000-0000-0000-00000000a003', current_date - interval '110 days', current_date + interval '210 days', 1800000, 'Active', 68, 'AOR and multi-discipline engineering consultancy for a high-rise residential tower.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'),
  ('10000000-0000-0000-0000-000000000027', 'ANT-PRJ-027', 'Marina View', 'Blue Coast Developments', 'Jumeirah Beach Residence', 'DDA', 'JBR-118', 'Mixed Use', '00000000-0000-0000-0000-00000000a003', current_date - interval '70 days', current_date + interval '260 days', 1425000, 'Active', 42, 'Concept to authority approval package for a waterfront mixed-use development.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'),
  ('10000000-0000-0000-0000-000000000028', 'ANT-PRJ-028', 'Al Barsha Villas', 'Private Client', 'Al Barsha South', 'Dubai Municipality', 'ABS-44', 'Villa Compound', '00000000-0000-0000-0000-00000000a003', current_date - interval '45 days', current_date + interval '160 days', 620000, 'Active', 34, 'Design development and authority coordination for a premium villa cluster.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'),
  ('10000000-0000-0000-0000-000000000029', 'ANT-PRJ-029', 'City Center Mall', 'Emirates Retail Group', 'Mirdif', 'DCD', 'MRD-CC-17', 'Retail', '00000000-0000-0000-0000-00000000a003', current_date - interval '150 days', current_date + interval '120 days', 2350000, 'Delayed', 76, 'Civil Defense coordination, MEP review, and retail fit-out supervision.', 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1200&q=80'),
  ('10000000-0000-0000-0000-000000000030', 'ANT-PRJ-030', 'Emirates Office', 'Emirates Holdings', 'Business Bay', 'Trakhees', 'BB-908', 'Office Fit-Out', '00000000-0000-0000-0000-00000000a003', current_date - interval '25 days', current_date + interval '95 days', 410000, 'Active', 24, 'Fast-track office design, BOQ, tender support, and site coordination.', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80')
on conflict (id) do update set
  project_name = excluded.project_name,
  client_name = excluded.client_name,
  status = excluded.status,
  overall_progress = excluded.overall_progress,
  budget = excluded.budget,
  updated_at = now();

insert into public.project_members (project_id, user_id, project_role, can_edit)
select p.id, u.id, u.project_role, u.can_edit
from public.projects p
cross join (values
  ('00000000-0000-0000-0000-00000000a004'::uuid, 'Architect', true),
  ('00000000-0000-0000-0000-00000000a005'::uuid, 'Structural Engineer', true),
  ('00000000-0000-0000-0000-00000000a006'::uuid, 'MEP Engineer', true),
  ('00000000-0000-0000-0000-00000000a007'::uuid, 'Site Engineer', true),
  ('00000000-0000-0000-0000-00000000a008'::uuid, 'Quantity Surveyor', false),
  ('00000000-0000-0000-0000-00000000a012'::uuid, 'Document Controller', true),
  ('00000000-0000-0000-0000-00000000a013'::uuid, 'Client Viewer', false)
) as u(id, project_role, can_edit)
on conflict (project_id, user_id) do update set project_role = excluded.project_role, can_edit = excluded.can_edit;

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
select
  p.id,
  s.stage_name,
  s.stage_order,
  case
    when s.stage_order <= greatest(1, floor(p.overall_progress / 12.0)::integer) then 'Completed'
    when s.stage_order = greatest(1, floor(p.overall_progress / 12.0)::integer) + 1 then 'In Progress'
    else 'Pending'
  end,
  least(100, greatest(0, p.overall_progress - ((s.stage_order - 1) * 11))),
  (p.start_date + ((s.stage_order - 1) * interval '24 days'))::date,
  (p.start_date + (s.stage_order * interval '24 days'))::date,
  case
    when s.stage_order in (2,3,4,5) then '00000000-0000-0000-0000-00000000a004'::uuid
    when s.stage_order = 6 then '00000000-0000-0000-0000-00000000a006'::uuid
    when s.stage_order in (8,9) then '00000000-0000-0000-0000-00000000a007'::uuid
    else '00000000-0000-0000-0000-00000000a003'::uuid
  end
from public.projects p
cross join (values
  (1, 'Pre-Planning'),
  (2, 'Concept Design'),
  (3, 'Schematic Design'),
  (4, 'Design Development'),
  (5, 'Detailed Design'),
  (6, 'Authority Approval'),
  (7, 'Tender & Procurement'),
  (8, 'Construction'),
  (9, 'Handover & Closeout')
) as s(stage_order, stage_name)
on conflict (project_id, stage_order) do update set
  status = excluded.status,
  progress = excluded.progress,
  assigned_to = excluded.assigned_to;

insert into public.tasks (
  project_id,
  stage_id,
  task_name,
  description,
  assigned_to,
  priority,
  status,
  start_date,
  due_date,
  progress,
  created_by
) values
  ('10000000-0000-0000-0000-000000000026', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000026' and stage_order = 6), 'Respond to DM structural comments', 'Prepare response package and revised marked-up drawings.', '00000000-0000-0000-0000-00000000a005', 'High', 'Review', current_date - 10, current_date + 3, 82, '00000000-0000-0000-0000-00000000a003'),
  ('10000000-0000-0000-0000-000000000026', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000026' and stage_order = 7), 'Tender BOQ coordination', 'Align architectural, structural, and MEP BOQ packages.', '00000000-0000-0000-0000-00000000a008', 'Medium', 'In Progress', current_date - 5, current_date + 9, 46, '00000000-0000-0000-0000-00000000a003'),
  ('10000000-0000-0000-0000-000000000027', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000027' and stage_order = 4), 'Facade schematic update', 'Revise facade rhythm and balcony shading study.', '00000000-0000-0000-0000-00000000a004', 'Medium', 'In Progress', current_date - 3, current_date + 8, 35, '00000000-0000-0000-0000-00000000a003'),
  ('10000000-0000-0000-0000-000000000028', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000028' and stage_order = 3), 'Drainage review', 'Review villa drainage layouts for authority compliance.', '00000000-0000-0000-0000-00000000a006', 'High', 'Pending', current_date, current_date + 5, 10, '00000000-0000-0000-0000-00000000a003'),
  ('10000000-0000-0000-0000-000000000029', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000029' and stage_order = 8), 'Fire stopping inspection', 'Site verification for fire stopping and DCD compliance.', '00000000-0000-0000-0000-00000000a007', 'Critical', 'Delayed', current_date - 12, current_date - 1, 55, '00000000-0000-0000-0000-00000000a003'),
  ('10000000-0000-0000-0000-000000000030', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000030' and stage_order = 2), 'Client concept presentation', 'Prepare premium office concept package for client sign-off.', '00000000-0000-0000-0000-00000000a004', 'Medium', 'Not Started', current_date + 1, current_date + 12, 0, '00000000-0000-0000-0000-00000000a003');

insert into public.time_logs (user_id, project_id, task_id, date, hours, remarks)
select assigned_to, project_id, id, current_date - (row_number() over ())::integer, 6.5, 'Design coordination and authority response work.'
from public.tasks
where assigned_to is not null
limit 6;

insert into public.attendance (user_id, date, check_in, check_out, work_location, status, remarks) values
  ('00000000-0000-0000-0000-00000000a003', current_date, now() - interval '8 hours', null, 'Office', 'Present', 'Project coordination'),
  ('00000000-0000-0000-0000-00000000a004', current_date, now() - interval '7 hours 45 minutes', null, 'Office', 'Present', 'Design studio'),
  ('00000000-0000-0000-0000-00000000a007', current_date, now() - interval '7 hours 30 minutes', null, 'Site', 'Present', 'City Center Mall inspection'),
  ('00000000-0000-0000-0000-00000000a012', current_date, now() - interval '7 hours 10 minutes', null, 'Office', 'Late', 'Traffic delay')
on conflict (user_id, date) do update set status = excluded.status, work_location = excluded.work_location;

insert into public.leave_requests (user_id, leave_type, start_date, end_date, total_days, reason, status, approved_by) values
  ('00000000-0000-0000-0000-00000000a012', 'Annual Leave', current_date + 14, current_date + 18, 5, 'Family travel', 'Pending', null),
  ('00000000-0000-0000-0000-00000000a006', 'Sick Leave', current_date - 9, current_date - 8, 2, 'Medical rest', 'Approved', '00000000-0000-0000-0000-00000000a010');

insert into public.site_visits (project_id, visit_date, site_engineer_id, location, observations, action_required, assigned_to, status, next_visit_date) values
  ('10000000-0000-0000-0000-000000000029', current_date - 2, '00000000-0000-0000-0000-00000000a007', 'Mirdif site', 'Fire stopping incomplete at service shafts on Level 2.', 'Contractor to submit corrective action photos.', '00000000-0000-0000-0000-00000000a007', 'Action Pending', current_date + 5),
  ('10000000-0000-0000-0000-000000000026', current_date + 4, '00000000-0000-0000-0000-00000000a007', 'Dubai Marina', 'Scheduled slab coordination inspection.', 'Coordinate with contractor and PM.', '00000000-0000-0000-0000-00000000a003', 'Scheduled', current_date + 11);

insert into public.ncr_logs (project_id, title, description, severity, raised_by, assigned_to, status, corrective_action, due_date) values
  ('10000000-0000-0000-0000-000000000029', 'Fire stopping material mismatch', 'Installed sealant does not match approved DCD submittal.', 'Critical', '00000000-0000-0000-0000-00000000a007', '00000000-0000-0000-0000-00000000a006', 'Corrective Action', 'Replace material and submit inspection evidence.', current_date + 4),
  ('10000000-0000-0000-0000-000000000026', 'Shop drawing revision pending', 'Facade bracket detail revision not uploaded.', 'Medium', '00000000-0000-0000-0000-00000000a003', '00000000-0000-0000-0000-00000000a004', 'Open', null, current_date + 8);

insert into public.documents (project_id, title, document_type, stage_id, uploaded_by, file_url, revision_no, status, authority_submission) values
  ('10000000-0000-0000-0000-000000000026', 'Tower 26 DM Submission Set', 'Authority Submission', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000026' and stage_order = 6), '00000000-0000-0000-0000-00000000a012', null, 'R2', 'Submitted', true),
  ('10000000-0000-0000-0000-000000000027', 'Marina View Concept Pack', 'Architectural', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000027' and stage_order = 2), '00000000-0000-0000-0000-00000000a004', null, 'R1', 'Approved', false),
  ('10000000-0000-0000-0000-000000000029', 'DCD Fire Safety Comments', 'Authority Submission', (select id from public.project_stages where project_id = '10000000-0000-0000-0000-000000000029' and stage_order = 6), '00000000-0000-0000-0000-00000000a006', null, 'R0', 'For Revision', true);

insert into public.authority_submissions (project_id, authority_name, submission_type, submitted_date, status, comments, response_due_date, approved_date, noc_status, pending_action) values
  ('10000000-0000-0000-0000-000000000026', 'Dubai Municipality', 'Building Permit', current_date - 18, 'Comments Received', 'Structural calculation clarification required.', current_date + 5, null, 'Pending', 'Upload revised calculations and response letter.'),
  ('10000000-0000-0000-0000-000000000029', 'DCD', 'Fire Life Safety', current_date - 31, 'Under Review', 'Awaiting DCD response on amended fire strategy.', current_date + 7, null, 'Pending', 'Follow up with authority desk.'),
  ('10000000-0000-0000-0000-000000000030', 'Trakhees', 'Fit-Out NOC', current_date - 6, 'Submitted', null, current_date + 12, null, 'Pending', 'Track initial review.');

insert into public.aor_checklists (project_id, checklist_item, status, assigned_to, due_date, remarks)
select '10000000-0000-0000-0000-000000000026'::uuid, item, status, assignee, current_date + offset_days, remarks
from (values
  ('Review Architectural drawings for authority compliance', 'Completed', '00000000-0000-0000-0000-00000000a004'::uuid, -7, 'Reviewed and comments closed.'),
  ('Review drainage drawings', 'In Progress', '00000000-0000-0000-0000-00000000a006'::uuid, 4, 'Drainage levels under review.'),
  ('Review water supply drawings', 'Pending', '00000000-0000-0000-0000-00000000a006'::uuid, 8, null),
  ('Review Civil Defense drawings', 'In Progress', '00000000-0000-0000-0000-00000000a006'::uuid, 5, 'Coordination with DCD checklist.'),
  ('Review HVAC drawings', 'Pending', '00000000-0000-0000-0000-00000000a006'::uuid, 10, null),
  ('Prepare authority submission documents', 'Completed', '00000000-0000-0000-0000-00000000a012'::uuid, -2, 'Package issued.'),
  ('Submit to authorities', 'Completed', '00000000-0000-0000-0000-00000000a003'::uuid, -1, 'DM portal submission done.'),
  ('Track NOCs', 'In Progress', '00000000-0000-0000-0000-00000000a003'::uuid, 14, 'Weekly follow-up required.'),
  ('Address authority comments', 'In Progress', '00000000-0000-0000-0000-00000000a005'::uuid, 5, 'Structural response pending.'),
  ('Obtain final approvals', 'Pending', '00000000-0000-0000-0000-00000000a003'::uuid, 35, null)
) as checklist(item, status, assignee, offset_days, remarks);

insert into public.quotations (quotation_no, client_name, project_name, scope, amount, vat, total_amount, status, sales_rep_id, follow_up_date) values
  ('Q-ANT-2026-041', 'Al Noor Properties', 'Tower 26 Phase 2', 'AOR consultancy and authority submission support', 265000, 13250, 278250, 'Accepted', '00000000-0000-0000-0000-00000000a011', current_date + 2),
  ('Q-ANT-2026-042', 'Blue Coast Developments', 'Marina View Retail Podium', 'Architecture, structural, MEP coordination, and tender package', 340000, 17000, 357000, 'Sent', '00000000-0000-0000-0000-00000000a011', current_date + 1),
  ('Q-ANT-2026-043', 'Emirates Holdings', 'Office Expansion', 'Fit-out design and Trakhees approval services', 125000, 6250, 131250, 'LPO Pending', '00000000-0000-0000-0000-00000000a011', current_date + 3)
on conflict (quotation_no) do update set status = excluded.status, total_amount = excluded.total_amount;

insert into public.invoices (invoice_no, project_id, client_name, amount, vat, total_amount, payment_received, status, due_date, created_by) values
  ('INV-ANT-2026-101', '10000000-0000-0000-0000-000000000026', 'Al Noor Properties', 180000, 9000, 189000, 189000, 'Paid', current_date - 12, '00000000-0000-0000-0000-00000000a009'),
  ('INV-ANT-2026-102', '10000000-0000-0000-0000-000000000029', 'Emirates Retail Group', 220000, 11000, 231000, 80000, 'Issued', current_date + 9, '00000000-0000-0000-0000-00000000a009'),
  ('INV-ANT-2026-103', '10000000-0000-0000-0000-000000000030', 'Emirates Holdings', 50000, 2500, 52500, 0, 'Draft', current_date + 18, '00000000-0000-0000-0000-00000000a009')
on conflict (invoice_no) do update set status = excluded.status, payment_received = excluded.payment_received;

insert into public.payment_milestones (project_id, milestone_name, percentage, amount, due_date, status) values
  ('10000000-0000-0000-0000-000000000026', 'Advance on appointment', 10, 180000, current_date - 40, 'Paid'),
  ('10000000-0000-0000-0000-000000000026', 'Authority submission', 20, 360000, current_date + 8, 'Invoiced'),
  ('10000000-0000-0000-0000-000000000027', 'Concept approval', 15, 213750, current_date + 12, 'Pending'),
  ('10000000-0000-0000-0000-000000000029', 'DCD approval milestone', 20, 470000, current_date + 15, 'Pending');

insert into public.expenses (user_id, project_id, category, amount, receipt_url, status, approved_by) values
  ('00000000-0000-0000-0000-00000000a007', '10000000-0000-0000-0000-000000000029', 'Site expenses', 180, null, 'Manager Review', null),
  ('00000000-0000-0000-0000-00000000a004', '10000000-0000-0000-0000-000000000027', 'Transport expenses', 95, null, 'Approved', '00000000-0000-0000-0000-00000000a003');

insert into public.assets (asset_name, asset_type, assigned_to, serial_no, purchase_date, status) values
  ('Dell Precision Laptop', 'Laptop', '00000000-0000-0000-0000-00000000a004', 'ANT-LAP-044', current_date - 390, 'Assigned'),
  ('iPad Site Tablet', 'Tablet', '00000000-0000-0000-0000-00000000a007', 'ANT-TAB-012', current_date - 210, 'Assigned'),
  ('Total Station Kit', 'Site Equipment', null, 'ANT-SITE-007', current_date - 620, 'Available');

insert into public.circulars (title, message, category, target_department, created_by, acknowledgement_required) values
  ('Office timing during Ramadan', 'Office attendance timing will be 9:00 AM to 3:00 PM unless project site duty requires otherwise.', 'Attendance', null, '00000000-0000-0000-0000-00000000a010', true),
  ('DCD submission checklist update', 'Use the latest Civil Defense checklist for all new authority packages effective immediately.', 'General', 'MEP', '00000000-0000-0000-0000-00000000a003', true);

insert into public.forms_formats (title, category, file_url, uploaded_by) values
  ('Site Visit Report Format', 'Site visit format', null, '00000000-0000-0000-0000-00000000a012'),
  ('NCR Format', 'NCR format', null, '00000000-0000-0000-0000-00000000a012'),
  ('Quotation Format', 'Quotation format', null, '00000000-0000-0000-0000-00000000a011'),
  ('Leave Request Form', 'Leave forms', null, '00000000-0000-0000-0000-00000000a010');

insert into public.payroll_runs (month, status, prepared_by) values
  (date_trunc('month', current_date)::date, 'Review', '00000000-0000-0000-0000-00000000a010')
on conflict do nothing;

insert into public.payroll_items (payroll_run_id, employee_id, basic_salary, allowances, deductions, leave_deduction, bonus, status)
select pr.id, p.id, salary.basic_salary, salary.allowances, salary.deductions, salary.leave_deduction, salary.bonus, 'Review'
from public.payroll_runs pr
cross join (values
  ('00000000-0000-0000-0000-00000000a003'::uuid, 26000, 5500, 0, 0, 1500),
  ('00000000-0000-0000-0000-00000000a004'::uuid, 22000, 4500, 0, 0, 1000),
  ('00000000-0000-0000-0000-00000000a007'::uuid, 14000, 3000, 0, 0, 500),
  ('00000000-0000-0000-0000-00000000a012'::uuid, 9000, 1800, 0, 450, 0)
) as salary(employee_id, basic_salary, allowances, deductions, leave_deduction, bonus)
join public.profiles p on p.id = salary.employee_id
where pr.month = date_trunc('month', current_date)::date;

insert into public.project_notes (project_id, note, created_by) values
  ('10000000-0000-0000-0000-000000000026', 'Client requested weekly authority status snapshot every Friday.', '00000000-0000-0000-0000-00000000a003'),
  ('10000000-0000-0000-0000-000000000029', 'DCD comments should be escalated if no response by next review date.', '00000000-0000-0000-0000-00000000a006');

insert into public.email_templates (template_key, subject, body) values
  ('quotation_sent', 'Quotation {{quotation_no}} sent', 'Dear team, quotation {{quotation_no}} has been sent and requires follow-up.'),
  ('quotation_accepted', 'Quotation {{quotation_no}} accepted', 'Accounts team, please prepare advance invoice after LPO reception.'),
  ('task_overdue', 'Task overdue: {{task_name}}', 'Please update the delayed task and next action.')
on conflict (template_key) do update set subject = excluded.subject, body = excluded.body;

insert into public.app_settings (setting_key, setting_value) values
  ('company_profile', '{"companyName":"ANTCPL","fullName":"A N T Engineering Consultants","location":"Dubai, UAE","currency":"AED","vatRate":5}'::jsonb),
  ('project_stages', '["Pre-Planning","Concept Design","Schematic Design","Design Development","Detailed Design","Authority Approval","Tender & Procurement","Construction","Handover & Closeout"]'::jsonb)
on conflict (setting_key) do update set setting_value = excluded.setting_value, updated_at = now();
