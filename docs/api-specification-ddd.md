# Nova Platform — API Specification (Domain-Driven Design)

**Version:** 1.0.0  
**Date:** 18 April 2026  
**Base URL:** `https://api.afinbank.com/v1`  
**Auth:** Bearer JWT (OAuth 2.0 + PKCE)  
**Content-Type:** `application/json`

---

## Domain Map

```
nova-platform/
├── product-catalogue/     # Bounded Context: Product Management
│   ├── lending/           # Aggregate: Lending Bucket
│   ├── savings/           # Aggregate: Savings Bucket
│   ├── shared-ownership/  # Aggregate: SO Product
│   └── insurance/         # Aggregate: Insurance Product
├── pricing/               # Bounded Context: Pricing Engine
│   ├── dimensions/        # Entity: Rate Dimensions (LTV, Credit, Employment, Property, EPC, Loyalty)
│   ├── eligibility/       # Service: Bucket-Aware Eligibility
│   └── rate-matrix/       # Read Model: Rate Grid
├── origination/           # Bounded Context: Loan Origination
│   ├── applications/      # Aggregate: Loan Application
│   ├── dip/               # Entity: Decision in Principle
│   ├── eligibility-check/ # Service: Pre-Application Eligibility
│   └── smart-apply/       # Service: AI-Assisted Application
├── underwriting/          # Bounded Context: Credit Decisioning
│   ├── cases/             # Aggregate: UW Case
│   ├── decisions/         # Entity: Credit Decision
│   ├── risk-assessment/   # Service: AI Risk Scoring
│   └── policy-check/      # Service: Policy Validation
├── customer/              # Bounded Context: Customer Management
│   ├── customers/         # Aggregate: Customer
│   ├── parties/           # Entity: Connected Parties
│   ├── complaints/        # Entity: Complaint
│   ├── communications/    # Entity: Communication Log
│   └── lifecycle/         # Service: Lifecycle Prediction
├── servicing/             # Bounded Context: Mortgage Servicing
│   ├── accounts/          # Aggregate: Servicing Account
│   ├── payments/          # Entity: Payment
│   ├── actions/           # Service: Account Actions (Rate Switch, Payment Holiday, etc.)
│   └── collections/       # Entity: Arrears Management
├── finance/               # Bounded Context: Treasury & Disbursements
│   ├── disbursements/     # Aggregate: Disbursement Instruction
│   └── reconciliation/    # Service: Payment Reconciliation
├── operations/            # Bounded Context: Ops & Workflow
│   ├── pipeline/          # Read Model: Case Pipeline
│   ├── sla/               # Service: SLA Management
│   ├── communications/    # Aggregate: Outbound Comms
│   └── escalations/       # Entity: Escalation
├── intelligence/          # Bounded Context: Analytics & AI
│   ├── scenario-modeller/ # Service: Macro Stress Testing
│   ├── pricing-engine/    # Service: Rate Impact Modelling
│   └── journey-analytics/ # Read Model: Customer Journey MI
├── identity/              # Bounded Context: IAM
│   ├── users/             # Aggregate: Platform User
│   ├── roles/             # Entity: Role & Permission Set
│   ├── sessions/          # Entity: Active Session
│   └── audit/             # Entity: Audit Log
└── platform/              # Bounded Context: Platform Config
    ├── theme/             # Entity: White-Label Theme
    ├── features/          # Entity: Feature Flags
    └── releases/          # Entity: Release Notes
```

---

## 1. PRODUCT CATALOGUE DOMAIN

### 1.1 Lending Buckets

```
Aggregate: LendingBucket
├── BucketProduct (entity)
├── BucketTier (entity)
├── BucketCriteria (value object)
└── BucketFees (value object)
```

#### `GET /product-catalogue/lending/buckets`
List all lending product buckets.

**Response:**
```json
[
  {
    "id": "bucket_prime",
    "name": "Prime",
    "color": "#059669",
    "description": "Clean credit · Standard criteria · Purchase & remortgage",
    "maxLTV": 75,
    "acceptedCreditProfiles": ["clean", "near_prime"],
    "acceptedEmployments": ["Employed", "Self-Employed", "Contractor"],
    "acceptedProperties": ["Standard", "New Build", "Ex-Local Authority"],
    "acceptedEpc": ["A", "B", "C", "D", "E", "F", "G"],
    "productCount": 3,
    "tierCount": 5,
    "createdAt": "2026-04-01T00:00:00Z",
    "updatedAt": "2026-04-18T10:30:00Z"
  }
]
```

