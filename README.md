# 🚛 ASK Transport Group — Enterprise Supply Chain & Logistics ERP

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

An enterprise-grade, Clean Architecture transport management system designed specifically for the complex operational, compliance, and telematics demands of Indian logistics networks (Full Truckload, Part Truckload, Express Cargo, Cold Chain, and Market Fleet Brokers).

---

## 🏛️ Clean Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION / WEB LAYER                        │
│   React 19 + TypeScript (Vite) + Tailwind CSS + Lucide + Bilingual i18n │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / WebSocket (SignalR)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       API / CONTROLLERS LAYER                          │
│   ASP.NET Core Web API (.NET 10) + JWT Bearer Auth + Rate Limiting     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         APPLICATION LAYER                              │
│   Services, Interfaces (CQRS-ready), DTOs, Business Logic, Validations │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                           DOMAIN LAYER                                 │
│   Entities, Enums, Value Objects, Domain Exceptions, Pure Logic        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                              │
│   Entity Framework Core, SQL Server / Postgres, Redis, External APIs   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Personas

### 1. 👑 SuperAdmin & Executive Governance
- **Route Profitability & P&L Margins Radar**: Trip-level gross margins, corridor diesel expenses, toll taxes, driver bhatta, and market fleet payout cost leakage.
- **Branch Performance Rankings**: National hub tiering (*Platinum Alpha, Gold Standard, Under Review*) tracking tonnage, SLA compliance, and turnaround time.
- **CA 1-Click Tax & Audit Vault**: GTA GSTR-1 Outbound B2B, GSTR-3B monthly ITC reconciliation, RCM 5% Reverse Charge ledger, Section 194C Form 26AS TDS verification, and 1-Click GSTN JSON/Excel export.
- **Master RBAC & Rights Delegation**: Granular subsystem permission granting and revocation.

### 2. 🛠️ Admin Operations & Fleet Deck
- **Physical POD Optical Barcode Inward**: Laser scanner inward receipt processing, signed & stamped verification, and 30% balance payout release trigger.
- **Highway Breakdown SOS & Transshipment Rescue**: Real-time road emergency logging, nearest rescue truck, hydraulic crane, and mechanic dispatch with cargo transfer tracking.
- **Dock Yard Gate Pass Manager**: QR-code based security clearance for inbound/outbound trailers.
- **Electronic Weighbridge / Dharam Kanta**: Gross, Tare, and Net weight tolerance tracking.
- **NIC E-Way Bill Auto-Extension**: Automated expiry warnings and distance-based auto-extensions.
- **RTO Border Checkpost Vault**: Border permits, state tax receipts, and green-channel passes.
- **AIS-140 Highway Safety Radar**: Real-time speed alerts, harsh braking, driver fatigue, and geofence deviations.
- **AI Operations Deck**: 3D Truck Load Visualizer, AI OCR Bilty Scanner, Spot Freight Rate AI Predictor, Route Cost Estimator, and WhatsApp Logistics Bot.

### 3. 👤 Customer / Consignor Portal
- **Consignee & Delivery Address Book**: Saved frequent destination parties with GSTIN, address, contact, and dock unloading directions.
- **1-Click WhatsApp Live Track Share**: PIN-protected (4-digit) live GPS tracking link generation with direct WhatsApp dispatch.
- **Shipment Booking Engine**: FTL, PTL, hazmat, parcel volumetric weight calculation, and booking confirmation.
- **Live GPS Radar & Timeline**: Interactive map, milestone tracker, and dynamic ETA predictions.
- **Electronic Bilty (LR) & e-POD Viewer**: Instant PDF preview and download.
- **GST Invoices & Online Payments**: Razorpay payment simulator and credit ledger.

### 4. 🚚 Sarathi Driver Console (`/driver`)
- **Touch-Optimized Mobile Console**: Designed for smartphone usage on national highways.
- **Trip Settlement Hisaab**: Diesel fuel slips, toll receipts, daily food/bhatta advance, and net cash balance settlement.
- **Digital Proof of Delivery (e-POD)**: Consignee digital signature pad, camera delivery photo upload, and SMS OTP confirmation.
- **Emergency SOS Panic Button**: Instant dispatch notification to central control tower.

---

## 🌐 Bilingual Language Engine

The application includes a unified language system defaulting to **English**, with instant switching to **Hindi (हिन्दी)** via the Language Selector in the top bar:
- All buttons, modals, badges, data tables, and forms are fully localized using `useLanguage()`.
- Language preference is automatically persisted to browser `localStorage`.

---

## ⚡ Quickstart Guide

### Option A: One-Click Local Launcher (Windows)
Run the automated startup script in PowerShell:
```powershell
.\start-all.ps1
```
This opens the ASP.NET Core API on port `5208` and the React Vite web app on port `5173`.

### Option B: Cloud Docker Compose (Recommended for Production)
Orchestrate API, Web Frontend, SQL Server, and Redis with a single command:
```bash
docker compose up -d --build
```
- Web Application: `http://localhost` (or `http://localhost:5173`)
- Backend Web API: `http://localhost:5208`
- Health Endpoint: `http://localhost:5208/health`

### Option C: Manual Development Run
**1. Start Backend:**
```bash
dotnet restore ASK.Group.Api.csproj
dotnet run --project ASK.Group.Api.csproj --urls "http://localhost:5208"
```

**2. Start Frontend:**
```bash
cd ASK.Transport.Web
npm install
npm run dev
```

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Primary Subsystems |
|---|---|---|---|
| **SuperAdmin** | `admin@askgroup.com` | `Admin@123` | Executive P&L, CA Tax Vault, Access Control, Audit |
| **Admin** | `ops@askgroup.com` | `Admin@123` | Operations, Dispatch, Weighbridge, Barcode POD, Fleet |
| **Customer** | `user@askgroup.com` | `User@123` | Bookings, Live Tracking, Address Book, WhatsApp Share |
| **Sarathi Driver** | Direct Mobile Access | `/driver` | Turn-by-turn routing, Digital e-POD, Trip Settlement |

---

## 📮 Postman API Collection

A complete, production-ready Postman collection and environment are included in the `/postman` directory:
- Collection: `postman/ASK_Transport_Enterprise_API_Collection.json`
- Environment: `postman/ASK_Transport_Local_Env.json`

Import both into Postman to instantly test all endpoints including Executive Profitability, CA Tax Vault, Physical POD Inward, and Consignee Sessions.

---

## 🛠️ Tech Stack Specifications

- **Backend**: C# 13, .NET 10, ASP.NET Core Web API, Entity Framework Core 10, Microsoft SQL Server / PostgreSQL, Redis.
- **Frontend**: React 19, TypeScript 5.9, Vite 8, Tailwind CSS, Lucide React Icons.
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD (`.github/workflows/ci-cd.yml`), Nginx Alpine.

---

© 2026 ASK Transport Group. All Rights Reserved.
