# Module 6: Zustand Cart System with Slide-over Drawer

We have successfully implemented **Module 6: Zustand Cart System with Slide-over Drawer** inside the E-Shop! The shopping cart features a high-fidelity, globally reactive state that dynamically synchronizes selected items and quantities across the main catalog landing view and dynamic details routes (`/products/[slug]`).

---

## 📦 Global Persistent State Management

Shopping cart metrics and item arrays are handled centrally using **Zustand** coupled with the `persist` middleware inside [lib/store/useCartStore.ts](file:///c:/Projects/e-shop/lib/store/useCartStore.ts):

1. **Persistent Client Sessions (`eshop-persistent-cart`)**:
   - Cart arrays are serialized and saved automatically inside the user's `localStorage` session.
   - Restoring a page or navigating back to details preserves cart listings seamlessly across refreshes.
2. **Dynamic Stock Boundaries**:
   - Cart adjustments (`addItem` and `updateQty`) execute real-time stock bounds checks.
   - Customers cannot exceed active postgres catalog stock quantities.
   - Out-of-stock items (`stock = 0`) are disabled for addition completely.
3. **Cart Operations & Actions**:
   - `addItem(item)`: Appends an item to the shopping cart or increments quantity if already exists.
   - `removeItem(id)`: Instantly drops a product listing from the cart.
   - `updateQty(id, qty)`: Reactive increments and decrements. Drops the item if user quantity falls to `0` or below.
   - `toggleDrawer(open?)`: Simple visibility trigger to toggle slide-over drawer globally.
   - `getCartCount()` / `getCartTotal()`: Selectors returning reactive item quantity sums and subtotal prices.

---

## ⚡ React Hydration Safeguards

Next.js App Router pre-renders HTML elements on the server (SSR), where client-specific APIs like `localStorage` are unavailable. Direct injection of Zustand persistent state variables on the initial pre-render triggers a Classic React Hydration Mismatch discrepancy.

To safeguard our components, we implemented **Client Hydration Mount Checks** inside `<CartDrawer />`, `HomeClient.tsx`, and `ProductDetailsClient.tsx`:
```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// Render cart items or badges safely only after hydration
{isMounted && cartCount > 0 && (
  <span className="badge">{cartCount}</span>
)}
```

---

## 🎨 Frosted Glass Slide-over Drawer

The cart panel is housed in a single, high-fidelity `<CartDrawer />` component in [components/CartDrawer.tsx](file:///c:/Projects/e-shop/components/CartDrawer.tsx):
- **Glassmorphism Backdrop**: Uses Tailwind frosted glass configurations (`.glass-panel`) and background blur masks (`backdrop-blur-sm`) with soft fade-in/slide-in entry animations.
- **Detailed Product Item Cards**:
  - Highlights catalog thumbnails (Cloudinary CDN URLs or fallbacks).
  - Displays retail pricing details and incremental quantity adjusters (`+` and `-` buttons) validating stock bounds on the fly.
  - Quick-action "Remove" buttons to discard items.
- **Dynamic Order Summary**:
  - Automatically calculates subtotal values.
  - Presents a simulated checkout CTA button which will seamlessly forward users to Stripe-hosted checkout checkout in Module 7.