#### `POST /product-catalogue/lending/buckets`
Create a new lending bucket.

**Request:**
```json
{
  "name": "Prime",
  "color": "#059669",
  "description": "Clean credit · Standard criteria",
  "maxLTV": 75,
  "acceptedCreditProfiles": ["clean", "near_prime"],
  "acceptedEmployments": ["Employed", "Self-Employed", "Contractor"],
  "acceptedProperties": ["Standard", "New Build"],
  "acceptedEpc": ["A", "B", "C", "D", "E", "F", "G"],
  "criteria": {
    "loanSize": { "min": 25000, "max": 1000000 },
    "age": { "min": 21, "maxAtEnd": 75 },
    "maxApplicants": 2,
    "residency": "UK citizen / Settled / Pre-settled status",
    "minUKResidency": "3 years",
    "incomeMultiple": "4.49x single / 4.49x joint",
    "stressRate": "SVR + 1% or 5.50% floor",
    "employment": ["Employed (min 6 months)", "Self-employed (min 2 years)"],
    "property": {
      "minValue": 75000,
      "acceptable": ["Houses", "Flats (up to 6 floors)", "Bungalows"],
      "unacceptable": ["Above commercial", "Mobile homes"],
      "valuation": "Full valuation required"
    }
  },
  "fees": {
    "productFee": 1495,
    "reversion": "BBR + 3.99%",
    "termRange": "2-40 years",
    "valuationFees": [
      { "upTo": 100000, "fee": 150 },
      { "upTo": 200000, "fee": 225 }
    ]
  }
}
```

#### `GET /product-catalogue/lending/buckets/{bucketId}`
Get bucket with full detail including products, tiers, criteria, fees.

#### `PUT /product-catalogue/lending/buckets/{bucketId}`
Update bucket configuration.

#### `DELETE /product-catalogue/lending/buckets/{bucketId}`
Delete bucket and all associated products/tiers.

---

#### `GET /product-catalogue/lending/buckets/{bucketId}/products`
List products within a bucket.

**Response:**
```json
[
  {
    "id": "prod_p2f",
    "type": "2-Year Fixed",
    "code": "P2F",
    "erc": "3%, 2%",
    "rates": {
      "≤60%": 4.19,
      "60-75%": 4.49
    }
  }
]
```

#### `POST /product-catalogue/lending/buckets/{bucketId}/products`
Add a product to a bucket.

**Request:**
```json
{
  "type": "2-Year Fixed",
  "erc": "3%, 2%",
  "rates": {
    "≤60%": 4.19,
    "60-75%": 4.49
  }
}
```
**Note:** `code` is auto-generated from bucket name + product type.

#### `PUT /product-catalogue/lending/buckets/{bucketId}/products/{productId}`
Update product rates/ERC.

#### `DELETE /product-catalogue/lending/buckets/{bucketId}/products/{productId}`
Remove product from bucket.

---

#### `GET /product-catalogue/lending/buckets/{bucketId}/tiers`
List pricing tiers for a bucket.

**Response:**
```json
[
  {
    "id": "tier_self_employed",
    "name": "Self-Employed",
    "adjustmentType": "flat",
    "flatAdj": 0.15,
    "gridAdj": null,
    "conditions": {
      "credit": ["clean"],
      "employment": ["Self-Employed", "Contractor"]
    }
  }
]
```

#### `POST /product-catalogue/lending/buckets/{bucketId}/tiers`
Create a tier (max 5 per bucket).

**Request:**
```json
{
  "name": "Self-Employed",
  "adjustmentType": "flat",
  "flatAdj": 0.15,
  "conditions": {
    "employment": ["Self-Employed", "Contractor"]
  }
}
```

#### `PUT /product-catalogue/lending/buckets/{bucketId}/tiers/{tierId}`
Update tier conditions/adjustment.

#### `DELETE /product-catalogue/lending/buckets/{bucketId}/tiers/{tierId}`
Remove tier.

---

### 1.2 Savings Buckets

