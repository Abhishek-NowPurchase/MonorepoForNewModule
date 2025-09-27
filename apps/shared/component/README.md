# Shared Components

This directory contains reusable components that can be used across multiple apps in the project.

## SkeletonLoader

A flexible skeleton loading component with multiple variants.

### Usage

```tsx
import { SkeletonLoader } from '../../shared/component';

// Default form skeleton
<SkeletonLoader />

// Table skeleton
<SkeletonLoader variant="table" />

// Card skeleton
<SkeletonLoader variant="card" />

// With custom className
<SkeletonLoader variant="form" className="my-custom-class" />
```

### Variants

- **form** (default): Form-like skeleton with sections and fields
- **table**: Table skeleton with header and rows
- **card**: Card-like skeleton with header and content

### Features

- ✅ Fully responsive design
- ✅ Flexible width (covers complete container width)
- ✅ Smooth loading animations
- ✅ Mobile-optimized
- ✅ Customizable with className prop
