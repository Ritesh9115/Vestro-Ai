# Company Resolution & Financial Data Flow

This document outlines the step-by-step pipeline for identifying a company and fetching its financial data.

## 1. Symbol Resolution (Yahoo Finance Search - Primary)
The platform relies on Yahoo Finance as the single source of truth for **company identification and symbol resolution**.
- Direct exact match attempts.
- Search variations (removing "Ltd", "Limited", normalizing spaces).
- AI-assisted verification for ambiguous or misspelled inputs.
- The Yahoo Search API is resilient and accurately maps Indian stocks (e.g., `TECHM.NS`).

## 2. Financial Data Retrieval (Yahoo Finance - Primary)
Once a symbol is resolved, we attempt to fetch:
- Quote Summary
- Income Statements
- Balance Sheets
- Cash Flows

## 3. Rate Limit & Crumb Fallback (Financial Modeling Prep - Fallback)
Yahoo financial endpoints (quote summary and fundamentals) often encounter `429 Too Many Requests`, rate limits, or crumb errors on cloud platforms.

**If Yahoo financial endpoints fail for any reason after a symbol is successfully resolved:**
- The request does **not** fail.
- We **immediately switch to Financial Modeling Prep (FMP)** for all financial data.
- FMP is used to fetch the Company Profile, Income Statement, Balance Sheet, Cash Flow, Ratios, and Key Metrics.
- The user experiences a seamless fallback without seeing "Unable to locate stock" errors for properly resolved symbols.
