# Technical Specifications Editor - User Guide

## Overview
The Products Admin now includes a **dynamic Technical Specifications editor** that allows you to add custom specs for different product types (mining hardware, keychains, hardware wallets, etc.).

## Location
**Step 2: Product Content** → Technical Specifications section (between Tags and Pricing)

## How It Works

### 1. **Adding Specifications Manually**
- Enter the **Spec Name** (e.g., `hashRate`, `material`, `screenSize`)
- Enter the **Value** (e.g., `110 TH/s`, `Stainless Steel`, `2.4 inch`)
- Click **Add Specification**

### 2. **Using Quick Templates**
We provide pre-built templates for different product types:

#### ⛏️ Mining Hardware Templates:
- **Hash Rate** → `hashRate`
- **Power** → `powerConsumption`
- **Efficiency** → `efficiency`
- **Algorithm** → `algorithm`
- **Chip Type** → `chipType`
- **Cooling** → `cooling`
- **Dimensions** → `dimensions`
- **Weight** → `weight`
- **Temperature** → `temperature`
- **Network** → `network`
- **Voltage** → `voltage`
- **Warranty** → `warranty`
- **Noise Level** → `noiseLevel`

#### 🔑 Accessory Templates (Keychains, Merch):
- **Material** → `material`
- **Dimensions** → `dimensions`
- **Weight** → `weight`
- **Finish** → `finish`
- **Color** → `color`
- **Packaging** → `packaging`

#### 💳 Hardware Wallet Templates (Ledger, Trezor):
- **Screen Size** → `screenSize`
- **Connectivity** → `connectivity`
- **Compatibility** → `compatibility`
- **Supported Coins** → `supportedCoins`
- **Security Chip** → `securityChip`
- **Battery** → `battery`
- **Dimensions** → `dimensions`
- **Weight** → `weight`
- **Certifications** → `certifications`

### 3. **Managing Specs**
- **View All Specs**: Current specs are displayed in a clean grid showing Name and Value
- **Remove Specs**: Hover over a spec and click the trash icon to delete it
- **Edit Specs**: Remove and re-add with updated values

## Example Workflows

### Example 1: Adding Mining Hardware (Antminer S19 Pro)
1. Open the Quick Templates section
2. Click these template buttons:
   - **Hash Rate** → Enter: `110 TH/s`
   - **Power** → Enter: `3250W`
   - **Efficiency** → Enter: `29.5 J/TH`
   - **Algorithm** → Enter: `SHA-256`
   - **Chip Type** → Enter: `7nm ASIC`
   - **Cooling** → Enter: `Dual Fan System`
   - **Dimensions** → Enter: `370×195×290mm`
   - **Weight** → Enter: `13.2 kg`
   - **Warranty** → Enter: `180 days`

### Example 2: Adding a Bitcoin Keychain
1. Use Accessory Templates:
   - **Material** → Enter: `Stainless Steel`
   - **Dimensions** → Enter: `5cm × 2cm × 0.5cm`
   - **Weight** → Enter: `15g`
   - **Finish** → Enter: `Polished Chrome`
   - **Color** → Enter: `Silver`
   - **Packaging** → Enter: `Gift Box Included`

### Example 3: Adding a Ledger Nano X
1. Use Hardware Wallet Templates:
   - **Screen Size** → Enter: `128×64 pixels`
   - **Connectivity** → Enter: `USB-C, Bluetooth`
   - **Compatibility** → Enter: `Windows, macOS, Linux, Android, iOS`
   - **Supported Coins** → Enter: `5500+ cryptocurrencies`
   - **Security Chip** → Enter: `CC EAL5+ certified`
   - **Battery** → Enter: `Rechargeable Li-ion`
   - **Dimensions** → Enter: `72mm × 18.6mm × 11.75mm`
   - **Weight** → Enter: `34g`
   - **Certifications** → Enter: `CE, FCC, IC`

## How Specs Are Displayed

### On Product Detail Page
Specs automatically show in the **Technical Specifications** table with smart formatting:

1. **Mining specs** (hashRate, powerConsumption) display in a dedicated section
2. **Legacy fields** (Size, Thickness) only show if NO mining specs exist
3. **Custom specs** are displayed dynamically with formatted labels
   - `hashRate` becomes "Hash Rate"
   - `powerConsumption` becomes "Power Consumption"
   - `screenSize` becomes "Screen Size"

### Spec Key Naming Convention
Use **camelCase** for spec keys:
- ✅ `hashRate`, `powerConsumption`, `noiseLevel`
- ❌ `hash-rate`, `Power Consumption`, `noise_level`

The system automatically converts `camelCase` to readable labels.

## Technical Details

### Data Storage
Specs are stored in the `specs` object of the Product document:
```typescript
{
  specs: {
    // Legacy fields (for compatibility)
    grosor: '12mm',
    size: '160×320cm',
    finish: 'Pulido',
    usage: ['Mining Farms', 'Data Centers'],
    
    // Custom dynamic specs
    hashRate: '110 TH/s',
    powerConsumption: '3250W',
    efficiency: '29.5 J/TH',
    algorithm: 'SHA-256',
    // ... any other custom specs
  }
}
```

### ProductSpecs Interface
The interface uses `[key: string]: any;` to allow any custom specs:
```typescript
export interface ProductSpecs {
  grosor?: '12mm' | '15mm' | '20mm';
  size?: string;
  finish?: string;
  thicknessMm?: number;
  usage?: string[];
  [key: string]: any; // ← Allows any custom specs!
}
```

## Benefits

✅ **Flexible**: Add ANY spec for ANY product type
✅ **Quick**: Use templates for common specs
✅ **Clean**: Professional display with automatic formatting
✅ **Scalable**: No code changes needed for new product types
✅ **Smart**: Product detail page auto-detects product type based on specs

## Tips

1. **Consistency**: Use the same spec keys across similar products
2. **Templates**: Click a template button to auto-fill the spec name, then just enter the value
3. **Units**: Include units in values (e.g., `110 TH/s`, `13.2 kg`, `75 dB`)
4. **Editing**: When editing products, existing specs are automatically loaded
5. **Required Fields**: Specs are optional - add only what's relevant for each product

---

**Note**: The old Size and Thickness fields are now hidden for products with mining specs, keeping the display clean and professional! 🎯
