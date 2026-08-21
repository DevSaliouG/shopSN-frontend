# Hero Shopping Image

## Image Required

Place the hero shopping image at:
```
src/assets/images/hero-shopping.webp
```

## Image Details
- **Source**: User-provided image showing mobile phone with shopping cart and packages
- **Background**: Orange gradient
- **Dimensions**: Recommended 800×800px or higher
- **Format**: WebP (optimized) or PNG fallback
- **File size**: Target < 100KB after optimization

## Optimization Steps

1. **Save original image** as `hero-shopping.png` in this directory

2. **Convert to WebP**:
   ```bash
   # Using cwebp (Google WebP tools)
   cwebp -q 85 hero-shopping.png -o hero-shopping.webp
   
   # Or using ImageMagick
   convert hero-shopping.png -quality 85 hero-shopping.webp
   ```

3. **Verify optimization**:
   - Original PNG: ~300-500KB
   - Optimized WebP: ~60-80KB (target)

## Usage in Code

The image is referenced in:
- `product-list.component.html` line ~103
- CSS styling in `product-list.component.css` (`.hero-image` class)

## Fallback

If WebP not available, update HTML to:
```html
<picture>
  <source srcset="/assets/images/hero-shopping.webp" type="image/webp">
  <img src="/assets/images/hero-shopping.png" alt="Shopping mobile" class="hero-image">
</picture>
```

## Current Status

⚠️ **TODO**: Place the user-provided image (mobile phone with shopping cart and packages on orange background) in this directory as `hero-shopping.webp`