```
Aggregate: SavingsBucket
├── SavingsProduct (entity)
├── ConditionTier (entity)
└── BalanceTier (value object)
```

#### `GET /product-catalogue/savings/buckets`
#### `POST /product-catalogue/savings/buckets`

**Request (create):**
```json
{
  "name": "Fixed Term Deposit",
  "color": "#059669",
  "description": "Fixed rate for a set term",
  "minDeposit": 1000,
  "maxBalance": 1000000,
  "fscsProtected": true,
  "interestPayment": "At Maturity",
  "withdrawalRules": "No withdrawals before maturity. Early closure penalty: 90 days interest.",
  "balanceTiersEnabled": true,
  "balanceTiers": [
    { "band": "£1k–£9.9k", "adj": 0.00 },
    { "band": "£10k–£49.9k", "adj": 0.25 },
    { "band": "£50k–£199.9k", "adj": 0.40 },
    { "band": "£200k+", "adj": 0.55 }
  ]
}
```

#### `GET /product-catalogue/savings/buckets/{bucketId}`
#### `PUT /product-catalogue/savings/buckets/{bucketId}`
#### `DELETE /product-catalogue/savings/buckets/{bucketId}`

#### `POST /product-catalogue/savings/buckets/{bucketId}/products`

**Request:**
```json
{
  "name": "1yr Fixed Standard",
  "term": "1 Year Fixed",
  "baseRate": 4.25,
  "wrapper": "",
  "eligibility": ""
}
```
**Note:** `code` auto-generated.

#### `PUT /product-catalogue/savings/buckets/{bucketId}/products/{productId}`
#### `DELETE /product-catalogue/savings/buckets/{bucketId}/products/{productId}`

#### `POST /product-catalogue/savings/buckets/{bucketId}/tiers`

**Request:**
```json
{
  "name": "Loyalty Bonus",
  "flatAdj": 0.15,
  "conditions": {
    "loyalty": ["Existing", "Multi-Product"]
  }
}
```

#### `PUT /product-catalogue/savings/buckets/{bucketId}/tiers/{tierId}`
#### `DELETE /product-catalogue/savings/buckets/{bucketId}/tiers/{tierId}`

---

### 1.3 Shared Ownership

#### `GET /product-catalogue/shared-ownership/products`
#### `GET /product-catalogue/shared-ownership/products/{productId}/rates?shareBand=25%`
#### `GET /product-catalogue/shared-ownership/criteria`
#### `GET /product-catalogue/shared-ownership/housing-associations`

---

### 1.4 Insurance

#### `GET /product-catalogue/insurance/products`
#### `GET /product-catalogue/insurance/products/{productId}`
#### `GET /product-catalogue/insurance/products/{productId}/premiums?smokerStatus=Non-smoker&ageBand=25-34`

---

## 2. PRICING DOMAIN

### 2.1 Dimensions

```
Aggregate: PricingDimension
├── LTV Band (value object)
├── Credit Profile (value object)
├── Employment Adjustment (value object)
├── Property Adjustment (value object)
├── EPC Adjustment (value object)
└── Loyalty Adjustment (value object)
```

#### `GET /pricing/dimensions`
Returns all configurable pricing dimensions.

**Response:**
```json
{
  "ltv": [
    { "band": "≤60%", "min": 0, "max": 60, "adj": 0.00 },
    { "band": "60-75%", "min": 60, "max": 75, "adj": 0.30 }
  ],
  "credit": [
    { "id": "clean", "label": "Clean", "desc": "No adverse ever", "adj": 0.00 },
    { "id": "near_prime", "label": "Near Prime", "desc": "1 missed payment >12 months ago", "adj": 0.25, "maxLTV": null }
  ],
  "employment": { "Employed": 0.00, "Self-Employed": 0.20, "Contractor": 0.15 },
  "property": { "Standard": 0.00, "Non-Standard": 0.25, "New Build": 0.10 },
  "epc": { "A": -0.15, "B": -0.10, "C": -0.05, "D": 0.00, "E": 0.10, "F": 0.10, "G": 0.10 },
  "loyalty": { "New": 0.00, "Existing": -0.05, "Multi-Product": -0.10 },
  "purpose": { "Purchase": 0.00, "Remortgage": -0.10, "BTL": 0.50 }
}
```

