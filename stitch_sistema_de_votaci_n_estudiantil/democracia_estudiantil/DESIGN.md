---
name: Democracia Estudiantil
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#434655'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style
The design system is engineered for a professional student governance environment, prioritizing trust, clarity, and institutional integrity. The brand personality is "Academic Modernism"—combining the reliability of traditional educational institutions with the efficiency and polish of top-tier SaaS platforms. 

The visual style follows a **Modern Minimalism** approach. It leverages high-quality typography and generous whitespace to reduce cognitive load during the high-stakes activity of voting. The interface feels "quiet" yet premium, utilizing subtle depth cues and a restricted color palette to ensure that the user’s focus remains entirely on the democratic process.

## Colors
The palette is rooted in "Institutional Blue," representing authority and digital stability. 

- **Primary:** Institutional Blue (#2563EB) is used for the "Primary Action" state, selection indicators, and active navigational elements.
- **Surface Layering:** The design system uses a two-step background approach. The base canvas is `Gray-50` (#F9FAFB), while interactive cards and containers are pure White (#FFFFFF).
- **Text Hierarchy:** `Gray-800` (#1F2937) serves as the primary ink for readability, with `Gray-500` (#6B7280) reserved for secondary metadata and labels.
- **Status:** Use standard semantic colors for validation: Green (#10B981) for "Voto Registrado" and Red (#EF4444) for "Error de Validación."

## Typography
The system relies exclusively on **Inter** to achieve a systematic, neutral, and highly legible appearance. 

Tighten letter-spacing on larger headlines to create a "premium" editorial feel. For body text, maintain standard tracking to ensure accessibility for students of all ages. All typography should be rendered with `antialiased` smoothing. Use `SemiBold` (600) for interactive elements like buttons and navigation links to differentiate them from static content.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy for desktop to maintain the "Workspace" feel of apps like Notion. 

- **Desktop:** 12-column grid with a 1200px max-width, centered.
- **Mobile:** Single column with 16px side margins. 
- **Vertical Rhythm:** Use an 8px base unit. Components should be separated by `stack-lg` (32px) for distinct sections and `stack-md` (16px) for related elements. 
- **Padding:** Content cards must feature internal padding of at least 24px to maintain the "Premium" sense of space.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. This system avoids heavy borders, favoring soft shadows to define boundaries.

- **Level 0 (Canvas):** #F9FAFB. Used for the main background.
- **Level 1 (Card):** White background with a `shadow-sm` (0 1px 2px 0 rgba(0, 0, 0, 0.05)). Used for secondary information or lists.
- **Level 2 (Interactive):** White background with a `shadow-md` (0 4px 6px -1px rgba(0, 0, 0, 0.1)). Used for the main voting cards and focused inputs.
- **Hover States:** When hovering over a candidate card, the elevation should shift from `shadow-sm` to `shadow-md` with a subtle Y-axis translation of -2px.

## Shapes
The shape language is "Extra Soft." Following the `rounded-2xl` requirement:
- **Small Components (Buttons, Inputs):** 0.5rem (8px).
- **Medium Components (Cards, Modals):** 1rem (16px).
- **Large Containers:** 1.5rem (24px).

Incorporate subtle geometric backgrounds (e.g., light blue faint circles or grids) behind the main "Header" sections to add a layer of modern sophistication without distracting from the text.

## Components

### Buttons
- **Primary:** Solid #2563EB with White text. Rounded-lg (8px). Micro-interaction: scale down to 0.98 on click.
- **Secondary:** Light gray background (#F3F4F6) with #1F2937 text.

### Candidate Cards
- Must feature a circular avatar container with a 2px offset border.
- The "Votar" button should only appear or highlight on hover/focus to keep the UI clean.
- Include a "Propuestas" link using the `label-sm` style with a Lucide `ExternalLink` icon.

### Input Fields
- Use a subtle border (#E5E7EB) that transitions to #2563EB on focus.
- Help text (e.g., "Ingresa tu número de carné") should use `caption-xs` in #6B7280.

### Progress Indicator
- For the voting steps, use a thin horizontal line with "Step" nodes. 
- Active steps are #2563EB; completed steps show a Lucide `Check` icon.

### Icons
- Use **Lucide Icons** with a 2px stroke width. 
- Icons should always be accompanied by labels for accessibility, except in the mobile bottom navigation bar.