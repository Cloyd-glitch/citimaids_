---
sidebar_position: 3
---

# Components

Reusable UI components live in `citimaids-frontend/src/components/`. These are shared across multiple pages and form the building blocks of both the customer portal and admin panel.

---

## `Navbar.jsx`

**Location:** `src/components/Navbar.jsx`

The site-wide navigation header for the customer portal.

**Features:**
- Official CitiMaids badge logo linking to `/`
- Desktop navigation links: Home, Services, About, Contact, Book Now
- Mobile hamburger drawer with the same links
- Staff portal entry points are **not** exposed here (hidden from public)
- Smooth scroll-triggered background opacity on desktop

**Props:** None (reads from `useSettings` hook for live contact data)

---

## `Footer.jsx`

**Location:** `src/components/Footer.jsx`

The site-wide footer rendered at the bottom of every customer page.

**Features:**
- Official CitiMaids badge and brand name
- Verified contact details:
  - Primary phone: `+971 52 634 9461` (clickable `tel:` link)
  - Secondary phone: `+971 58 175 3958`
  - Primary email: `info@citi-maids.com`
  - Secondary email: `citimaidsuae@gmail.com`
  - Address: Aljazeera Tower, Room 45, Hamdan St, Abu Dhabi
- WhatsApp quick-connect button
- Social media icons: Facebook, TikTok
- Consumer links: Terms of Service · Privacy Policy

**Note:** The "Staff Portal Login" link was intentionally removed from the footer in the `feature/services-branding-and-booking` branch to keep the public interface clean.

---

## `BeforeAfterSlider.jsx`

**Location:** `src/components/BeforeAfterSlider.jsx`

An interactive drag-to-compare image slider showing cleaning transformations.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `beforeSrc` | `string` | Path to the "before" image |
| `afterSrc` | `string` | Path to the "after" image |
| `beforeLabel` | `string` | Label shown on the before side (default: `"Before"`) |
| `afterLabel` | `string` | Label shown on the after side (default: `"After"`) |
| `title` | `string` | Optional heading above the slider |

**Usage in `HomePage.jsx`:**

```jsx
<BeforeAfterSlider
  beforeSrc="/images/transformations/living-room-before.jpg"
  afterSrc="/images/transformations/living-room-after.jpg"
  title="Living Room & Marble Floor Restoration"
/>
```

**Implementation notes:**
- Uses `mousedown`, `touchstart`, and `mousemove` events for smooth drag
- The divider position is tracked as a percentage (0–100)
- Images are 1-to-1 matched scenes (same room, same angle) for realistic comparison

---

## `FloatingWhatsApp.jsx`

**Location:** `src/components/FloatingWhatsApp.jsx`

A floating action button fixed in the bottom-right corner that opens WhatsApp with a pre-filled message.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `phone` | `string` | WhatsApp number in international format (e.g. `+971526349461`) |
| `message` | `string` | Pre-filled message text |

**Implementation notes:**
- Opens `https://wa.me/{phone}?text={encodedMessage}` in a new tab
- Animated pulse ring on the button for visual attention

---

## `ProtectedRoute.jsx`

**Location:** `src/components/ProtectedRoute.jsx`

An authentication guard component that wraps protected admin routes.

**Behavior:**
- Reads `token` from `AuthContext`
- If authenticated → renders `children`
- If not authenticated → redirects to `/admin/login` using React Router's `<Navigate>`

**Usage in `App.jsx`:**

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
```

---

## `Reveal.jsx`

**Location:** `src/components/Reveal.jsx`

A scroll-triggered reveal animation wrapper using the **Intersection Observer API**.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Content to animate |
| `delay` | `number` | `0` | Animation delay in milliseconds |
| `direction` | `string` | `"up"` | Slide direction: `"up"`, `"left"`, `"right"` |

**Usage:**

```jsx
<Reveal delay={200}>
  <ServiceCard service={service} />
</Reveal>
```

**Implementation notes:**
- Uses `IntersectionObserver` with a 0.1 threshold
- Applies a CSS class (`is-visible`) when the element enters the viewport
- Once revealed, the observer disconnects to avoid repeated triggers

---

## `icons/`

**Location:** `src/components/icons/`

A collection of custom SVG icon components used across the admin panel service cards. Each icon component corresponds to a service category (e.g. `HomeIcon`, `OfficeIcon`, `PoolIcon`, `GardenIcon`).