#### `PUT /pricing/dimensions/{dimensionType}`
Update a dimension's adjustments.

#### `POST /pricing/dimensions/reset`
Reset all dimensions to factory defaults.

---

### 2.2 Eligibility

#### `POST /pricing/eligibility`
Run bucket-aware eligibility check.

**Request:**
```json
{
  "ltv": 72,
  "credit": "clean",
  "employment": "Employed",
  "property": "Standard",
  "epc": "C",
  "loanAmount": 350000,
  "age": 35,
  "termYears": 25
}
```

**Response:**
```json
{
  "results": [
    {
      "bucket": "Prime",
      "bucketColor": "#059669",
      "product": "2-Year Fixed",
      "code": "P2F",
      "rate": 4.49,
      "available": true,
      "erc": "3%, 2%",
      "tier": "Standard",
      "tierAdj": 0.00,
      "baseRate": 4.49,
      "maxLTV": 75,
      "incomeMultiple": "4.49x",
      "fees": {
        "productFee": "£1,495",
        "reversion": "BBR + 3.99%"
      }
    },
    {
      "bucket": "Prime",
      "product": "2-Year Fixed",
      "rate": null,
      "available": false,
      "reason": "LTV 72% exceeds Prime max 75%"
    }
  ],
  "meta": {
    "totalProducts": 15,
    "eligible": 8,
    "ineligible": 7,
    "checkedAt": "2026-04-18T10:30:00Z"
  }
}
```

---

### 2.3 Rate Calculation

#### `POST /pricing/rate`
Calculate rate for a specific product + customer profile.

**Request:**
```json
{
  "product": "2-Year Fixed",
  "bucket": "Prime",
  "ltv": 72,
  "credit": "clean",
  "employment": "Employed",
  "property": "Standard",
  "epc": "C",
  "loyalty": "New",
  "purpose": "Purchase"
}
```

**Response:**
```json
{
  "rate": 4.49,
  "available": true,
  "breakdown": {
    "base": 4.19,
    "ltv": { "band": "60-75%", "adj": 0.30 },
    "credit": { "profile": "Clean", "adj": 0.00 },
    "employment": { "type": "Employed", "adj": 0.00 },
    "property": { "type": "Standard", "adj": 0.00 },
    "epc": { "rating": "C", "adj": -0.05 },
    "loyalty": { "tier": "New", "adj": 0.00 },
    "purpose": { "type": "Purchase", "adj": 0.00 }
  }
}
```

#### `POST /pricing/monthly-payment`
Calculate monthly repayment.

**Request:** `{ "principal": 350000, "annualRate": 4.49, "termYears": 25 }`  
**Response:** `{ "monthly": 1948 }`

---

### 2.4 Rate Matrix (Read Model)

#### `GET /pricing/rate-matrix/lending`
Returns the full lending rate grid from bucket products.

#### `GET /pricing/rate-matrix/savings`
Returns the full savings rate grid from savings buckets.

---

## 3. ORIGINATION DOMAIN

### 3.1 Applications

```
Aggregate: LoanApplication
├── Applicant (entity)
├── Property (value object)
├── DIPResult (entity)
├── Document (entity)
└── Squad (value object)
```

#### `POST /origination/applications`
Create a new loan application.

**Request:**
```json
{
  "applicantType": "single",
  "applicant1": {
    "title": "Mr",
    "firstName": "James",
    "surname": "Mitchell",
    "dob": "1988-06-14",
    "niNumber": "QQ 12 34 56 C",
    "address": { "postcode": "BS1 4NZ", "address1": "14 Oak Lane", "city": "Bristol" },
    "employment": {
      "status": "Employed",
      "employer": "TechCorp Ltd",
      "basicSalary": 70000,
      "bonus": 8000,
      "startDate": "2019-03-01"
    },
    "creditProfile": "clean"
  },
  "applicant2": null,
  "property": {
    "address": "14 Oak Lane, Bristol BS1 4NZ",
    "type": "Semi-Detached",
    "value": 485000,
    "tenure": "Freehold",
    "epc": "C"
  },
  "deposit": 135000,
  "term": 25,
  "repaymentType": "Capital & Interest",
  "purpose": "Purchase"
}
```

