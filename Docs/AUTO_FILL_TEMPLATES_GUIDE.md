# Auto-Fill Templates Setup & Usage

## 🎯 Overview
The auto-fill feature in the product admin page automatically populates description, SEO title, and SEO meta description fields based on templates stored in Firestore.

## 📋 How It Works

### Template System
Templates use **placeholders** that get replaced with actual product data:
- `{name}` - Product name (e.g., "Antminer S19 XP")
- `{material}` - Material/Model name (e.g., "Antminer S19 Pro")
- `{size}` - Hash rate/size (e.g., "140 TH/s")
- `{category}` - Category name (e.g., "ASIC Miners")

### Template Hierarchy
Templates are prioritized by scope:
1. **Material-specific** (highest priority)
2. **Category-specific**
3. **Global** (fallback)

## 🚀 Setup Instructions

### Step 1: Install Dependencies
The `tsx` package is needed to run TypeScript scripts:

```bash
npm install --save-dev tsx
```

### Step 2: Run Template Seeder
This will create default templates in your Firestore database:

```bash
npm run seed:templates
```

Expected output:
```
🚀 Starting template seeding...

✅ Created description template (global, en): abc123
✅ Created description template (global, es): def456
✅ Created seoTitle template (global, en): ghi789
✅ Created seoTitle template (global, es): jkl012
✅ Created seoMeta template (global, en): mno345
✅ Created seoMeta template (global, es): pqr678
✅ Created description template (category, en): stu901
✅ Created description template (category, en): vwx234

🎉 Successfully created 8 templates!

📝 Template Summary:
   - Description templates: 4 (2 global + 2 category)
   - SEO Title templates: 2 (global)
   - SEO Meta templates: 2 (global)
   - Languages: English & Spanish

✨ Auto-fill is now ready to use!
```

### Step 3: Link Templates to Categories (Optional)

To use category-specific templates, you need to know the category ID:

1. Go to Firebase Console → Firestore Database
2. Navigate to `categories` collection
3. Find your "ASIC Miners" category and copy its document ID
4. Update the template in Firestore:
   - Find the category template documents
   - Set the `refId` field to your category ID

## 📝 Using Auto-Fill in Admin

### When Adding/Editing Products:

1. **Step 1: Select Material & Category**
   - Choose from catalog or manual selection
   - Click "Refresh Auto-fill" button

2. **Step 2: Auto-Fill Happens**
   - Description field populates automatically
   - SEO Title populates
   - SEO Meta Description populates

3. **Step 3: Lock Fields (Optional)**
   - Click "Lock" next to Description to prevent auto-fill from overwriting
   - Click "Lock" next to SEO Settings to prevent auto-fill from overwriting
   - Locked fields retain manual edits

### Example Output

**For Product**: Antminer S19 XP - 140 TH/s

**Description** (auto-filled):
```
Introducing the Antminer S19 XP - 140 TH/s - a cutting-edge Bitcoin mining solution designed for maximum efficiency and performance.

Key Features:
• Hash Rate: 140 TH/s
• Model: Antminer S19 Pro
• Power Efficiency: Industry-leading performance
• Cooling System: Advanced thermal management
• Build Quality: Enterprise-grade components

This Antminer S19 Pro miner is engineered to deliver exceptional mining performance...
```

**SEO Title** (auto-filled):
```
Antminer S19 XP - 140 TH/s - 140 TH/s Bitcoin Miner | TheLuxMining
```

**SEO Meta** (auto-filled):
```
Buy Antminer S19 XP - 140 TH/s Bitcoin miner with 140 TH/s hash rate. Antminer S19 Pro model featuring enterprise-grade components...
```

## 🔧 Creating Custom Templates

### Via Firebase Console:

1. Go to Firebase Console → Firestore Database
2. Select `templates` collection
3. Click "Add document"
4. Fill in fields:

