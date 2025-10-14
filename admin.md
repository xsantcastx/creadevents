EPIC: Product & Gallery Management
US-01 — Create product from predefined catalog

As an Admin
I want to select a product from a dropdown of predefined items
So that its name, description, specs, and SEO load automatically and I only need to add images.

Acceptance Criteria

Given I open “Add Product”
When I open the Product dropdown
Then I see all predefined product options (from materials/categories/families/templates or productCatalog).

Given I select a product option
When the form loads
Then fields Name, Description, Specs, SEO auto-populate from templates
And the fields are editable
And a flag descriptionLocked = false is set by default.

Given a product is selected
When I click Save (Draft) without images
Then the product document is created with status = "draft", a unique slug, and empty gallery.

Edge: If no template exists for that product
Then the form shows a Template Missing warning and loads sensible defaults (blank description/specs), but still allows Save (Draft).

US-02 — Upload product images

As an Admin
I want to upload a cover image and gallery images for the selected product
So that the product detail page renders correctly.

Acceptance Criteria

Given a draft product exists
When I drag & drop images into Cover and Gallery zones
Then files upload to /products/{slug}/...
And thumbnails are generated
And media records are created with dimensions and tags (cover, detail, ambient).

Given upload completes
When I click Publish
Then the product status becomes "published"
And the Products page lists it
And the Product detail page shows cover + gallery.

Edge: If I remove the cover image
Then “Publish” is disabled with message: “Cover image required.”

US-03 — Auto-fill behavior & editing guard

As an Admin
I want auto-fill to suggest content but not overwrite my edits
So that I can safely tweak descriptions later.

Acceptance Criteria

Given a product with auto-filled description
When I edit the description
Then the UI sets descriptionLocked = true.

Given templates change (category/material)
When I reopen the product
Then if descriptionLocked = true the system does not auto-overwrite
Else it re-applies the latest template content as suggestion.

US-04 — Wire to Products page (listing & filters)

As a Visitor
I want to see every published product and filter by category/material/size
So that I can find the product quickly.

Acceptance Criteria

Given there are published products
When I visit /products
Then I see a grid with cover, name, tags for each status="published" product.

Given category/material filters
When I select “10 cm” or “Onyx”
Then the list updates (Firestore query index: status + categoryId, status + materialId).

Given I click a product
When I navigate to /products/{slug}
Then I see title, description, specs, gallery, and SEO tags are set.

US-05 — Create gallery items & wire to Gallery page

As an Admin
I want to upload gallery images and link them to products
So that the Gallery page showcases real installs/ambientes.

Acceptance Criteria

Given I open “Add Gallery Item”
When I upload an image and add tags (e.g., baño, onyx, interior)
Then a gallery doc is created with mediaId, tags, relatedProductIds.

Given gallery items exist
When I open /gallery
Then I see a Masonry/grid of images with lazy-loading
And clicking an item opens a lightbox with caption and links to related products.

Edge: If a related product is archived
Then the gallery item stays visible but link shows “Product unavailable.”

US-06 — Product list integrity (admin)

As an Admin
I want the product dropdown and product list to reflect the real catalog
So that I always pick valid items and avoid duplicates.

Acceptance Criteria

Given I open the “Add Product” dropdown
When the catalog is loaded
Then the options are grouped (Category → Material → Product Name)
And search-as-you-type by name, material, category.

Given I try to add an already-published product with the same name
When I save
Then the system prevents duplicate slug and prompts to edit the existing product instead.

US-07 — Publishing & visibility rules

As an Admin
I want clear statuses and guardrails
So that only complete products go live.

Acceptance Criteria

Draft → Publish requires: Name, Cover image, Category, Material.

Archive hides product from Products page but preserves SEO slug (returns 410/redirect).

Sitemaps update within 5 minutes of publish/archive (or on demand).

Non-Functional / Implementation Notes

Data model: use the structure we just defined (products, media, gallery, templates, etc.).

Storage:

Cover → /products/{slug}/cover.jpg

Gallery → /products/{slug}/gallery/{uuid}.jpg

Site gallery → /gallery/{slug}/{uuid}.jpg

Indices (Firestore):

products: status+categoryId, status+materialId, status+tags (array-contains)

SEO: populate seo.title, seo.metaDescription, ogImage from product cover; add structured data (Product schema).

Telemetry: log events product_create, product_publish, gallery_add, image_upload_failed.

Admin UX: multi-step form (Select Product → Auto-fill Preview → Upload Images → Publish).

Error states: surface template-missing, duplicate slug, image too small (<1200px width), and failed upload with retries.

Suggested Subtasks (Dev Breakdown)

FE: Build Add Product wizard with dropdown + auto-fill; add descriptionLocked logic.

FE: Image uploader (cover + gallery) with progress, re-order, delete.

FE: Products page list + filters; Product detail page; Gallery page with lightbox.

BE (Cloud Functions): slug generation, thumbnail creation, media doc write, sitemap refresh.

Config: Firestore rules for admin writes; Storage rules for path-based write.

🚀 Next Steps:
Ready to implement next: 3. Product Admin - Gallery Upload - File upload with drag-drop, resize checking, and tagging 4. Product Admin - Publish Guard - Validation before allowing publish 5. Gallery Admin - Media Model - Complete media management system 6. Storefront - Firestore Product Listing - Public product pages reading from new schema

Would you like me to continue with the next feature, or would you like to test what we've built so far?

The build is working, and these features are production-ready! 🎉