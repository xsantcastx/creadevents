# Documentation Index

Welcome to TheLuxMining documentation.

---

## 📚 Main Documentation

### **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** ⭐
**Complete project overview** - Architecture, features, implementation details, deployment guide.

**Start here!** This is the comprehensive guide to the entire project.

### **[PROGRESS.md](./PROGRESS.md)** 📊
**Project progress summary** - What's completed, timeline, metrics, next steps.

Overview of development progress and current status.

---

## 🎯 Quick Guides

### **[THEME_GUIDE.md](./THEME_GUIDE.md)** ⚠️ **CRITICAL**
**Theme system and colors** - **LIGHT GRAY, NOT DARK GRAY!**

Read this before creating any new components.

### **[LOADING_COMPONENT_BASE.md](./LOADING_COMPONENT_BASE.md)**
**Developer guide for LoadingComponentBase** - How to use the centralized loading state management system.

Use this for all components loading Firebase data.

### **[ANALYTICS_AND_COOKIES.md](./ANALYTICS_AND_COOKIES.md)**
**Analytics & Cookie Consent** - Firebase Analytics implementation and GDPR compliance.

Complete guide to tracking and privacy compliance.

---

## 📖 What Each Document Covers

| Document | Content | When to Read |
|----------|---------|--------------|
| **PROJECT_DOCUMENTATION.md** | Complete project overview, architecture, features, deployment | First time setup, reference |
| **PROGRESS.md** | Project progress, timeline, metrics, next steps | Check project status |
| **THEME_GUIDE.md** | Color scheme, Tailwind classes, theming rules | Before creating components |
| **LOADING_COMPONENT_BASE.md** | LoadingComponentBase API and usage | When loading Firebase data |
| **ANALYTICS_AND_COOKIES.md** | Analytics tracking, cookie consent, GDPR | Adding tracking events |

---

## 🗂️ Legacy Documentation

**Location:** `legacy/` folder

Contains historical documentation from development sessions. These docs track the evolution of features and fixes but are not needed for current development.

**Use legacy docs for:**
- Understanding historical context
- Troubleshooting similar past issues
- Reference for completed migrations

---

## 🚀 Quick Start

1. **Read:** [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Complete overview
2. **Important:** [THEME_GUIDE.md](./THEME_GUIDE.md) - **LIGHT GRAY theme!**
3. **Development:** [LOADING_COMPONENT_BASE.md](./LOADING_COMPONENT_BASE.md) - Core architecture
4. **Analytics:** [ANALYTICS_AND_COOKIES.md](./ANALYTICS_AND_COOKIES.md) - Tracking guide

---

## 💡 Key Takeaways

### ⚠️ CRITICAL: Theme Colors

**ALWAYS USE LIGHT GRAY, NOT DARK GRAY**

```html
<!-- ✅ Correct -->
<div class="bg-ts-bg text-ts-ink">
  
<!-- ❌ Wrong -->
<div class="bg-bitcoin-dark text-white">
```

### 🏗️ Architecture Pattern

**All Firebase operations use LoadingComponentBase:**

```typescript
export class YourComponent extends LoadingComponentBase {
  constructor() { super(); }
  
  async ngOnInit() {
    await this.withLoading(async () => {
      this.data = await this.loadData();
    });
  }
}
```

### 📊 Analytics

**Production-only, GDPR-compliant, automatic page tracking.**

---

## 📞 Support

**Questions about:**
- Architecture → PROJECT_DOCUMENTATION.md
- Theme → THEME_GUIDE.md  
- Loading states → LOADING_COMPONENT_BASE.md
- Analytics → ANALYTICS_AND_COOKIES.md

**Historical context:** Check `legacy/` folder

---

**Last Updated:** October 16, 2025  
**Status:** Production Ready ✅
