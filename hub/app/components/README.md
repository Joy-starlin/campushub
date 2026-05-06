# Bugema Hub Responsive Design System

This comprehensive responsive design system ensures Bugema Hub works seamlessly across all devices with a mobile-first approach.

## Breakpoints

- **Base**: 375px+ (Mobile first)
- **sm**: 640px+ (Small tablets)
- **md**: 768px+ (Tablets)
- **lg**: 1024px+ (Small desktops)
- **xl**: 1280px+ (Large desktops)

## Responsive Components

### 1. ResponsiveContainer
Provides consistent max-widths and centering across breakpoints.

```tsx
<ResponsiveContainer maxWidth="xl">
  <div>Content here</div>
</ResponsiveContainer>
```

### 2. ResponsiveImage
Next.js Image component with proper sizing and optimization.

```tsx
<ResponsiveImage 
  src="/image.jpg" 
  alt="Description"
  aspectRatio="square"
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
/>
```

### 3. ResponsiveTable
Tables with horizontal scroll on mobile and desktop scroll buttons.

```tsx
<ResponsiveTable showScrollButtons>
  <table>
    {/* Table content */}
  </table>
</ResponsiveTable>
```

### 4. ResponsiveModal
Full-screen on mobile, centered popup on desktop.

```tsx
<ResponsiveModal 
  isOpen={isOpen} 
  onClose={handleClose}
  size="md"
>
  <div>Modal content</div>
</ResponsiveModal>
```

### 5. ResponsiveForm
Forms with proper input sizing and touch targets.

```tsx
<ResponsiveForm maxWidth="md">
  <ResponsiveInput label="Name" required />
  <ResponsiveTextarea label="Message" rows={4} />
  <ResponsiveButton variant="primary">Submit</ResponsiveButton>
</ResponsiveForm>
```

### 6. ResponsiveGrid
Grid layouts that adapt to all breakpoints.

```tsx
<ResponsiveGrid 
  cols={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
  gap={{ base: 4, sm: 6, lg: 8 }}
>
  {/* Grid items */}
</ResponsiveGrid>
```

### 7. ResponsiveNavigation
Bottom nav on mobile, top nav on desktop.

```tsx
<ResponsiveNavigation 
  items={navItems}
  user={user}
  notifications={5}
/>
```

## Design Guidelines

### Touch Targets
- **Minimum**: 44x44px for all clickable elements
- **Recommended**: 48x48px for primary actions
- **Spacing**: At least 8px between touch targets

### Typography
- **Mobile**: Minimum 14px base font size
- **Desktop**: 16px base font size
- **Scaling**: Use relative units (rem, em) for accessibility

### Images
- Use Next.js Image component for optimization
- Provide proper `sizes` attribute for responsive loading
- Include fallback content for accessibility
- Use appropriate aspect ratios

### Tables
- Wrap in horizontal scroll container on mobile
- Hide non-essential columns on small screens
- Provide scroll indicators and buttons on desktop
- Use touch-friendly scrolling on mobile

### Forms
- Full-width inputs on mobile (max-width 480px on desktop)
- Minimum 44px height for all input fields
- Proper labels and error states
- Touch-friendly submit buttons

### Modals
- Mobile: Full screen (100vw 100vh)
- Desktop: Centered popup with proper sizing
- Touch-friendly close buttons
- Proper backdrop handling

### Grid Layouts
- Mobile: 1 column (375px+)
- Small tablets: 2 columns (640px+)
- Tablets: 2-3 columns (768px+)
- Desktop: 3-4 columns (1024px+)
- Large desktop: 4+ columns (1280px+)

## Implementation Checklist

### Mobile First (375px+)
- [ ] All text is minimum 14px
- [ ] Touch targets are minimum 44x44px
- [ ] Single column layouts
- [ ] Bottom navigation visible
- [ ] Horizontal scroll for tables
- [ ] Full-screen modals

### Small Tablets (640px+)
- [ ] 2-column grids where applicable
- [ ] Slightly larger touch targets
- [ ] Improved spacing
- [ ] Better image resolutions

### Tablets (768px+)
- [ ] Sidebar navigation appears
- [ ] Bottom navigation hidden
- [ ] 2-3 column layouts
- [ ] Desktop modal behavior
- [ ] Improved form layouts

### Desktop (1024px+)
- [ ] 3-4 column grids
- [ ] Full desktop layout
- [ ] Hover states and transitions
- [ ] Optimized for mouse interaction

### Large Desktop (1280px+)
- [ ] Max-width containers centered
- [ ] Extra whitespace
- [ ] Enhanced typography
- [ ] Premium features enabled

## Usage Examples

### Creating a Responsive Page
```tsx
export default function ResponsivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation items={navItems} />
      
      <ResponsiveContainer maxWidth="xl" className="py-6">
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Page Title</h1>
          
          <ResponsiveGrid 
            cols={{ base: 1, sm: 2, lg: 3 }}
            gap={{ base: 4, lg: 6 }}
          >
            {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-lg">
                <ResponsiveImage 
                  src={item.image} 
                  alt={item.title}
                  aspectRatio="square"
                  className="mb-4"
                />
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
```

### Responsive Form Example
```tsx
export default function ResponsiveFormPage() {
  return (
    <ResponsiveContainer maxWidth="md" className="py-6">
      <ResponsiveForm>
        <ResponsiveInput 
          label="Full Name" 
          required 
          placeholder="Enter your name"
        />
        <ResponsiveInput 
          label="Email" 
          type="email" 
          required 
          placeholder="your@email.com"
        />
        <ResponsiveTextarea 
          label="Message" 
          rows={4}
          placeholder="Type your message here..."
        />
        <ResponsiveButton variant="primary" fullWidth>
          Send Message
        </ResponsiveButton>
      </ResponsiveForm>
    </ResponsiveContainer>
  )
}
```

## Testing

Test responsive behavior at:
1. **375px** - iPhone SE (minimum)
2. **640px** - Small tablets
3. **768px** - iPad (tablets)
4. **1024px** - Small desktops
5. **1280px+** - Large desktops

Use browser dev tools and real devices for comprehensive testing.
