# Invicta Jewel API (summary)

Base URL: `/api` (e.g. `https://localhost:7098/api`).

## Auth

- `POST /auth/login` — body `{ "email", "password" }` → `{ "token", "tokenType": "Bearer" }`.
- Admin routes: `Authorization: Bearer <token>`.

## Categories

- `GET /categories` — active tree.
- `GET /categories/{id}` — optional `?includeProducts=true`.
- `GET /categories/by-slug/{slug}`
- `GET /categories/{id}/products` — query: `page`, `pageSize`, `sortBy`, `sortOrder`, `minPrice`, `maxPrice`, `isOnSale`, `includeInactive`.
- `POST|PUT|DELETE /categories/...` — admin.
- `PATCH /categories/{id}/toggle-status` — admin.
- `POST /categories/{id}/apply-sale` — body `{ "salePrice" }`, admin.
- `DELETE /categories/{id}/remove-sale` — admin.

## Products

- `GET /products` — list/filter/pagination (same sort/price/sale params as above + `categoryId`, `search`).
- `GET /products/featured?take=8`
- `GET /products/new-arrivals?take=8`
- `GET /products/{id}?admin=true` (optional)
- `GET /products/by-slug/{slug}`
- CRUD + `PATCH .../toggle-status`, `PATCH .../sale`, `DELETE .../sale`, `POST .../upload-image` — admin (`multipart/form-data`, `productId`, `file`).

## Cart

- `GET /cart/{cartIdentifier}`
- `POST /cart` — new cart id.
- `POST /cart/items` — `{ cartIdentifier, productId, quantity }`
- `PUT /cart/items/{itemId}` — `{ quantity }`
- `DELETE /cart/items/{itemId}`
- `DELETE /cart/{cartIdentifier}`
- `GET /cart/{cartIdentifier}/summary`

## Orders

- `POST /orders` — create from cart (COD); body matches `CreateOrderDto`.
- `GET /orders/{orderNumber}`
- `GET /orders/track/{orderNumber}` — same payload as above (public tracking).
- `GET /orders` — admin, paginated.
- `PUT /orders/{orderId}/status` — admin, `{ "status" }` (`Pending`, `Confirmed`, …).

OpenAPI details: run the API and open `/swagger`.
