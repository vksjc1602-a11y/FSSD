# AEGIS Security Architecture & Policy

## 1. Ethical Inspection Constraints
AEGIS strictly respects the security boundaries of digital commerce platforms:
1. **No Private API Scraping**: Operates exclusively through standard permitted DOM APIs.
2. **No Authentication Bypass**: Never attempts to circumvent CAPTCHAs, bot protections, or session logins.
3. **No Private Account Access**: Zero inspection of shopping carts, payment methods, bank accounts, or OTP text messages.
4. **No Automated Purchases**: AEGIS acts purely as an advisory decision-support layer. It never initiates transactions.
5. **No Brand Impersonation**: AEGIS clearly identifies itself as an external consumer-defense tool.

## 2. Platform Security Measures
- **Input Sanitization**: All user-supplied strings and listing attributes are validated via Pydantic/TypeScript schemas before processing.
- **CORS & Secure Headers**: Endpoints enforce `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN`.
- **Zero Arbitrary Code Execution**: Extension adapters use declarative DOM parsers without `eval()` or remote script injection.
