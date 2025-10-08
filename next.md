# 🎯 PROJECT SPECIFICATION — TStone Website

## 🧱 Context
This project is for **TStone**, a company specializing in tiles, marble, and wall/floor coverings.  
The site is built with **Angular + TailwindCSS + Firebase (Firestore, Auth, Storage, Hosting)**.  
Current repo: [https://github.com/xsantcastx/TStone](https://github.com/xsantcastx/TStone)  
Reference demo: [https://tstone456--tstone-e1de6.us-east4.hosted.app/](https://tstone456--tstone-e1de6.us-east4.hosted.app/)

The goal is to create a **professional, dynamic, and multilingual corporate website** with:
- A modern **hero animation**
- **Product catalog** with “add to cart” (interest list)
- **Gallery** with admin uploads
- **Technical data** with structured info
- **Client portal** (login + order history)
- **Admin backoffice**

---

## 🧩 Feature Specifications

### 1️⃣ Home Page (Hero Section)
**Objective:** Improve visual presentation and usability.  
**Requirements:**
- Add a **dynamic hero image** (zoom-in/out or random photo rotation).
- Include a **language selector (ES, EN, FR, IT)** in the top-right corner.
- Add **LinkedIn and Instagram icons** in the header or footer.
**Acceptance Criteria:**
✅ Animation smooth and subtle  
✅ Selector functional and persistent  
✅ Social links active  
✅ Fully responsive

---

### 2️⃣ Product Section
**Objective:** Allow users to browse and select products easily.  
**Requirements:**
- Add **“Add to cart”** (interest list) button on both product list and product detail pages.
- Enable **image zoom/lightbox** for larger previews.
- Keep current side menu layout, but optimize spacing and visuals.
**Acceptance Criteria:**
✅ Add to cart works on all products  
✅ Zoom works without page reload  
✅ Works on desktop and mobile  
✅ Saves selected items to Firestore “orders” or local list

---

### 3️⃣ Gallery
**Objective:** Show product applications (e.g., kitchens, bathrooms) and allow admin uploads.  
**Requirements:**
- Keep layout similar to products.
- Create **categories** (Cocina, Baño, etc.) without showing image counts.
- Allow admins to **add/edit images** via backoffice (no numbering needed).
**Acceptance Criteria:**
✅ Category filter functional  
✅ Images load fast and lazily  
✅ Admin upload saves to Firebase Storage + Firestore  
✅ Only admin can upload/delete  

---

### 4️⃣ Technical Data
**Objective:** Present detailed technical specifications.  
**Order of sections:**
1. Acabados  
2. Embalaje  
3. Mantenimiento  
4. Especificaciones Técnicas  
5. Fichas Técnicas  
6. Tablones (opcional)

**Requirements:**
- Display **Embalaje** table with these values:

| Espesor | Kg/palet | m²/palet | Ud/palet | m²/caja | Kg/caja |
|----------|-----------|-----------|-----------|-----------|-----------|
| 12 mm | 150 | 5.12 | 20 | 5.12 | 102.40 |
| 20 mm | 230 | 5.12 | 13 | 5.12 | 66.86 |

- Add **zoom/magnifier** for technical drawings or images.
- Store each section as editable Firestore docs.
**Acceptance Criteria:**
✅ Ordered sections appear correctly  
✅ Table displays responsively  
✅ Zoom works smoothly  

---

### 5️⃣ Client Area (Registration & History)
**Objective:** Allow clients to log in and view their orders.  
**Requirements:**
- Implement **Firebase Auth** (email/password).
- Store user profiles in `/users/{uid}` collection.
- Display basic info (name, email) + order history.
- Restrict access to own data only.
**Acceptance Criteria:**
✅ Register/login/logout works  
✅ Order history loads per user  
✅ Admin access blocked  

---

### 6️⃣ Admin Panel (Backoffice)
**Objective:** Enable management of content and client data.  
**Modules:**
- **Products:** Add/edit/delete  
- **Gallery:** Upload, organize  
- **Technical Data:** Manage text/tables  
- **Orders:** View/filter/reply  

**Requirements:**
- Admin authentication via Firebase custom claims.  
- Firestore rules must restrict write access to admins.  
- UI with tabs or menu for each section.
**Acceptance Criteria:**
✅ CRUD operations functional  
✅ Roles enforced  
✅ Gallery uploads visible on frontend instantly  

---

## 🔐 Firestore Structure (Recommended)

```
categories/
products/
galleryCategories/
galleryImages/
technicalData/
orders/
users/
```

---

## 🔒 Security Rules Overview
- Public read access for: `products`, `galleryImages`, `technicalData`
- Authenticated write only for admins
- Orders: users can create and read only their own
- Admin can read/write/delete all

---

## 📈 Analytics, SEO & Performance
- Add Firebase Analytics / GA4
- Add meta tags, sitemap, and Open Graph for social sharing
- Optimize images (WebP/AVIF), lazy loading, and responsive sizes
- Core Web Vitals ≥ 90 (Lighthouse)

---

## 🧰 Tech Stack Summary
| Layer | Tool |
|-------|------|
| Frontend | Angular + TailwindCSS |
| Backend | Firebase Firestore / Auth / Storage |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |
| Translations | ngx-translate |
| Analytics | GA4 / Firebase Analytics |

---

## ✅ Deliverables
- Complete multilingual website
- Responsive hero animation
- Cart + order workflow
- Gallery with admin uploads
- Technical data structured and editable
- Client login & order history
- Admin backoffice with permissions
- Analytics + SEO setup
- PDF/Word documentation for client handoff

---