**Response:**
```json
{
  "id": "AFN-2026-00200",
  "status": "Draft",
  "loanAmount": 350000,
  "ltv": 72.16,
  "createdAt": "2026-04-18T10:00:00Z",
  "squad": {
    "adviser": "ADV-01",
    "underwriter": null,
    "ops": null
  }
}
```

#### `GET /origination/applications`
List applications. Filters: `?status=Underwriting&assignedTo=UW-01`

#### `GET /origination/applications/{applicationId}`
Get full application detail.

#### `PUT /origination/applications/{applicationId}`
Update application fields.

#### `POST /origination/applications/{applicationId}/submit`
Submit application for underwriting.

---

### 3.2 DIP (Decision in Principle)

#### `POST /origination/applications/{applicationId}/dip`
Run DIP assessment.

**Request:**
```json
{
  "productCode": "P2F",
  "bucket": "Prime"
}
```

**Response:**
```json
{
  "id": "DIP-2026-00142-001",
  "outcome": "Approved",
  "product": "2-Year Fixed",
  "bucket": "Prime",
  "tier": "Standard",
  "rate": 4.49,
  "loanAmount": 350000,
  "ltv": 72,
  "term": 25,
  "income": 78000,
  "expenditure": 2900,
  "stressRate": 7.49,
  "stressPayment": 2620,
  "creditScore": 742,
  "assessedAt": "2026-04-18T10:05:00Z",
  "expiresAt": "2026-07-18T10:05:00Z"
}
```

#### `GET /origination/applications/{applicationId}/dip`
List all DIPs run for this application.

---

### 3.3 Documents

#### `POST /origination/applications/{applicationId}/documents`
Upload document. `Content-Type: multipart/form-data`

**Fields:** `file`, `category` (Fact Find, Payslip, Bank Statement, P60, ID Document, Proof of Address, Valuation)

**Response:**
```json
{
  "id": "DOC-001",
  "name": "Payslip_Mar_2026.pdf",
  "category": "Payslip",
  "status": "Processing",
  "uploadedAt": "2026-04-18T10:10:00Z"
}
```

#### `GET /origination/applications/{applicationId}/documents`
#### `GET /origination/applications/{applicationId}/documents/{docId}/ai-analysis`

**Response (AI analysis):**
```json
{
  "confidence": 96,
  "status": "Verified",
  "extractedFields": {
    "employer": "TechCorp Ltd",
    "grossMonthly": 5833,
    "payDate": "2026-03-28"
  },
  "flags": [],
  "summary": "Employer: TechCorp Ltd. Gross: £5,833/mo."
}
```

---

### 3.4 Smart Apply (AI-Assisted)

#### `POST /origination/smart-apply/data-pull`
Trigger AI data pull for an application.

**Request:** `{ "applicationId": "AFN-2026-00200" }`

**Response:**
```json
{
  "steps": [
    { "source": "Land Registry", "status": "complete", "result": "14 Oak Lane, BS1 4NZ — Semi-detached, Freehold" },
    { "source": "AVM", "status": "complete", "result": "£495,000 (87% confidence)" },
    { "source": "Credit Bureau", "status": "complete", "result": "Score: 742 (Good) — No adverse" },
    { "source": "HMRC", "status": "complete", "result": "Employment verified: TechCorp Ltd since 03/2019" },
    { "source": "Electoral Roll", "status": "complete", "result": "Registered at 14 Oak Lane since 2019" },
    { "source": "Sanctions/PEP", "status": "complete", "result": "Clear — no matches" }
  ],
  "autoPopulatedFields": 42,
  "confidence": 94
}
```

---

## 4. UNDERWRITING DOMAIN

### 4.1 Cases

#### `GET /underwriting/queue`
List cases in the UW queue. Filters: `?assignedTo=UW-01&riskLevel=High&sortBy=riskScore`

**Response:**
```json
[
  {
    "caseId": "AFN-2026-00142",
    "applicant": "James & Sarah Mitchell",
    "product": "2-Year Fixed",
    "bucket": "Prime",
    "tier": "Standard",
    "amount": 350000,
    "ltv": 72,
    "riskScore": 18,
    "riskLevel": "Low",
    "status": "Underwriting",
    "mandateLevel": "L1",
    "slaRemaining": "22h",
    "assignedTo": "UW-01"
  }
]
```

