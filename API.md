# DealOrbit — REST API Specifications (API.md)

> **Document Version:** 1.0.0  
> **Status:** Approved / Base Specification  
> **Base URL:** `http://localhost:5000/api/v1`  
> **Protocol:** HTTP/1.1 with TLS 1.3 (HTTPS in Production)  
> **Data Format:** JSON (`Content-Type: application/json`)  
> **Direct Interoperability:** Implements contracts for all services and entities defined in `PRD.md`, `User_flows.md`, `Architecture.md`, and `Database.md`.

---

## 1. Global API Conventions & Standards

### 1.1 HTTP Status Codes
* `200 OK` — Successful query or idempotent update.
* `201 Created` — Successful resource creation.
* `400 Bad Request` — Input validation error (Zod schema failure).
* `401 Unauthorized` — Missing, invalid, or expired JWT access token.
* `403 Forbidden` — Insufficient role permissions or portal token scope violation.
* `404 Not Found` — Resource ID does not exist.
* `409 Conflict` — Optimistic concurrency conflict (version mismatch during quote update).
* `422 Unprocessable Entity` — Domain rule violation (e.g., negative quantity, invalid state transition).
* `500 Internal Server Error` — Unhandled server exception.

### 1.2 Standard JSON Envelopes

#### Success Envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2026-09-05T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "DISCOUNT_CEILING_EXCEEDED",
    "message": "Line item discount of 18.00% breaches category ceiling of 10.00%",
    "details": [
      {
        "field": "lines[1].discountPercent",
        "message": "Maximum allowable discount is 10.00%"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-09-05T12:00:00.000Z"
  }
}
```

### 1.3 Authentication & Authorization Headers
* **Internal Platform Requests:**
  ```http
  Authorization: Bearer <jwt_access_token>
  ```
* **Customer Portal Requests:**
  ```http
  x-portal-token: <secure_uuid_token>
  ```
  *(Or passed directly as a route parameter in `/api/v1/portal/:token/*`)*

---

## 2. API Endpoint Directory

```
/api/v1
├── /auth
│   ├── POST   /login
│   ├── POST   /refresh-token
│   ├── POST   /logout
│   └── GET    /me
├── /admin
│   ├── GET    /discount-ceilings
│   ├── PUT    /discount-ceilings
│   ├── GET    /approval-chains
│   ├── PUT    /approval-chains
│   ├── GET    /warehouses
│   ├── POST   /warehouses
│   ├── PUT    /warehouses/:id/stock
│   ├── GET    /subscription-plans
│   ├── GET    /upsell-rules
│   └── GET    /reports/sales
├── /quotations
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── POST   /:id/submit-review
│   ├── POST   /:id/publish-portal
│   └── POST   /:id/convert-to-order
├── /simulations
│   ├── POST   /run
│   └── POST   /apply
├── /upsell
│   └── POST   /recommendations
├── /approvals
│   ├── GET    /pending
│   └── POST   /:id/decision
├── /portal/:token
│   ├── GET    /
│   ├── POST   /inquiry
│   ├── POST   /counter-offer
│   └── POST   /confirm
├── /fulfillment
│   ├── GET    /check-feasibility
│   ├── POST   /split-order/:orderId
│   ├── PUT    /split-order/:splitId/override
│   └── POST   /backorders/:id/consolidate
├── /billing
│   ├── GET    /orders/:orderId/invoices
│   ├── GET    /orders/:orderId/subscriptions
│   ├── POST   /subscriptions/:id/modify
│   ├── POST   /subscriptions/:id/cancel
│   └── POST   /invoices/:id/record-payment
└── /deal-health
    ├── GET    /radar
    ├── POST   /nudge/:quoteId
    └── POST   /escalate/:quoteId
```

---

## 3. Module 1: Authentication & Session (`/api/v1/auth`)

### 3.1 `POST /api/v1/auth/login`
Authenticates internal platform users and issues JWT access and refresh tokens.

* **Request Body:**
```json
{
  "email": "rep@dealorbit.com",
  "password": "Password123!"
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-rep-001",
      "name": "Sam Seller",
      "email": "rep@dealorbit.com",
      "role": "SALES_REP",
      "historicalAvgDiscount": 9.20
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "ref-tok-987654321",
      "expiresIn": 3600
    }
  }
}
```

---

## 4. Module 2: Admin & Configuration (`/api/v1/admin`)

### 4.1 `GET /api/v1/admin/discount-ceilings`
Retrieves customer tier ceilings and product category overrides.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "customerTiers": [
      { "tier": "BRONZE", "defaultCeiling": 5.00 },
      { "tier": "SILVER", "defaultCeiling": 10.00 },
      { "tier": "GOLD", "defaultCeiling": 15.00 },
      { "tier": "ENTERPRISE", "defaultCeiling": 20.00 }
    ],
    "categoryOverrides": [
      { "category": "HARDWARE", "maxDiscount": 15.00 },
      { "category": "SOFTWARE", "maxDiscount": 20.00 },
      { "category": "SERVICES", "maxDiscount": 10.00 }
    ]
  }
}
```

### 4.2 `GET /api/v1/admin/reports/sales`
Retrieves filtered commercial metrics with export format options.

* **Query Parameters:**
  * `startDate` (ISO8601, optional)
  * `endDate` (ISO8601, optional)
  * `repId` (UUID, optional)
  * `status` (QuoteStatus, optional)
  * `format` (`json` | `pdf` | `xls`, default: `json`)

* **Response (`200 OK` for format=json):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalQuotes": 42,
      "totalBookedValue": 12450000.00,
      "averageMarginPercent": 22.40,
      "averageDiscountPercent": 10.15,
      "stalledDealCount": 3
    },
    "quotes": [
      {
        "quoteNumber": "QT-2026-0001",
        "customerName": "Acme Corp",
        "repName": "Sam Seller",
        "grandTotal": 1700000.00,
        "dealMarginPercent": 21.50,
        "blendedRiskScore": 24.00,
        "status": "ACCEPTED"
      }
    ]
  }
}
```

---

## 5. Module 3: Living Quotation Engine (`/api/v1/quotations`)

### 5.1 `GET /api/v1/quotations`
Retrieves list of active quotations for the sales workspace or pipeline.

* **Query Parameters:** `status`, `customerId`, `search`, `page`, `limit`.
* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quotations": [
      {
        "id": "q-9021",
        "quoteNumber": "QT-2026-0042",
        "version": 2,
        "customer": { "id": "c-101", "name": "Acme Corp", "tier": "GOLD" },
        "salesRep": { "id": "usr-rep-001", "name": "Sam Seller" },
        "status": "IN_REVIEW",
        "grandTotal": 1805400.00,
        "dealMarginPercent": 21.50,
        "blendedRiskScore": 38.00,
        "lineCount": 3,
        "createdAt": "2026-09-05T10:00:00Z"
      }
    ],
    "pagination": { "total": 1, "page": 1, "limit": 20 }
  }
}
```

### 5.2 `POST /api/v1/quotations`
Initializes a new draft quotation for a customer.

* **Request Body:**
```json
{
  "customerId": "c-101",
  "paymentTerms": "Net 30"
}
```

* **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "q-9022",
    "quoteNumber": "QT-2026-0043",
    "version": 1,
    "status": "DRAFT",
    "customerId": "c-101",
    "customerTier": "GOLD",
    "effectiveCeiling": 15.00,
    "lines": [],
    "subtotalAmount": 0.00,
    "grandTotal": 0.00,
    "dealMarginPercent": 0.00,
    "blendedRiskScore": 0.00,
    "portalToken": "pt-550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 5.3 `PUT /api/v1/quotations/:id`
Updates quotation lines, quantities, and discounts with optimistic concurrency locking.

* **Headers:** `If-Match: <version_number>`
* **Request Body:**
```json
{
  "version": 1,
  "paymentTerms": "Net 30",
  "lines": [
    {
      "productId": "p-lap-01",
      "quantity": 20,
      "discountPercent": 12.00,
      "isRecurring": false,
      "billingFrequency": "ONE_TIME"
    },
    {
      "productId": "p-svc-01",
      "quantity": 1,
      "discountPercent": 18.00,
      "isRecurring": false,
      "billingFrequency": "ONE_TIME"
    }
  ]
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "q-9022",
    "quoteNumber": "QT-2026-0043",
    "version": 2,
    "status": "DRAFT",
    "subtotalAmount": 1820000.00,
    "totalDiscountAmount": 225600.00,
    "taxAmount": 286992.00,
    "grandTotal": 1881392.00,
    "dealMarginPercent": 18.40,
    "blendedRiskScore": 38.50,
    "approvalRequirement": "MANAGER_REQUIRED",
    "lines": [
      {
        "id": "line-01",
        "productName": "Enterprise Pro Laptop 16\"",
        "category": "HARDWARE",
        "quantity": 20,
        "unitPrice": 85000.00,
        "discountPercent": 12.00,
        "effectiveCeiling": 15.00,
        "isViolation": false,
        "violationPoints": 0.00,
        "netLinePrice": 1496000.00,
        "lineMarginPercent": 23.50
      },
      {
        "id": "line-02",
        "productName": "On-Site Deployment & Setup",
        "category": "SERVICES",
        "quantity": 1,
        "unitPrice": 120000.00,
        "discountPercent": 18.00,
        "effectiveCeiling": 10.00,
        "isViolation": true,
        "violationPoints": 8.00,
        "netLinePrice": 98400.00,
        "lineMarginPercent": -1.60
      }
    ],
    "inventoryFeasibility": {
      "isFeasible": true,
      "availableStock": 20,
      "requestedStock": 20,
      "shortage": 0,
      "estimatedShipments": 2
    }
  }
}
```

* **Error Response (`409 Conflict`):**
```json
{
  "success": false,
  "error": {
    "code": "CONCURRENT_MODIFICATION_CONFLICT",
    "message": "Quotation has been modified by another session. Current version is 2. Please refresh and re-apply."
  }
}
```

### 5.4 `POST /api/v1/quotations/:id/submit-review`
Submits the quotation for automated governance evaluation and routes to the appropriate approval tier.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quoteId": "q-9022",
    "status": "IN_REVIEW",
    "blendedRiskScore": 38.50,
    "assignedTier": 1,
    "assignedApproverRole": "SALES_MANAGER",
    "auditEntryId": "aud-1092"
  },
  "message": "Quotation submitted for Sales Manager approval."
}
```

---

## 6. Module 4: Deal Strategy Simulator (`/api/v1/simulations`)

### 6.1 `POST /api/v1/simulations/run`
Executes dual-sided simulation (Business Impact + Grounded Customer Response) and returns synthesized Scenarios A, B, and C.

* **Request Body:**
```json
{
  "quotationId": "q-9022",
  "whatIfOverrides": {
    "hardwareDiscount": 10.00,
    "includeBundleSku": "WAR-ACC-2YR",
    "bundleDiscount": 5.00
  }
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quotationId": "q-9022",
    "customerProfile": {
      "customerName": "Acme Corp",
      "historicalDiscountRange": [8.00, 12.00],
      "priceSensitivity": "HIGH",
      "serviceAffinity": 0.85
    },
    "scenarios": [
      {
        "id": "SCENARIO_A",
        "name": "Status Quo (High Discount)",
        "hardwareDiscount": 15.00,
        "serviceDiscount": 18.00,
        "projectedMargin": 14.20,
        "projectedRiskScore": 56.00,
        "requiredApprovals": ["SALES_MANAGER", "FINANCE_DIRECTOR"],
        "estimatedShipments": 2,
        "predictedCustomerResponse": {
          "acceptanceProbability": 48.00,
          "negotiationProbability": 42.00,
          "rejectionProbability": 10.00,
          "expectedCounter": "Customer likely to counter for additional 2-3% or Net 60 terms."
        }
      },
      {
        "id": "SCENARIO_B",
        "name": "Recommended Strategy (Balanced Bundle)",
        "hardwareDiscount": 10.00,
        "serviceDiscount": 10.00,
        "addedBundleSku": "WAR-ACC-2YR",
        "bundleDiscount": 5.00,
        "projectedMargin": 21.50,
        "projectedRiskScore": 22.00,
        "requiredApprovals": ["SALES_MANAGER"],
        "estimatedShipments": 2,
        "predictedCustomerResponse": {
          "acceptanceProbability": 68.00,
          "negotiationProbability": 24.00,
          "rejectionProbability": 8.00,
          "expectedCounter": "High probability of immediate acceptance due to warranty inclusion."
        },
        "strategicRationale": "Hardware discount of 10% falls exactly within Acme's historical acceptance corridor (8-12%). Adding discounted warranty preserves gross margin (+730 bps) while eliminating Finance approval latency."
      },
      {
        "id": "SCENARIO_C",
        "name": "Margin Defense (Conservative)",
        "hardwareDiscount": 7.00,
        "serviceDiscount": 8.00,
        "projectedMargin": 25.20,
        "projectedRiskScore": 14.00,
        "requiredApprovals": [],
        "estimatedShipments": 2,
        "predictedCustomerResponse": {
          "acceptanceProbability": 58.00,
          "negotiationProbability": 34.00,
          "rejectionProbability": 8.00,
          "expectedCounter": "Customer may counter hardware discount back to 10%."
        }
      }
    ]
  }
}
```

### 6.2 `POST /api/v1/simulations/apply`
Applies a simulated scenario configuration directly to the active quotation cart.

* **Request Body:**
```json
{
  "quotationId": "q-9022",
  "scenarioId": "SCENARIO_B"
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quoteId": "q-9022",
    "version": 3,
    "appliedScenario": "SCENARIO_B",
    "newGrandTotal": 1835000.00,
    "newMarginPercent": 21.50,
    "newRiskScore": 22.00
  },
  "message": "Scenario B successfully applied to active quotation."
}
```

---

## 7. Module 5: Live Upsell & Cross-Sell (`/api/v1/upsell`)

### 7.1 `POST /api/v1/upsell/recommendations`
Returns ranked recommendations for the current quotation cart.

* **Request Body:**
```json
{
  "quotationId": "q-9022",
  "cartProductIds": ["p-lap-01", "p-svc-01"]
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "ruleId": "upsell-01",
        "product": {
          "id": "WAR-ACC-2YR",
          "name": "2-Year Accidental Damage Protection",
          "sku": "WAR-ACC-2YR",
          "category": "SOFTWARE",
          "unitPrice": 18000.00
        },
        "marginDeltaPercent": 2.40,
        "affinityScore": 0.85,
        "promotionalTag": "PROMOTED",
        "isMarginSafe": true
      },
      {
        "ruleId": "upsell-02",
        "product": {
          "id": "DOCK-PRO-USBC",
          "name": "Universal USB-C Dual 4K Dock",
          "sku": "DOCK-PRO-USBC",
          "category": "HARDWARE",
          "unitPrice": 12500.00
        },
        "marginDeltaPercent": 1.20,
        "affinityScore": 0.74,
        "promotionalTag": "FREQUENT_PAIRING",
        "isMarginSafe": true
      }
    ]
  }
}
```

---

## 8. Module 6: Approvals & Governance (`/api/v1/approvals`)

### 8.1 `GET /api/v1/approvals/pending`
Lists quotations awaiting manager or finance sign-off.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "pendingApprovals": [
      {
        "requestId": "appr-req-01",
        "quotationId": "q-9022",
        "quoteNumber": "QT-2026-0043",
        "customerName": "Acme Corp",
        "customerTier": "GOLD",
        "salesRep": {
          "name": "Sam Seller",
          "historicalAvgDiscount": 9.20
        },
        "blendedRiskScore": 38.50,
        "tierLevel": 1,
        "proposedDiscount": 18.00,
        "violatingLines": [
          {
            "productName": "On-Site Deployment & Setup",
            "category": "SERVICES",
            "ceiling": 10.00,
            "proposed": 18.00,
            "overagePoints": 8.00
          }
        ],
        "requestedAt": "2026-09-05T10:30:00Z"
      }
    ]
  }
}
```

### 8.2 `POST /api/v1/approvals/:id/decision`
Records an approval, rejection, or revision request with mandatory audit justification.

* **Request Body:**
```json
{
  "decision": "APPROVED",
  "reason": "Strategic account renewal; margin protected through bundled services."
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "requestId": "appr-req-01",
    "quotationId": "q-9022",
    "status": "APPROVED",
    "nextStep": "READY_TO_PUBLISH",
    "auditLogId": "aud-1099"
  },
  "message": "Quotation successfully approved."
}
```

---

## 9. Module 7: Restricted Customer Portal (`/api/v1/portal/:token`)

> **CRITICAL SECURITY GUARANTEE:** All endpoints under `/api/v1/portal/:token` execute through the data-masking sanitizer. Internal costs (`costPrice`), line margins (`lineMarginPercent`), total deal margins (`dealMarginPercent`), and `blendedRiskScore` are physically stripped at the controller layer.

### 9.1 `GET /api/v1/portal/:token`
Retrieves the sanitized bill of materials for customer review.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quoteNumber": "QT-2026-0043",
    "version": 3,
    "customerName": "Acme Corp",
    "status": "CUSTOMER_REVIEW",
    "currency": "INR",
    "lineItems": [
      {
        "id": "line-01",
        "sku": "LAP-PRO-16",
        "description": "Enterprise Pro Laptop 16\"",
        "quantity": 20,
        "unitPrice": 85000.00,
        "discountPercent": 10.00,
        "netLinePrice": 1530000.00
      },
      {
        "id": "line-02",
        "sku": "WAR-ACC-2YR",
        "description": "2-Year Accidental Damage Protection",
        "quantity": 20,
        "unitPrice": 18000.00,
        "discountPercent": 5.00,
        "netLinePrice": 342000.00
      }
    ],
    "subtotalAmount": 2060000.00,
    "totalDiscountAmount": 188000.00,
    "taxAmount": 336960.00,
    "grandTotal": 2208960.00,
    "paymentTerms": "Net 30",
    "expiresAt": "2026-09-19T00:00:00Z"
  }
}
```

### 9.2 `POST /api/v1/portal/:token/counter-offer`
Submits a customer counter-discount proposal, triggering automatic governance re-evaluation.

* **Request Body:**
```json
{
  "lineItemId": "line-01",
  "proposedDiscount": 14.00,
  "message": "Procurement requires 14% on laptops to finalize approval this quarter."
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quoteNumber": "QT-2026-0043",
    "status": "NEGOTIATING",
    "reApprovalRequired": true,
    "messageId": "msg-501"
  },
  "message": "Counter-offer transmitted to sales team. Awaiting rep review."
}
```

### 9.3 `POST /api/v1/portal/:token/confirm`
Digitally accepts and confirms the agreed quotation.

* **Request Body:**
```json
{
  "signerName": "Jordan Procurement",
  "signerTitle": "Director of IT Procurement",
  "acceptanceNotes": "Terms agreed and confirmed."
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quoteNumber": "QT-2026-0043",
    "status": "ACCEPTED",
    "salesOrderNumber": "SO-2026-0012",
    "confirmedAt": "2026-09-05T14:00:00Z"
  },
  "message": "Quotation confirmed. Order is entering fulfillment."
}
```

---

## 10. Module 8: Logistics & Multi-Warehouse Fulfillment (`/api/v1/fulfillment`)

### 10.1 `POST /api/v1/fulfillment/split-order/:orderId`
Runs the auto-split optimization algorithm on a confirmed sales order.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "orderId": "so-2026-0012",
    "orderNumber": "SO-2026-0012",
    "totalShipments": 2,
    "fulfillmentSplits": [
      {
        "shipmentNumber": "SHIP-2026-0012-A",
        "warehouse": { "id": "wh-main", "name": "Main Central Hub", "costWeight": 1.00 },
        "status": "READY_FOR_PICKING",
        "lines": [
          { "sku": "LAP-PRO-16", "quantityFulfilled": 12 }
        ]
      },
      {
        "shipmentNumber": "SHIP-2026-0012-B",
        "warehouse": { "id": "wh-east", "name": "East Depot", "costWeight": 1.30 },
        "status": "READY_FOR_PICKING",
        "lines": [
          { "sku": "LAP-PRO-16", "quantityFulfilled": 8 }
        ]
      }
    ],
    "backorders": []
  }
}
```

### 10.2 `POST /api/v1/fulfillment/backorders/:id/consolidate`
Consolidates replenishing inventory into a dispatch manifest for an open backorder.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "backorderId": "bo-401",
    "status": "CONSOLIDATED",
    "shipmentNumber": "SHIP-2026-0012-C",
    "quantityDispatched": 5,
    "warehouseName": "Main Central Hub"
  },
  "message": "Remaining backorder consolidated and dispatched."
}
```

---

## 11. Module 9: Hybrid Billing, Subscriptions & Proration (`/api/v1/billing`)

### 11.1 `GET /api/v1/billing/orders/:orderId/invoices`
Retrieves one-time commercial invoices generated for an order.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "invoiceNumber": "INV-2026-0088",
        "type": "COMMERCIAL_INVOICE",
        "status": "SENT",
        "subtotal": 1530000.00,
        "taxAmount": 275400.00,
        "totalAmount": 1805400.00,
        "dueDate": "2026-10-05T00:00:00Z"
      }
    ]
  }
}
```

### 11.2 `GET /api/v1/billing/orders/:orderId/subscriptions`
Retrieves recurring subscription contracts and future billing schedules.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "contractNumber": "SUB-2026-0042",
        "status": "ACTIVE",
        "billingFrequency": "MONTHLY",
        "recurringAmount": 30000.00,
        "currentPeriodStart": "2026-09-01T00:00:00Z",
        "currentPeriodEnd": "2026-09-30T00:00:00Z",
        "nextBillingDate": "2026-10-01T00:00:00Z",
        "schedule": [
          { "date": "2026-10-01", "amount": 30000.00, "status": "SCHEDULED" },
          { "date": "2026-11-01", "amount": 30000.00, "status": "SCHEDULED" },
          { "date": "2026-12-01", "amount": 30000.00, "status": "SCHEDULED" }
        ]
      }
    ]
  }
}
```

### 11.3 `POST /api/v1/billing/subscriptions/:id/modify`
Executes mid-cycle plan changes and calculates exact day-count proration charges.

* **Request Body:**
```json
{
  "newPlanRate": 45000.00,
  "effectiveDate": "2026-09-16T00:00:00Z"
}
```

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "contractNumber": "SUB-2026-0042",
    "previousRate": 30000.00,
    "newRate": 45000.00,
    "proration": {
      "daysRemaining": 15,
      "daysInPeriod": 30,
      "prorationFraction": 0.50,
      "proratedChargeAmount": 7500.00,
      "adjustmentInvoiceNumber": "INV-2026-PRORATE-001"
    }
  },
  "message": "Subscription modified. Proration invoice generated."
}
```

---

## 12. Module 10: Deal Health & Anomaly Radar (`/api/v1/deal-health`)

### 12.1 `GET /api/v1/deal-health/radar`
Scans and returns active pipeline anomalies, stalled quotes, and delivery risks.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-01",
        "quotationId": "q-9011",
        "quoteNumber": "QT-2026-0038",
        "customerName": "Beta Industries",
        "alertType": "STALLED_DEAL",
        "severity": "MEDIUM",
        "metricValue": 8.0,
        "benchmarkValue": 7.0,
        "description": "Quotation inactive in CUSTOMER_REVIEW for 8 consecutive days (SLA: 7 days).",
        "createdAt": "2026-09-05T08:00:00Z"
      },
      {
        "id": "alert-02",
        "quotationId": "q-9022",
        "quoteNumber": "QT-2026-0043",
        "customerName": "Acme Corp",
        "alertType": "DISCOUNT_ANOMALY",
        "severity": "HIGH",
        "metricValue": 18.0,
        "benchmarkValue": 9.2,
        "description": "Proposed service discount (18%) exceeds rep 90-day moving average (9.2%) by > 2.5 sigma.",
        "createdAt": "2026-09-05T10:30:00Z"
      }
    ]
  }
}
```

### 12.2 `POST /api/v1/deal-health/nudge/:quoteId`
Dispatches an automated in-app or email nudge to the assigned sales representative.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "quoteId": "q-9011",
    "repEmail": "rep@dealorbit.com",
    "action": "NUDGE_DISPATCHED",
    "dispatchedAt": "2026-09-05T12:30:00Z"
  },
  "message": "Follow-up nudge successfully sent to sales representative."
}
```

---

## 13. Document Interoperability & Next Steps

This API specification defines the complete contract for frontend-backend communication. Subsequent files build upon these endpoint definitions:
1. `PRD.md` — Product Requirements & Innovation Framework *(Completed)*.
2. `User_flows.md` — Persona User Stories & Step-by-Step State Machines *(Completed)*.
3. `Architecture.md` — Clean Layered System Architecture *(Completed)*.
4. `Database.md` — PostgreSQL Relational Schema & Prisma Models *(Completed)*.
5. `API.md` — Complete RESTful Endpoints & Contract Specifications *(Completed)*.
6. **`Features.md`** *(Next Up)* — Comprehensive Feature Matrix, Business Logic Rules, and Acceptance Criteria.
7. `Memory.md` — State Governance, Session Management, and Audit Ledger Conventions.
8. `Pages.md` — Frontend View Architecture, Route Trees, Layouts, and Component Hierarchy.
