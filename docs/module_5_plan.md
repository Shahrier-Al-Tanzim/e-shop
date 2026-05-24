Implementation Plan - Module 5: Public Product Catalog & ISR Page Caching
We are ready to build Module 5: Public Product Catalog & ISR Page Caching on top of our existing E-Shop codebase. This phase covers customer-facing catalog filters (search, price boundaries, category selections) and the dynamic high-fidelity Product Details Page (/products/[slug]), fully optimized with Next.js Incremental Static Regeneration (ISR).

User Review Required
IMPORTANT

Branch Management Strategy: Always ask the user if they want to create a new Git branch for the active module before starting execution.

ISR Revalidation Timing: We will implement Incremental Static Regeneration (ISR) with a revalidation rate of 60 seconds (export const revalidate = 60). Additionally, to ensure instantaneous catalog updates when admins modify stock or prices in Module 4, our Server Actions in app/actions/admin.ts already execute revalidatePath("/") and revalidatePath("/admin/products"). We will add revalidatePath("/products/[slug]") so details are updated on-demand immediately.

Open Questions
No critical blocking questions at this stage. We will proceed to structure clean, pre-rendered static routes for active listings.
Proposed Changes
We will introduce a dynamic product details route under app/products/[slug] and update our storefront landing pages to support interactive search and filter operations.


/app
  /products
    /[slug]
      page.tsx              ← High-fidelity product details view (Pre-rendered)
/app/actions
  catalog.ts                ← Read-only Server Actions/helpers for catalog queries
Component: Catalog Helper Actions
[NEW] 
catalog.ts
A read-only helper to fetch catalog records:

getActiveProductBySlug(slug): Queries Neon PostgreSQL for product matching the slug, including its category. Returns null if hidden (isActive === false).
Component: Product Details Page
[NEW] 
page.tsx
The dynamic product detail layout:

Awaits Async Params: Conforming to Next.js 15/16 dynamic route specifications, page params will be awaited: const { slug } = await params.
Pre-rendering (generateStaticParams):
Resolves all active slugs at build time to static HTML files.
Ensures sub-millisecond load times for customers.
Visuals:
Displays high-resolution Cloudinary image previews or fallback large graphical representations.
Dynamic Stock badges (green "In Stock", orange "Low Stock (N left)", red "Out of Stock").
Review rating star visualizations (4.8 stars placeholder).
High-fidelity details panel (description, price, category tag).
Client-interactive "Add to Cart" button (wired to Zustand state actions in the next module).
Navigation controls to instantly return to storefront catalog shells.
Component: Catalog Interaction
[MODIFY] 
HomeClient.tsx
Enhance our storefront listing container to connect with real product paths and filters:

Map "Add to Cart" buttons and catalog grids to link directly to /products/[slug].
Implement client-side catalog search (instantly filtering listings by name/description).
Implement client-side category tags (instantly filtering grids by active department selections).
Component: Metadata & History Ledger
[MODIFY] 
context.md
Document steps taken and update roadmap statuses.

Verification Plan
Automated / Server Tests
Production compilation verification check:
bash

npm run build
Confirms generateStaticParams compiles successfully, pre-rendering static routes /products/[slug].
Manual Verification
Access the E-Shop homepage / as a client.
Select category filter chips or type search parameters to verify catalog items update instantly.
Click a product card to navigate to /products/[slug].
Verify slug parses dynamically, rendering all details, images, and category badges.
Attempt loading a non-existent slug to verify notFound() error pages trigger correctly.