#### `GET /underwriting/cases/{caseId}`
Full case detail including overview, product, applicant, AI assessment.

#### `GET /underwriting/cases/{caseId}/timeline`
Case journey timeline (all events from creation to current).

---

### 4.2 Risk Assessment

#### `POST /underwriting/cases/{caseId}/risk-assessment`
Run or refresh AI risk scoring.

**Response:**
```json
{
  "overallScore": 91,
  "riskLevel": "Low",
  "dimensions": {
    "borrower": { "score": 92, "detail": "Strong employment history, good credit score" },
    "affordability": { "score": 88, "detail": "DTI 18.2%, stress test passes with surplus" },
    "collateral": { "score": 95, "detail": "AVM within 3% of surveyor valuation" },
    "policy": { "score": 100, "detail": "All lending policy rules satisfied" },
    "fraud": { "score": 98, "detail": "No fraud indicators detected" },
    "sensitivity": { "score": 72, "detail": "Borderline at +3% stress — monitor" }
  },
  "recommendation": "APPROVE",
  "findings": [
    { "type": "info", "text": "Strong employment history (7 years at current employer)" },
    { "type": "warning", "text": "P60 discrepancy of £2,500 — explained by bonus timing" }
  ],
  "assessedAt": "2026-04-18T10:30:00Z"
}
```

---

### 4.3 Policy Check

#### `POST /underwriting/cases/{caseId}/policy-check`
Run policy validation against lending rules.

**Response:**
```json
{
  "overallStatus": "PASS",
  "rules": [
    { "rule": "Max LTV", "status": "pass", "detail": "72% within 75% limit" },
    { "rule": "Age at End of Term", "status": "pass", "detail": "63 within 75 limit" },
    { "rule": "Income Multiple", "status": "pass", "detail": "4.49x within 4.49x limit" },
    { "rule": "Credit Profile", "status": "pass", "detail": "Clean — accepted" }
  ]
}
```

---

### 4.4 Decisions

#### `POST /underwriting/cases/{caseId}/decision`
Record underwriting decision.

**Request:**
```json
{
  "decision": "approve",
  "reasonCode": null,
  "conditions": [
    { "text": "Full valuation required", "accepted": true },
    { "text": "Employer reference within 30 days", "accepted": true }
  ],
  "underwriterNotes": "Clean case. All checks passed."
}
```

**Decision values:** `approve`, `approve_conditions`, `refer`, `decline`

**Response:**
```json
{
  "id": "DEC-2026-00142",
  "decision": "approve",
  "mandateLevel": "L1",
  "decidedBy": "UW-01",
  "decidedAt": "2026-04-18T11:00:00Z",
  "auditTrailId": "AUD-00456"
}
```

---

## 5. CUSTOMER DOMAIN

### 5.1 Customers

```
Aggregate: Customer
├── Product Holding (entity)
├── Connected Party (entity)
├── Complaint (entity)
├── Communication (entity)
├── Service Interaction (entity)
└── Gamification Profile (value object)
```

#### `GET /customers`
List customers. Filters: `?segment=Premier&customerType=consumer&risk=High&search=Mitchell`

#### `GET /customers/{customerId}`
Full customer aggregate (profile, products, risk, gamification).

#### `POST /customers`
Create customer.

#### `PUT /customers/{customerId}`
Update customer profile.

#### `GET /customers/{customerId}/products`
List all product holdings.

#### `GET /customers/{customerId}/parties`
List connected parties (broker, solicitor, employer, etc.).

#### `POST /customers/{customerId}/parties`
Add connected party.

#### `GET /customers/{customerId}/timeline`
Full event timeline.

#### `GET /customers/{customerId}/complaints`
#### `POST /customers/{customerId}/complaints`

#### `GET /customers/{customerId}/communications`
#### `POST /customers/{customerId}/communications`
Log an interaction (call, email, note).

**Request:**
```json
{
  "type": "inbound_call",
  "subject": "Rate enquiry",
  "body": "Customer asked about rate switch options",
  "sentiment": "Positive",
  "outcome": "Provided rate switch comparison",
  "followUp": false
}
```

#### `GET /customers/{customerId}/lifecycle`
Lifecycle prediction (churn risk, cross-sell opportunities, LTV growth).

