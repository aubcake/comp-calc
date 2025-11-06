# Compensation Calculator

A comprehensive web application for calculating total compensation packages including salary, equity, benefits, and 401(k) contributions. Compare your compensation against market averages by role and location.

## Features

- **Cash Compensation**: Calculate your annual base salary
- **Equity Tracking**: Input stock options, strike price, and fair market value
- **401(k) Matching**: Calculate employer matching contributions (percentage or fixed amount)
- **Benefits Management**: Track common employer-paid benefits with helpful tooltips
- **Market Comparison**: Compare your compensation against BLS market averages by role and location
- **Cost of Living Adjustment**: See purchasing power adjustments based on your metro area
- **IRS Limit Validation**: Built-in warnings for 401(k) and HSA/FSA contribution limits

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** or **pnpm**

To verify your installation:
```bash
node --version
npm --version
```

## Installation

1. **Clone or download this repository**
   ```bash
   cd /path/to/proj-compcalc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install all required packages including Next.js, React, shadcn/ui components, and other dependencies.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

The page will automatically reload when you make changes to the code.

### Production Build

To create an optimized production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Project Structure

```
proj-compcalc/
├── app/
│   ├── page.tsx          # Main calculator component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   └── salary-data.ts    # Occupation and metro area data
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Data Sources

This calculator uses data from:
- U.S. Bureau of Labor Statistics (OEWS)
- Council for Community and Economic Research (C2ER) - Cost of Living Index
- U.S. Bureau of Economic Analysis - Regional Price Parities

All sources are linked in the app footer for transparency.

## License

Private project - All rights reserved.

---

Vibecoded with ❤️ by Aubrey