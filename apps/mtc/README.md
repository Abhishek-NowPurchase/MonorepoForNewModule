# 🚀 MTC Module

## 📋 Overview

The MTC (Material Test Certificate) module is a micro-frontend application built as part of the monorepo architecture.

## 🏗️ Structure

```
mtc/
├── app/
│   ├── App.jsx          # Main application component
│   └── mount.js         # Module Federation mount point
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   └── list/       # List page
│   └── routes.tsx       # Route configuration
├── public/
│   └── index.html      # HTML template
├── package.json        # Dependencies and scripts
├── netlify.toml        # Netlify deployment config
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## 🚀 Getting Started

### Development

```bash
cd apps/mtc
npm install
npm run dev
```

The module will be available at the port assigned by the webpack smart config (typically starting from 3105).

### Build

```bash
npm run build
```

### Clean

```bash
npm run clean
```

## 🛣️ Routes

- `/mtc` - MTC list page
- `/mtc/list` - MTC list page (default)

## 📦 Dependencies

This module uses:
- React 18.3.1
- TypeScript
- Tailwind CSS
- Now Design System components
- Module Federation for micro-frontend architecture

## 🔧 Configuration

The module is automatically discovered by the webpack smart config system. No manual configuration needed.

## 📝 Notes

- This is a placeholder module structure
- Add your MTC-specific functionality in `src/pages/` and `src/components/`
- Routes can be extended in `src/routes.tsx`