#### `GET /customers/{customerId}/risk`
Risk assessment (score, vulnerability, KYC status, arrears).

#### `GET /customers/at-risk`
List at-risk customers (risk score > 60, in arrears, vulnerable, or open complaints).

---

## 6. SERVICING DOMAIN

### 6.1 Accounts

```
Aggregate: ServicingAccount
├── Payment (entity)
├── AccountAction (entity)
└── VulnerabilityAlert (entity)
```

#### `GET /servicing/accounts`
List servicing accounts. Filters: `?state=Active&customerId=CUS-002`

#### `GET /servicing/accounts/{accountId}`
Full account detail with bucket/tier, squad, AI recommendations.

#### `GET /servicing/accounts/{accountId}/payments`
Payment history.

#### `GET /servicing/accounts/{accountId}/timeline`
Account event timeline.

---

### 6.2 Account Actions

#### `POST /servicing/accounts/{accountId}/payment-holiday`
Request payment holiday.

**Request:** `{ "months": 3 }`

**Response:**
```json
{
  "id": "ACT-001",
  "type": "payment_holiday",
  "months": 3,
  "impactOnTerm": "+4 months",
  "additionalInterest": 2840,
  "status": "pending_approval"
}
```

#### `POST /servicing/accounts/{accountId}/rate-switch`
Initiate rate switch.

**Request:** `{ "newProductCode": "P5F", "effectiveDate": "2026-06-15" }`

#### `POST /servicing/accounts/{accountId}/overpayment`
Record overpayment.

#### `POST /servicing/accounts/{accountId}/redemption`
Request redemption quote.

**Response:**
```json
{
  "outstandingBalance": 285432,
  "erc": 8562.96,
  "dailyInterest": 35.12,
  "totalRedemption": 294030.08,
  "validUntil": "2026-05-18"
}
```

---

## 7. FINANCE DOMAIN

### 7.1 Disbursements

```
Aggregate: Disbursement
```

#### `GET /finance/disbursements`
List disbursements. Filters: `?status=Pending Authorisation`

#### `POST /finance/disbursements`
Create disbursement instruction (Maker).

**Request:**
```json
{
  "loanId": "AFN-2026-00142",
  "borrower": "James & Sarah Mitchell",
  "amount": 350000,
  "account": { "sortCode": "20-45-67", "accountNumber": "12345678" },
  "scheduledDate": "2026-04-20",
  "notes": "Completion funds"
}
```

#### `POST /finance/disbursements/{disbursementId}/submit`
Submit for authorisation (Draft → Pending Authorisation).

#### `POST /finance/disbursements/{disbursementId}/authorise`
Authorise disbursement (Checker — must be different user from Maker).

#### `POST /finance/disbursements/{disbursementId}/reject`
Reject with reason.

---

## 8. OPERATIONS DOMAIN

### 8.1 Pipeline

#### `GET /operations/pipeline`
Real-time pipeline view.

**Response:**
```json
{
  "stages": [
    { "stage": "Application Received", "count": 12, "avgWait": "2h", "slaBreaches": 0 },
    { "stage": "KYC", "count": 8, "avgWait": "4h", "slaBreaches": 1 },
    { "stage": "Underwriting", "count": 15, "avgWait": "18h", "slaBreaches": 2 }
  ],
  "escalations": [
    { "caseId": "AFN-2026-00139", "stage": "Underwriting", "timeInStage": "36h", "riskLevel": "High" }
  ],
  "squadCapacity": [
    { "id": "UW-01", "name": "James Mitchell", "active": 6, "capacity": 10, "status": "Available" }
  ]
}
```

### 8.2 Communications

#### `GET /operations/communications/outbox`
#### `POST /operations/communications/send`
#### `GET /operations/communications/templates`
#### `POST /operations/communications/templates`
#### `GET /operations/communications/triggers`
#### `PUT /operations/communications/triggers/{triggerId}`

---

## 9. INTELLIGENCE DOMAIN

### 9.1 Scenario Modelling

#### `POST /intelligence/scenario-model`
Run macroeconomic stress test.

**Request:**
```json
{
  "baseRate": 5.25,
  "unemployment": 6.0,
  "housePriceChange": -10,
  "inflation": 4.5
}
```

