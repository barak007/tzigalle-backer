# Order Components

This directory contains all components related to the order/shopping experience.

## Components Overview

### 🛒 OrderForm

**File:** `OrderForm.tsx`  
**Purpose:** Customer information input form  
**Key Features:**

- Customer details (name, phone, address, city)
- Notes/special requests
- Edit mode for logged-in users
- Inline validation
- Accessibility support

**Usage:**

```tsx
<OrderForm
  customerName={name}
  customerPhone={phone}
  // ... other props
  onSubmit={handleSubmit}
/>
```

---

### 🍞 ProductList

**File:** `ProductList.tsx`  
**Purpose:** Display bread categories and manage cart  
**Key Features:**

- Expandable category accordion
- Add/remove items to cart
- Visual quantity indicators
- Cart badge on categories

**Usage:**

```tsx
<ProductList
  categories={BREAD_CATEGORIES}
  cart={cart}
  onAddToCart={addToCart}
  onRemoveFromCart={removeFromCart}
/>
```

---

### 📋 OrderSummary

**File:** `OrderSummary.tsx`  
**Purpose:** Display cart contents and totals  
**Key Features:**

- Line-item breakdown
- Total price calculation
- Empty state handling
- Clear cart action
- Auto-save indicator

**Usage:**

```tsx
<OrderSummary
  cart={cart}
  totalPrice={totalPrice}
  totalItems={totalItems}
  categories={BREAD_CATEGORIES}
  hasSavedOrder={saved}
  onClearClick={() => setShowDialog(true)}
/>
```

---

### 📅 DeliveryOptions

**File:** `DeliveryOptions.tsx`  
**Purpose:** Delivery date selection  
**Key Features:**

- Tuesday/Friday delivery options
- Deadline indicators
- Days remaining countdown
- Past date validation
- Visual selection state

**Usage:**

```tsx
<DeliveryOptions
  options={deliveryOptions}
  selectedValue={selectedDate}
  deliveryDateError={error}
  onChange={handleDateChange}
/>
```

---

### ✅ SuccessMessage

**File:** `SuccessMessage.tsx`  
**Purpose:** Order confirmation screen  
**Key Features:**

- Success messaging
- Navigation to orders page
- New order action
- Responsive design

**Usage:**

```tsx
<SuccessMessage onNewOrder={() => resetOrder()} />
```

---

### ℹ️ FooterInfo

**File:** `FooterInfo.tsx`  
**Purpose:** Static business information  
**Key Features:**

- Quality assurance info
- Ordering schedule
- Contact information
- Responsive grid layout

**Usage:**

```tsx
<FooterInfo />
```

---

### 🗑️ ClearOrderDialog

**File:** `ClearOrderDialog.tsx`  
**Purpose:** Confirm order clearing  
**Key Features:**

- Confirmation dialog
- Warning message
- Cancel/Confirm actions
- Destructive action styling

**Usage:**

```tsx
<ClearOrderDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  onConfirm={handleClear}
/>
```

---

## Design Patterns

### Component Communication

- **Props down, events up:** Parent manages state, children emit events
- **Controlled components:** All form inputs are controlled
- **Composition:** Small, focused components composed together

### State Management

- **Local UI state:** Managed in components (expanded categories, etc.)
- **Form state:** Managed via custom hook (`use-order-state`)
- **Server state:** Fetched via server actions

### Styling

- **Tailwind CSS:** Utility-first styling
- **shadcn/ui:** Base component library
- **RTL Support:** All components support right-to-left layout
- **Responsive:** Mobile-first design

---

## Testing Strategy

### Unit Tests (Recommended)

```tsx
// OrderForm.test.tsx
- Should render form fields
- Should validate phone number
- Should handle form submission
- Should toggle edit mode
```

```tsx
// ProductList.test.tsx
- Should display categories
- Should add items to cart
- Should remove items from cart
- Should show cart count
```

```tsx
// OrderSummary.test.tsx
- Should calculate totals correctly
- Should display line items
- Should show empty state
- Should trigger clear action
```

### Integration Tests

- Complete order flow
- Cart persistence
- Form validation
- Success flow

---

## Accessibility Features

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Error announcements

---

## Performance Considerations

- **Lazy loading:** Components can be code-split
- **Memoization:** Use React.memo for expensive components
- **Debouncing:** Input changes are debounced
- **Virtual scrolling:** Consider for large product lists

---

## Future Enhancements

### Potential Improvements

1. **Animation:** Add smooth transitions
2. **Images:** Add product images
3. **Search:** Add product search/filter
4. **Favorites:** Save favorite items
5. **Ratings:** Add product ratings
6. **Recommendations:** Suggest similar items

---

## Dependencies

- React 18+
- Next.js 14+
- shadcn/ui components
- Tailwind CSS
- Lucide icons

---

## Related Files

- `hooks/use-order-state.ts` - State management hook
- `lib/utils/order-delivery.ts` - Date calculation utilities
- `app/actions/orders.ts` - Server actions
- `lib/constants/bread-categories.ts` - Product data

---

_Last Updated: October 2, 2025_
