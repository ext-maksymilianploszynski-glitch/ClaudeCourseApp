# SPEC.md — Warehouse Management App

## 1. Goal

A lightweight single-warehouse inventory management system.
Users can manage products, track stock levels, and process incoming/outgoing orders.

---

## 2. Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, TypeScript, React Query |
| Backend    | ASP.NET Core 8 Web API (Minimal API)    |
| Database   | SQLite + Entity Framework Core 8        |
| Auth       | None (planned for future)              |

---

## 3. Data Models

### Product
| Field              | Type    | Notes                                      |
|--------------------|---------|--------------------------------------------|
| Id                 | int     | PK, auto-increment                        |
| Name               | string  | Required                                   |
| SKU                | string  | Unique, required                           |
| Category           | string  | Free text, optional                        |
| Unit               | string  | e.g. "szt", "kg", "m"                     |
| Price              | decimal | Unit purchase price, optional              |
| LowStockThreshold  | int     | Alert when stock <= this value (default 0) |
| CreatedAt          | datetime|                                            |

### Order
| Field       | Type        | Notes                                          |
|-------------|-------------|------------------------------------------------|
| Id          | int         | PK, auto-increment                            |
| Type        | enum        | `Incoming` / `Outgoing`                        |
| Status      | enum        | `Draft` → `Confirmed` → `Completed`            |
| Notes       | string      | Optional description / reference number        |
| CreatedAt   | datetime    |                                                |
| CompletedAt | datetime?   | Set when status = Completed                    |

### OrderItem
| Field      | Type    | Notes                              |
|------------|---------|------------------------------------|
| Id         | int     | PK                                 |
| OrderId    | int     | FK → Order                         |
| ProductId  | int     | FK → Product                       |
| Quantity   | int     | Required, > 0                      |
| UnitPrice  | decimal | Price at time of order             |

---

## 4. Stock Calculation

Stock for a product is calculated as:

```
CurrentStock =
  SUM(quantity of Completed Incoming OrderItems)
  - SUM(quantity of Completed Outgoing OrderItems)
```

A product is flagged as **low stock** when `CurrentStock <= LowStockThreshold`.

Stock can never go negative — completing an outgoing order must be blocked if stock is insufficient.

---

## 5. API Endpoints

### Products
| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | /products           | List all products (with stock)     |
| GET    | /products/{id}      | Get single product (with stock)    |
| POST   | /products           | Create product                     |
| PUT    | /products/{id}      | Update product                     |
| DELETE | /products/{id}      | Delete product (if no orders)      |

### Orders
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | /orders               | List orders (filterable by type/status)|
| GET    | /orders/{id}          | Get order with items                 |
| POST   | /orders               | Create draft order                   |
| PUT    | /orders/{id}          | Update order (only if Draft)         |
| POST   | /orders/{id}/confirm  | Confirm order                        |
| POST   | /orders/{id}/complete | Complete order (updates stock)       |
| DELETE | /orders/{id}          | Delete order (only if Draft)         |

### Order Items
| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| POST   | /orders/{id}/items               | Add item to order      |
| PUT    | /orders/{id}/items/{itemId}      | Update item quantity   |
| DELETE | /orders/{id}/items/{itemId}      | Remove item            |

---

## 6. Frontend Pages

### `/products` — Product List
- Table: Name, SKU, Category, Unit, Price, Current Stock, Low Stock alert badge
- "Low stock" badge shown in red when stock <= threshold
- Actions: Add, Edit, Delete

### `/products/new` and `/products/:id/edit` — Product Form
- Fields: Name, SKU, Category, Unit, Price, Low Stock Threshold

### `/orders` — Order List
- Table: ID, Type (badge), Status (badge), Notes, Created, # Items
- Filter by Type and Status
- Actions: View, Delete (Draft only)

### `/orders/new` — Create Order
- Select Type: Incoming / Outgoing
- Add items: pick product from dropdown, set quantity and unit price
- Save as Draft, then Confirm, then Complete

### `/orders/:id` — Order Detail
- Show order header (type, status, notes, dates)
- List of items (product name, quantity, unit price, subtotal)
- Action buttons based on status:
  - Draft: Confirm, Delete
  - Confirmed: Complete
  - Completed: read-only

### `/` — Dashboard (simple)
- Total product count
- Total orders count (by status)
- List of products with low stock (highlighted)

---

## 7. UI/UX Notes

- Minimal, clean UI — no heavy design frameworks required (Tailwind or simple CSS)
- Low stock warning: red badge / row highlight in product list and on dashboard
- Confirmation dialog before delete or order completion
- Responsive layout (desktop-first is fine)

---

## 8. Out of Scope (for now)

- User authentication and roles
- Multiple warehouses or warehouse zones
- Supplier / customer management
- Reporting and exports
- Product images
- Barcode / QR code scanning