**Response:**
```json
{
  "portfolioValue": 892000000,
  "expectedLoss": 12400000,
  "provisionCharge": 8200000,
  "capitalRatio": 14.2,
  "arrearsRate": 3.8,
  "avgLTV": 68,
  "netInterestMargin": 1.42,
  "ltvDistribution": [
    { "band": "≤60%", "pct": 35 },
    { "band": "60-80%", "pct": 45 },
    { "band": ">80%", "pct": 20 }
  ]
}
```

### 9.2 Rate Impact Modelling

#### `POST /intelligence/rate-impact`
Model impact of a rate change.

**Request:** `{ "product": "2-Year Fixed (Prime)", "proposedRate": 4.29 }`

**Response:**
```json
{
  "rateChange": -0.20,
  "volumeImpact": "+15%",
  "monthlyPaymentChange": -35,
  "marginImpact": -82000,
  "newPosition": "Below market",
  "breakEvenVolume": 12
}
```

---

## 10. IDENTITY DOMAIN

### 10.1 Users

#### `GET /identity/users`
#### `POST /identity/users`
Invite user: `{ "name", "email", "role" }`

#### `PUT /identity/users/{userId}`
#### `POST /identity/users/{userId}/suspend`
#### `POST /identity/users/{userId}/reactivate`

### 10.2 Roles & Permissions

#### `GET /identity/roles`
#### `GET /identity/permissions`
Returns all 197 permissions grouped by category.

#### `PUT /identity/roles/{roleId}/permissions`
Update CRUD permission matrix for a role.

**Request:**
```json
{
  "permissions": {
    "P166": { "c": true, "r": true, "u": true, "d": false },
    "P167": { "c": false, "r": true, "u": false, "d": false }
  }
}
```

### 10.3 Sessions & Audit

#### `GET /identity/sessions`
#### `DELETE /identity/sessions/{sessionId}`
Terminate session.

#### `GET /identity/audit`
Filters: `?actor=UW-01&action=credit_decision&from=2026-04-01&to=2026-04-18`

---

## 11. PLATFORM DOMAIN

### 11.1 Theme

#### `GET /platform/theme`
#### `PUT /platform/theme`

### 11.2 Feature Flags

#### `GET /platform/features`
#### `PUT /platform/features/{featureId}`

### 11.3 Releases

#### `GET /platform/releases`
#### `GET /platform/releases/latest`

---

## Cross-Cutting Concerns

### Search

#### `GET /search?q=Mitchell`
Global search across customers, cases, servicing accounts.

**Response:**
```json
{
  "results": [
    { "type": "customer", "id": "CUS-002", "label": "James & Sarah Mitchell", "sub": "Premier · 2 products" },
    { "type": "case", "id": "AFN-2026-00142", "label": "AFN-2026-00142", "sub": "2-Year Fixed · Underwriting" },
    { "type": "servicing", "id": "M-001234", "label": "M-001234", "sub": "2-Year Fixed · Active" }
  ]
}
```

### Webhooks / Events

```
Domain Events (published to event bus):
- application.created
- application.submitted
- dip.executed
- dip.approved / dip.declined
- case.assigned
- case.decision.made
- offer.issued / offer.accepted
- disbursement.created / disbursement.authorised
- account.activated
- account.arrears.entered / account.arrears.cleared
- payment.collected / payment.failed
- rate-switch.confirmed
- customer.created / customer.risk.changed
- product.created / product.rate.changed
- bucket.created / bucket.updated
- tier.created / tier.updated
```

### Error Format

```json
{
  "error": {
    "code": "ELIGIBILITY_CHECK_FAILED",
    "message": "LTV 92% exceeds Prime bucket maximum 75%",
    "domain": "pricing",
    "traceId": "abc123",
    "timestamp": "2026-04-18T10:30:00Z"
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error (bad input) |
| 401 | Unauthenticated |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate bucket name) |
| 422 | Business rule violation (e.g. max 5 tiers) |
| 500 | Internal server error |

### Pagination

```
GET /customers?page=1&pageSize=20&sortBy=name&sortDir=asc

Response header: X-Total-Count: 142
Response header: X-Total-Pages: 8
```

### Rate Limiting

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1713436800
```
