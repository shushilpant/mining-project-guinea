# ACCI — Adaptive Continuous Compliance Intelligence: Project Overview

This document is a comprehensive reference guide for the **ACCI (Adaptive Continuous Compliance Intelligence)** project. It contains the architectural, design, and technical details required to write a detailed report or journal paper about the system.

## 1. Project Overview
**ACCI (Adaptive Continuous Compliance Intelligence)** is a web-based dashboard and intelligence platform designed specifically for West African mining authorities (with a focus on Ghana, Guinea, and Côte d'Ivoire). The system provides a centralized hub to monitor operator performance, track compliance with mining agreements, assess risks, trace beneficial ownership, monitor local content contributions, and leverage AI for briefing and negotiation preparation.

## 2. Technology Stack
The application is a modern, high-performance frontend built with the following core technologies:
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite (configured with strict ESLint type-aware rules)
- **State Management:** Zustand (modular stores for AI settings, audit, auth, data, onboarding, theme, etc.)
- **Routing:** React Router DOM (v7) with lazy loading for heavy routes.
- **Styling:** Tailwind CSS with custom theme extensions based on the design system.
- **UI Components:** Radix UI primitives (Dialog, Progress, Select, Tabs, Tooltip, etc.) combined with Lucide React icons.
- **Data Visualization:** Recharts for charts and React Leaflet (with Leaflet) for mapping and spatial data.
- **Utilities:** clsx, tailwind-merge, xlsx (for data exports).

## 3. Design System (West African Government Standard)
The UI/UX is governed by strict principles outlined in `DESIGN.md` to ensure an institutional, accessible, and regionally authoritative aesthetic:
- **Accessibility First:** WCAG AA contrast minimums, distinct focus rings (3px solid green with 2px offset).
- **Clarity over Flourish:** Flat design, solid colors, crisp 1px borders. No glassmorphism or soft gradients.
- **Typography:** `Public Sans` (primary) and `IBM Plex Mono` (data/code).
- **Color Palette (Pan-West-African):**
  - **Authority (Sidebar/Dark):** Deep Sahel green (e.g., `#021c12`, `#062b1d`).
  - **Primary Action (Brand):** Ghana Flag Green (`#006B3F`).
  - **Secondary Action (Info):** Premium Emerald (overrides default Tailwind blue).
  - **Accent:** Saharan Saffron (`#F5A623`, bridging Ghana gold, Ivorian orange, Guinea yellow).
  - **Status:** Success (Green), Info (Emerald), Warning (Saffron), Danger (Pan-African Red `#CE1126`).
- **Country Chart Colors:** Specific colors used when charting data per country (Guinea: Green, Ghana: Gold/Saffron, Côte d'Ivoire: Orange).

## 4. Core Features & Architecture
The application is structured into several modular pages (located in `src/pages`), heavily utilizing route-level code splitting:

- **Dashboard:** High-level overview of operators, compliance rates, active agreements, and critical risk flags.
- **Agreements (`/agreements`):** Detailed repository of mining contracts, license types, royalties, and concession areas. Includes `AgreementDetailPage`.
- **Performance (`/performance`):** Operator scorecard tracking commitments (production, infrastructure, environmental, etc.) and actual performance metrics. Includes `OperatorDetailPage`.
- **Risk (`/risk`):** Automated risk assessment flagging production shortfalls, expiring agreements, and infrastructure delays. Includes `RiskFlagDetailPage`.
- **Transparency (`/transparency`):** Integration with Extractive Industries Transparency Initiative (EITI) reporting and document access logs.
- **Scenarios (`/scenarios`):** Financial and operational modeling.
- **Negotiation (`/negotiation`):** Tools and AI-assisted briefing generation for contract renewals and disputes.
- **Ownership (`/ownership`):** Tracing of Ultimate Beneficial Owners (UBOs), identifying Politically Exposed Persons (PEPs), and mapping corporate structures.
- **Local Content (`/local-content`):** Tracking operator commitments to local employment, procurement, and community funds.
- **ESG (`/esg`):** Environmental, social, and governance indicators.
- **Market Intelligence (`/market`):** Commodity market context relevant to the region.
- **Documents (`/documents`):** Document register with access logging.
- **Public Portal (`/public-data`):** Public-facing transparency view.
- **Regulatory Tracker (`/regulatory`):** Tracking of regulatory and legislative change.
- **Admin (`/admin`):** System configuration, including AI provider settings.
- **Audit Monitor (`/audit`):** An immutable log of system actions and document access.

## 5. Domain Data Model
The core domain entities (defined in `src/data/types.ts`) include:
- **Country:** Tracks regulatory frameworks, currencies, and mining authorities.
- **Operator:** The mining company, tracking parent companies, UBOs, and computed risk/compliance scores.
- **Agreement:** The specific mining contract, including commodity (bauxite, gold, lithium, etc.), royalty rates, and contract value.
- **Commitment & PerformanceRecord:** Obligations (e.g., infrastructure, local employment) and their recorded progress against target values.
- **RiskFlag:** Generated alerts when thresholds (e.g., production shortfall > 25%, infrastructure overdue) are breached.
- **BeneficialOwnerNode:** Tree structures mapping corporate ownership, jurisdictions, and PEP status.
- **ProtectedZone & ConcessionConflict:** Spatial data for mapping overlaps between mining concessions and national parks or water reserves.

## 6. AI Integration Layer
The system includes a robust, provider-agnostic AI service layer (`src/services/aiService.ts`) for intelligent analysis, risk summarization, and negotiation briefings:
- **Supported Providers:**
  - **Local:** Ollama or LM Studio for complete data sovereignty and air-gapped deployments.
  - **Pollinations:** Keyless, anonymous OpenAI-compatible endpoints.
  - **OpenRouter:** For accessing larger open-weight models (e.g., Llama 3.3 70B, DeepSeek V3, Qwen 2.5 72B) when a key is supplied and authorized.
- **Streaming & Parsing:** Includes an SSE parser for streaming responses and logic to extract `reasoning_content` from "thinking" models (e.g., QwQ) to show progress before final answers.
- **Structured Output:** Capable of non-streaming completions with a custom `extractJSON` fallback parser that is tolerant of markdown formatting or prose wrappers.
- **Prompt Injection Hardening:** Implements `fenceUserText` to sanitize user inputs and prevent basic prompt injection attacks (redacting "ignore previous instructions", etc.).
- **Observability:** In-memory ring buffer tracking the last 50 AI calls (latency, success rate) for admin monitoring.

## 7. Security & Auditability
- **Audit Trail:** The `DocumentAccessLog` tracks user views, downloads, and modifications, generating content hashes to anchor an immutable audit trail.
- **Role-Based Views:** Data and features are scoped based on user roles and jurisdictional access.

## Conclusion
**ACCI** is a sophisticated, highly tailored application designed to empower West African governments. By combining a strict institutional design language, complex data modeling of the extractive industries, and sovereign AI capabilities, it provides actionable intelligence to ensure fair negotiations, environmental protection, and regulatory compliance.
