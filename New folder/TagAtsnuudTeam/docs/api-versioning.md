# API Versioning Strategy

The stable API is mounted under `/api/v1`.

Examples:

```http
GET /api/v1/halls
GET /api/v1/payments
GET /api/v1/dashboard/admin
```

Use a new major route prefix, such as `/api/v2`, only when a change can break existing clients. Keep `/api/v1` behavior stable while new clients migrate to the new version.

`/api/v2` currently exists as a placeholder and returns `501 Not Implemented`.

Cache invalidation rules:

- Hall create/update/delete clears `hall:list` and `hall:detail` cache keys.
- Booking create/cancel clears `available-times` cache keys.
- Payment create/update/webhook success clears payment, dashboard, and commission report cache keys.
