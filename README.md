# ANTCPL ERP

A full working ERP MVP for **A N T Engineering Consultants / ANTCPL**, an engineering consultancy in Dubai, UAE.

The app is built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Storage, and RLS
- Recharts
- Lucide icons

## Modules

The sidebar includes working pages for:

Dashboard, Projects, Tasks, Time Tracking, Attendance, Site Visits, Quality / NCR, Documents, Quotations, Invoices, Payments, HR, Leave & EOS, Payroll, Expenses, Assets, Forms & Formats, Circulars, Reports, and Settings.

## Supabase Setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run:

   - `supabase/migrations/20260506000000_initial_schema.sql`
   - `supabase/seed.sql`

3. Create `.env.local` from `.env.local.example`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Seed Users

All seed users use this password:

```text
Password123!
```

Examples:

- `md@antcpl.ae` - Managing Director
- `admin@antcpl.ae` - Admin
- `pm@antcpl.ae` - Project Manager
- `architect@antcpl.ae` - Architect
- `site@antcpl.ae` - Site Engineer
- `accounts@antcpl.ae` - Accountant
- `hr@antcpl.ae` - HR
- `sales@antcpl.ae` - Sales / Quotation Manager
- `client@antcpl.ae` - Client Viewer

## Sample Projects

The seed file creates:

- Tower 26
- Marina View
- Al Barsha Villas
- City Center Mall
- Emirates Office

Each project includes default consultancy stages:

1. Pre-Planning
2. Concept Design
3. Schematic Design
4. Design Development
5. Detailed Design
6. Authority Approval
7. Tender & Procurement
8. Construction
9. Handover & Closeout

## Storage

The migration creates a public Supabase Storage bucket named `erp-documents`.

Upload-enabled forms use this bucket for:

- Project documents
- Task attachments
- Site visit photos
- NCR photos
- Expense receipts
- Forms and formats

## Role-Based Access

RLS policies are included for all major tables.

- Managing Director / Admin: full access
- Project Manager: manage assigned projects, tasks, stages, documents, reports
- Engineers: assigned project access, task/document/site/NCR updates
- Site Engineer: site visits, NCR, supervision workflows
- Accountant: invoices, payments, expenses, payroll
- HR: employees, attendance, leave, EOS, payroll, circulars
- Sales / Quotation Manager: quotations and follow-ups
- Client Viewer: read-only assigned project status and documents

## Workflows

The database includes notification triggers for:

- Quotation status changes
- Task assignment
- Delayed tasks

Quotation status behavior:

- `Sent`: notifies Sales Rep, MD/Admin, and Quotation Manager.
- `Accepted`: notifies Accounts to prepare the advance invoice after LPO reception.
- `LPO Pending`: notifies Sales Rep, MD/Admin, Quotation Manager, and Accounts.

## Exports

Module pages and Reports support:

- CSV export
- Browser print flow for PDF export

## Notes

This is an MVP codebase with production-oriented structure and live Supabase integration. For a production deployment, review email confirmation settings, domain allow-lists, user invitation flow, audit logging, and any company-specific salary or EOS policy details before launch.
