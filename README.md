# Preview Page to Checkout Automation

This project contains an automated test suite for the "Preloader to Checkout" flow, including support for VHR (Vehicle History Report), Sticker (WS), and Pre-VIN check scenarios. The tests are built with Playwright and organized using a class-based architecture for maintainability and scalability.

## Features
- **Class-Based Architecture**: Uses a shared base class (`PreloaderBase`) for reusable checkout flow logic, with specific subclasses for VHR, Sticker, and Email Cacheback scenarios.
- **Dynamic Data Handling**: Automated random VIN generation and unique email handling.
- **Cache Verification**: Validates session/cache persistence for email flows.
- **Multi-Project Testing**: Configured for both Desktop and Mobile (Pixel 5) emulation.
- **CI/CD Integrated**: Includes a GitHub Actions pipeline with artifact upload for Playwright reports.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version recommended)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

### Running Tests
Run all tests:
```bash
npx playwright test
```

Run tests in headed mode:
```bash
npx playwright test --headed
```

Run specific tests (e.g., VHR flow):
```bash
npx playwright test -g "VHR"
```

## CI/CD
The project includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) that automatically runs tests on push/pull requests. Reports are uploaded as artifacts for every run.
