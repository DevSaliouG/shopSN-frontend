# Analytics Dashboard - Design System

## Overview
Dashboard analytics professionnel sans emojis, utilisant des icônes SVG Heroicons et suivant les principes UI/UX Pro Max.

## Design Principles Applied

### ✅ No Emojis as Icons
- Tous les emojis ont été remplacés par des icônes SVG Heroicons
- Les icônes sont cohérentes et évolutives (vectorielles)
- Support du dark mode natif

### ✅ Color System
- **Primary**: Blue 600 (#2563EB) - Actions principales, données
- **Success**: Emerald 600 (#059669) - Métriques positives, conversions
- **Warning**: Amber 600 (#D97706) - Revenue, alertes
- **Accent**: Violet 600 (#7C3AED) - Highlights, graphiques
- **Neutral**: Slate (50-900) - Backgrounds, textes, bordures

### ✅ Typography
- **Font Family**: System fonts (SF Pro, Segoe UI, Roboto)
- **Font Weights**: 
  - Regular (400) - Body text
  - Medium (500) - Labels
  - Semibold (600) - Headers, KPIs
  - Bold (700) - Large numbers
- **Font Sizes**: Scale 12px → 14px → 16px → 20px → 24px → 32px → 48px
- **Line Height**: 1.5 (body), 1.2 (headers)
- **Tabular Numbers**: Pour alignement des chiffres

### ✅ Spacing System
- Base unit: 4px (Tailwind spacing)
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- Consistent gaps entre éléments
- Responsive padding (4-6 sur mobile/desktop)

### ✅ Accessibility (WCAG AA+)
- **Contrast Ratios**: 
  - Text on white: 4.5:1 minimum
  - Large text: 3:1 minimum
  - Focus indicators: 3:1 minimum
- **Keyboard Navigation**: Focus visible sur tous les éléments interactifs
- **Screen Reader**: Labels sémantiques, aria-labels
- **Motion**: `prefers-reduced-motion` supporté

### ✅ Interactive States
- **Hover**: Shadow elevation + subtle scale
- **Active**: Pressed state avec opacity
- **Focus**: 2px blue outline avec offset
- **Disabled**: 50% opacity, cursor not-allowed
- **Transition**: 200ms cubic-bezier smooth

### ✅ Components Structure

#### KPI Cards (4 principales)
- Icon badge (colored background)
- Label + Value
- Change indicator avec icône directionnelle
- Hover effect subtil

#### Secondary KPIs (5 cards)
- Compact design
- Icon + Label
- Single metric
- Online status avec pulse animation

#### Device & Source Stats
- Progress bars animées
- Icon per type
- Percentage + absolute numbers
- Color-coded par catégorie

#### Real-time Section
- Gradient background (emerald)
- Large number display
- Live pages list
- Auto-refresh indicator

## Icon Mapping

| Metric | Icon | Color |
|--------|------|-------|
| Unique Visitors | Users group | Blue |
| Total Sessions | Bar chart | Emerald |
| Conversion Rate | Trending up | Violet |
| Revenue | Currency | Amber |
| Page Views | Eye | Slate |
| Pages/Session | Document | Slate |
| Duration | Clock | Slate |
| Bounce Rate | Arrow back | Slate |
| Online | Lightning bolt | Emerald |
| Desktop | Monitor | Blue |
| Mobile | Mobile device | Emerald |
| Tablet | Tablet | Amber |
| Direct | Link | Indigo |
| Search | Search | Pink |
| Social | Users | Teal |
| Referral | External link | Slate |

## Responsive Breakpoints
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (4 columns)

## Animation Guidelines
- **Duration**: 150-300ms for micro-interactions
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) - ease-out
- **Hover**: 200ms
- **Focus**: Instant (0ms)
- **Loading**: Spin animation 1s linear
- **Progress Bars**: 600ms ease-out
- **Pulse (online)**: 2s infinite

## Performance Considerations
- SVG icons inline (no external requests)
- Lazy loading for heavy components
- Debounced auto-refresh (30s-60s)
- Optimized re-renders avec Angular signals
- Minimal shadow/blur effects

## Testing Checklist
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader announces correctly
- [ ] Colors meet contrast requirements
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations respect prefers-reduced-motion
- [ ] No layout shift on data load
- [ ] Loading states clear
- [ ] Error states handled

## Future Enhancements
- [ ] Dark mode toggle
- [ ] Export dashboard to PDF
- [ ] Custom date range picker
- [ ] Real-time charts (Chart.js/Apache ECharts)
- [ ] Geographic map visualization
- [ ] Drill-down to session details
- [ ] Comparison mode (period vs period)
- [ ] Alerts & notifications setup
