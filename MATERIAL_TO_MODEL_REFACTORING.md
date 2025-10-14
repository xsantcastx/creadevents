# Material → Model Refactoring Progress

## Status: IN PROGRESS (30% Complete)

This document tracks the refactoring from "Material" to "Model" terminology throughout the TheLuxMining codebase to better reflect crypto mining hardware models (e.g., Antminer S19, Whatsminer M30S).

## Completed ✅

### 1. Core Models (catalog.ts)
- ✅ Renamed `Material` interface to `Model`
- ✅ Updated `Product.materialId` → `Product.modelId`
- ✅ Updated `ProductFormData.materialId` → `ProductFormData.modelId`
- ✅ Updated `Template.scope` type: `'material'` → `'model'`
- ✅ Updated Template field placeholders comment: `{material}` → `{model}`

### 2. Services
- ✅ Created new `model.service.ts` with all methods renamed:
  - `getAllModels()`, `getActiveModels()`, `getModel()`, `getModelBySlug()`
  - `addModel()`, `updateModel()`, `deleteModel()`
  - Kept Firestore collection name as `'materials'` for backwards compatibility
  - All comments updated to reference "models"

### 3. Catalog Admin Component (catalog-admin.page.ts) - PARTIAL
- ✅ Updated imports: `ModelService`, `Model` interface
- ✅ Updated TabType: `'materials'` → `'models'`
- ✅ Updated injected services: `modelService`
- ✅ Updated data properties: `models: Model[]`
- ✅ Updated modal flags: `showModelModal`
- ✅ Updated form properties: `modelForm`
- ✅ Updated editing properties: `editingModel`
- ✅ Updated form initialization: `this.modelForm = this.fb.group(...)`
- ✅ Updated loadAllData(): `getAllModels()`, `this.models`
- ⏳ NEEDS: Update `openMaterialModal` → `openModelModal` method (lines 307-335)
- ⏳ NEEDS: Update `saveMaterial` → `saveModel` method (lines 337-445)
- ⏳ NEEDS: Update `closeMaterialModal` → `closeModelModal` (lines 447-451)
- ⏳ NEEDS: Update deleteEntity switch case `'materials'` → `'models'` (line 607)
- ⏳ NEEDS: Update all `'material'` scope strings → `'model'` in template calls

## Remaining Work ⏳

### 4. Catalog Admin HTML (catalog-admin.page.html)
- ⏳ Update tab: `'materials'` → `'models'`
- ⏳ Update section heading: "Materiales" → "Modelos"
- ⏳ Update button text: "Nuevo Material" → "Nuevo Modelo"
- ⏳ Update loop variable: `material of materials` → `model of models`
- ⏳ Update modal title translation keys
- ⏳ Update form name: `materialForm` → `modelForm`
- ⏳ Update all field placeholders and labels

### 5. Products Admin Component (products-admin.page.ts)
- ⏳ Import `ModelService` instead of `MaterialService`
- ⏳ Import `Model` instead of `Material`
- ⏳ Update injected service: `modelService`
- ⏳ Update array property: `models: Model[]`
- ⏳ Update filter property: `selectedModelFilter`
- ⏳ Update form control: `modelId` (instead of `materialId`)
- ⏳ Update method: `getMaterialName` → `getModelName`
- ⏳ Update all variable names: `material` → `model`, `materials` → `models`
- ⏳ Update template composition calls to use 'model' scope

### 6. Products Admin HTML (products-admin.page.html)
- ⏳ Update filter dropdown: material → model
- ⏳ Update form select: `materialId` → `modelId`
- ⏳ Update loop: `material of materials` → `model of models`
- ⏳ Update display method call: `getModelName()`
- ⏳ Update all labels and placeholders

### 7. Translation Files
#### es.json
- ⏳ `"product_material"` → `"product_model"` ("Material" → "Modelo")
- ⏳ `"select_material"` → `"select_model"` ("Seleccionar material" → "Seleccionar modelo")
- ⏳ `"materials"` → `"models"` ("Materiales" → "Modelos")
- ⏳ `"edit_material"` → `"edit_model"` ("Editar Material" → "Editar Modelo")
- ⏳ `"new_material"` → `"new_model"` ("Nuevo Material" → "Nuevo Modelo")
- ⏳ Catalog subtitle update

#### en.json
- ⏳ `"product_material"` → `"product_model"` ("Material" → "Model")
- ⏳ `"select_material"` → `"select_model"` ("Select material" → "Select model")
- ⏳ `"materials"` → `"models"` ("Materials" → "Models")
- ⏳ `"edit_material"` → `"edit_model"` ("Edit Material" → "Edit Model")
- ⏳ `"new_material"` → `"new_model"` ("New Material" → "New Model")