```json
{
  "type": "description",           // or "seoTitle", "seoMeta", "specs"
  "scope": "material",             // or "category", "family", "global"
  "refId": "material_id_here",     // ID of material/category (optional for global)
  "language": "en",                // or "es", "fr", "it"
  "content": "Your template text with {name}, {material}, {size} placeholders",
  "fields": ["name", "material", "size"],
  "active": true,
  "createdAt": "2025-10-14T...",
  "updatedAt": "2025-10-14T..."
}
```

### Template Types:

| Type | Purpose | Content Example |
|------|---------|-----------------|
| `description` | Product description | Full product details with features |
| `seoTitle` | SEO page title | `{name} - {size} Bitcoin Miner` |
| `seoMeta` | Meta description | Short 155-char summary |
| `specs` | Default specs | Uses `specDefaults` field instead of `content` |

### Scope Levels:

| Scope | Usage | Example |
|-------|-------|---------|
| `global` | All products | Default template for all miners |
| `category` | Category-specific | Template for "ASIC Miners" category |
| `material` | Material-specific | Template for "Antminer S19 Pro" |
| `family` | Family-specific | Template for a product family |

## 🎨 Template Best Practices

### 1. Use Clear Placeholders
```
✅ Good: "The {name} delivers {size} of hash power"
❌ Bad: "This product is great"
```

### 2. Keep SEO Titles Under 60 Characters
```
✅ Good: "{name} - {size} Bitcoin Miner | TheLuxMining"
❌ Bad: "Buy the amazing {name} with {size} hash rate for professional Bitcoin mining operations at TheLuxMining"
```

### 3. Keep Meta Descriptions 150-160 Characters
```
✅ Good: "Buy {name} Bitcoin miner with {size} hash rate. Enterprise-grade, efficient, professional mining solutions."
❌ Bad: Too long descriptions get cut off...
```

### 4. Include Keywords
- Bitcoin miner
- ASIC miner
- Hash rate
- Mining efficiency
- Professional mining

## 🔍 Troubleshooting

### Problem: "Template not found" warnings

**Solution 1**: Run the template seeder
```bash
npm run seed:templates
```

**Solution 2**: Check Firestore
- Go to Firebase Console → Firestore
- Verify `templates` collection exists
- Verify templates have `active: true`

### Problem: Auto-fill not working

**Checklist**:
- [ ] Templates exist in Firestore
- [ ] Templates are `active: true`
- [ ] Material and Category are selected
- [ ] Clicked "Refresh Auto-fill" button
- [ ] Fields are not locked

### Problem: Wrong language showing

**Solution**: Update templates to match your language:
- English: `language: "en"`
- Spanish: `language: "es"`
- French: `language: "fr"`
- Italian: `language: "it"`

## 📚 Default Templates Included

### Global Templates (English & Spanish):
1. **Description** - Professional product description with features
2. **SEO Title** - Format: "{name} - {size} Bitcoin Miner | TheLuxMining"
3. **SEO Meta** - Product summary for search engines

### Category Templates (English & Spanish):
1. **ASIC Miners Description** - Detailed ASIC-specific features and benefits

## 🔐 Security Note

Templates are stored in Firestore and can only be modified by:
- Admin users through Firebase Console
- Automated scripts with proper credentials
- Future admin template management UI (coming soon)

## 🚦 Next Steps

### Recommended Actions:
1. ✅ Run `npm run seed:templates` to create default templates
2. ✅ Test auto-fill in product admin
3. ✅ Create material-specific templates for your top products
4. ✅ Add category ID references for category-specific templates
5. ✅ Customize templates to match your brand voice

### Future Enhancements:
- [ ] Template management UI in admin panel
- [ ] Multi-language template editor
- [ ] Template versioning
- [ ] Template preview before applying
- [ ] Bulk template updates

## 📅 Created
October 14, 2025

## 🆘 Support
For issues or questions about templates:
1. Check this documentation
2. Review Firestore console for template data
3. Check browser console for errors
4. Verify Firebase connection
