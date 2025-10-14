What’s Still Missing

Product wizard skips validation for template gaps (no “template missing” warning) and doesn’t yet manage variants, gallery uploads, or the cover-image reorder/drag experience described in admin.md.
Publishing logic stops at Firestore writes; there are no Cloud Functions for slug dedupe, thumbnail generation, sitemap refresh, or event telemetry (product_create, product_publish, etc.).
Front-facing pieces are unchanged: /products still lists legacy data, filters don’t query Firestore, and product detail pages ignore the new gallery/media model.
Gallery admin now writes tags/product links, but there’s no UI to edit existing records, enforce minimum image size, or surface the new metadata on the public gallery/lightbox.
Build still breaks on Angular bundle budget and with CommonJS warnings, so CI/CD can’t pass yet.
How I’d Tackle the Next Ideas

Product Admin polish

Step 1: source catalog options from a canonical productCatalog collection (or the catalog service) and show template availability; if missing, display the warning and set defaults.
Step 2: lock handling—persist descriptionLocked, specsLocked, seoLocked, and introduce variant editing (embedded array first, with UI to add finishes/price/stock).
Step 3: switch cover upload to Storage + media doc creation, add gallery uploader with drag-and-drop order, resize check (>=1600px), and allow tagging (cover/detail/ambient).
Save/Publish buttons call a shared service that writes Firestore, pushes media entries, and triggers Cloud Functions (or temporary placeholders) for slug/sitemap.
Status guard: disable publish until name, category, material, cover, and at least one variant/gallery entry exist.
Gallery Admin completion

Replace stubbed galleryImages collection with final media + gallery docs: when uploading, first create a media entry (with dimensions/thumbnail) then a gallery doc referencing it.
Add Edit/Delete flows inline, including ability to swap the image (delete from Storage via safe path extraction).
Hook up product picker with fuzzy search and show chip summary of selected products; on load, map relatedProductIds back to names.
On the public gallery page, fetch the new docs (with tags/related products), show tag filters, and update the lightbox to link out to /productos/:grosor/:slug or show “Product unavailable” if archived.
Storefront alignment

Build Firestore-driven product listing: products collection filtered by status='published', category/material selectors, search input hitting a derived search_name.
Product detail should hydrate from the new schema (cover + gallery images from media, specs, SEO meta injection).
Update sitemap generator (manual script or Cloud Function) to read published products + gallery and write /sitemap.xml.
Infra & QA

Introduce Firebase Functions: onProductWrite (slug, SEO, sitemap), onMediaUpload (thumbnail, metadata), onGalleryWrite (product link checks).
Adjust Angular build budgets or split vendors to clear the current failure; add lint/test scripts.
Add Cypress or Playwright smoke tests for admin flows (create draft, add cover, publish) and for storefront filters.
Drop these steps into futureSteps.md as actionable bullets, then iterate per module (products admin, gallery admin, storefront, infra).

📋 Suggested Order (from futureSteps.md):
Phase 1: Complete Product Admin (Tasks 3-4) ⭐ DO THIS FIRST
✅ Task 1: Lock Persistence (DONE)
✅ Task 2: Template Validation (DONE)
➡️ Task 3: Gallery Upload with Media Model (NEXT)
➡️ Task 4: Publish Guard (AFTER TASK 3)
Phase 2: Complete Gallery Admin (Tasks 5-7)
Task 5: Media Model (integrates with Task 3)
Task 6: Edit/Delete flows
Task 7: Product Picker
Phase 3: Build Storefront (Tasks 8-9)
Task 8: Firestore Product Listing ← We'd do this now if we go Option 2
Task 9: Product Detail Page
Phase 4: Cloud Functions (Task 10)
Task 10: Product Events (SEO, sitemap, etc.)
🎯 My Recommendation:
Continue with Task 3: Gallery Upload because:

📸 You need proper image management ASAP
🔗 Tasks 3 & 5 are closely related (media model)
✅ Once gallery upload works, you can fully create products
🚀 Then storefront will have real, complete products to display
After Tasks 3-4, we can decide:

Skip to storefront (Tasks 8-9) to show products publicly
OR finish gallery admin (Tasks 5-7) for complete admin experienc