#### fr.json & it.json
- ⏳ Same translation key updates as above

### 8. Seed Service (seed.service.ts)
- ⏳ Import `ModelService` instead of `MaterialService`
- ⏳ Import `Model` instead of `Material`
- ⏳ Update injected service: `modelService`
- ⏳ Update method: `seedMaterials()` → `seedModels()`
- ⏳ Update array type: `Omit<Model, 'id'>[]`
- ⏳ Update all method calls: `addModel()`, `getModelBySlug()`, `updateModel()`
- ⏳ Update console.log messages
- ⏳ Update template example content and comments

### 9. Migration Service (migration.service.ts)
- ⏳ Import `ModelService` instead of `MaterialService`
- ⏳ Update injected service: `modelService`
- ⏳ Update method: `extractMaterialName()` → `extractModelName()`
- ⏳ Update variable names: `material` → `model`, `materials` → `models`, `materialMap` → `modelMap`
- ⏳ Update Map creation and lookups
- ⏳ Update product data: `materialId`
- ⏳ Update console messages

### 10. Public Products Page (productos.page.ts & .html)
#### TypeScript
- ⏳ Import `ModelService`, `Model`
- ⏳ Update injected service: `modelService`
- ⏳ Update properties: `models: Model[]`, `selectedModelId`
- ⏳ Update method: `onMaterialChange()` → `onModelChange()`
- ⏳ Update service calls: `getAllModels()`

#### HTML
- ⏳ Update filter label: "Material" → "Modelo/Model"
- ⏳ Update select id: `materialFilter` → `modelFilter`
- ⏳ Update ngModel: `selectedModelId`
- ⏳ Update change handler: `onModelChange()`
- ⏳ Update option text: "Todos los materiales" → "Todos los modelos"
- ⏳ Update loop: `model of models`

### 11. Seed Admin Page (seed-admin.page.html)
- ⏳ Update description: "materials" → "models"
- ⏳ Update heading: "Materials" → "Models"
- ⏳ Update count text: "12 material types" → "12 hardware models"

### 12. Template Service (template.service.ts)
- ⏳ Update scope parameter type (already done in interface)
- ⏳ Update all method documentation
- ⏳ Update example comments: material → model
- ⏳ Update composeTemplates parameters: `materialId` → `modelId`
- ⏳ Update template fetching calls: scope 'material' → 'model'
- ⏳ Update variable names in composition logic

### 13. Delete Old Files
- ⏳ Remove `src/app/services/material.service.ts` (replaced by model.service.ts)

### 14. Testing & Verification
- ⏳ Run `get_errors` to check for TypeScript compilation errors
- ⏳ Test category CRUD operations
- ⏳ Test model CRUD operations  
- ⏳ Test product creation with model selection
- ⏳ Test template auto-generation with model templates
- ⏳ Verify filter/search functionality
- ⏳ Check all translations display correctly

## Important Notes

### Backwards Compatibility
- ✅ Firestore collection name remains `'materials'` to preserve existing data
- ✅ No database migration required
- ✅ Existing products will continue to work (materialId field still exists in Firestore)
- ⚠️ Future: Consider adding alias support or database migration script

### Database Field Names
- **Firestore collection**: Stays as `materials` (backwards compatible)
- **TypeScript interface**: Changed to `Model`
- **Product field**: Changed to `modelId` in TypeScript, but maps to `materialId` in Firestore
- **Template scope**: Changed from `'material'` to `'model'`

### UI/UX Impact
- All admin labels will show "Model" instead of "Material"
- Public-facing pages will show "Modelo" (Spanish) or "Model" (English)
- More intuitive for crypto mining context (Antminer S19 is a "model", not a "material")

## Next Steps

1. ✅ Complete catalog-admin.page.ts method updates
2. Update catalog-admin.page.html template
3. Update products-admin component (TS + HTML)
4. Update all translation files
5. Update seed and migration services
6. Update template service
7. Update public productos page
8. Run comprehensive error check
9. Test all CRUD operations
10. Create final documentation

## Estimated Remaining Time
- 2-3 hours of systematic refactoring
- 30 minutes of testing
- 15 minutes documentation

## Risk Assessment
- **Low Risk**: Most changes are straightforward find-and-replace
- **Medium Risk**: Template scope changes (need careful testing)
- **Low Risk**: Backwards compatibility maintained via collection name
