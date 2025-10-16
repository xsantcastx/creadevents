# Tag Setup Guide

Since the seed script requires Firebase authentication, you'll need to add tags manually through the admin UI.

## How to Add Tags

1. **Navigate to Admin Catalog**
   - Go to `/admin/catalog`
   - Click on the **"Etiquetas"** (Tags) tab

2. **Click "Nueva Etiqueta"** button

3. **Fill in the tag details:**

### Recommended Tags for Crypto Mining

Here are 8 suggested tags you can create:

#### 1. Mining Farm
- **Nombre**: Mining Farm
- **Slug**: mining-farm (auto-generated)
- **Descripción**: Large-scale mining operations and facilities
- **Color**: #F7931A (Bitcoin orange)
- **Icono**: ⛏️
- **Orden**: 1
- **Activo**: ✓

#### 2. Data Center
- **Nombre**: Data Center
- **Slug**: data-center
- **Descripción**: Data center infrastructure and setups
- **Color**: #FF9500 (Orange)
- **Icono**: 🖥️
- **Orden**: 2
- **Activo**: ✓

#### 3. ASIC Setup
- **Nombre**: ASIC Setup
- **Slug**: asic-setup
- **Descripción**: ASIC miner installations and configurations
- **Color**: #FFB800 (Gold)
- **Icono**: ⚡
- **Orden**: 3
- **Activo**: ✓

#### 4. GPU Rig
- **Nombre**: GPU Rig
- **Slug**: gpu-rig
- **Descripción**: GPU mining rig setups
- **Color**: #00D4AA (Teal)
- **Icono**: 💻
- **Orden**: 4
- **Activo**: ✓

#### 5. Cooling System
- **Nombre**: Cooling System
- **Slug**: cooling-system
- **Descripción**: Cooling and thermal management solutions
- **Color**: #00B8D4 (Cyan)
- **Icono**: ❄️
- **Orden**: 5
- **Activo**: ✓

#### 6. Infrastructure
- **Nombre**: Infrastructure
- **Slug**: infrastructure
- **Descripción**: Power, networking, and facility infrastructure
- **Color**: #7E57C2 (Purple)
- **Icono**: 🔧
- **Orden**: 6
- **Activo**: ✓

#### 7. Installation
- **Nombre**: Installation
- **Slug**: installation
- **Descripción**: Equipment installation and deployment
- **Color**: #26A69A (Green)
- **Icono**: 🔨
- **Orden**: 7
- **Activo**: ✓

#### 8. Maintenance
- **Nombre**: Maintenance
- **Slug**: maintenance
- **Descripción**: Maintenance and repair operations
- **Color**: #FF7043 (Red-Orange)
- **Icono**: 🛠️
- **Orden**: 8
- **Activo**: ✓

## Features of the Tag System

### Emoji Picker
The icon field now includes a quick emoji selector with:
- ⛏️ Mining pickaxe
- 🖥️ Desktop computer
- ⚡ Lightning/electricity
- 💻 Laptop
- ❄️ Snowflake/cooling
- 🔧 Wrench
- 🔨 Hammer
- 🛠️ Tools
- 🔥 Fire
- 💰 Money bag
- 🚀 Rocket
- 📊 Chart

Just click any emoji to instantly add it to your tag!

### Color Picker
- Large color picker (48px × 96px) for easy color selection
- Text input for hex codes (e.g., #F7931A)
- Colors are displayed as badges in the tag list

### Auto-Generated Slugs
- Type the tag name and blur the field
- The slug will auto-generate (lowercase, hyphenated)
- You can manually edit if needed

## After Creating Tags

Once you've created your tags, you can:
1. Use them to categorize products in the Products admin
2. Tag gallery images with relevant categories
3. Filter and organize your crypto mining content

## Firebase Permissions Note

The seed script failed due to Firebase security rules. Tags must be created:
- Through the admin UI (authenticated users)
- Or by updating Firestore rules to allow the seed script

To use the seed script, you would need to temporarily modify `firestore.rules` to allow write access, run the script, then restore the rules.
