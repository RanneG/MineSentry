# MineSentry Frontend

Modern, responsive web application for the MineSentry Bitcoin Mining Pool Monitor & Reward System.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **TanStack Query** (React Query) for data fetching and state management
- **Zustand** for wallet state management
- **Recharts** for data visualization
- **Headless UI** & **Radix UI** for accessible components
- **React Router** for navigation
- **Lucide React** for icons

## Features

- 🎯 **Dashboard**: Overview of system status, statistics, and recent reports
- 📝 **Report Submission**: Submit censorship reports with wallet integration and confidence scoring
- 📊 **Reports Browser**: View, filter, and search all reports
- 🔍 **Report Details**: Detailed view of individual reports with validation controls
- 💰 **Bounty Contract Transparency**: Public read-only dashboard showing contract treasury, governance, and payout history
- ✅ **Report Validation**: Interactive modal for validators to vote (Confirm/Reject) with Bitcoin staking
- 📈 **Leaderboard**: Top reporters and top bounty hunters with earnings statistics
- ⚙️ **System Status**: Real-time system health monitoring with detailed component status
- 🔌 **Wallet Integration**: Connect multiple Bitcoin wallets (Hiro, Xverse, Leather, UniSat, Nostr)
- 🎮 **Demo Mode**: Isolated testing environment with mock data for exploring the system workflow

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MineSentry API running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI components (Toaster, etc.)
│   │   ├── DemoModeToggle.tsx    # Demo mode toggle button
│   │   ├── InfoTooltip.tsx       # Information tooltip component
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ValidateReportModal.tsx  # Report validation modal
│   │   └── WalletConnect.tsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Reports.tsx
│   │   ├── SubmitReport.tsx
│   │   ├── ReportDetail.tsx
│   │   ├── BountyContract.tsx    # Transparency dashboard (read-only)
│   │   ├── Leaderboard.tsx       # Top reporters + top bounty hunters
│   │   └── SystemStatus.tsx
│   ├── contexts/        # React contexts
│   │   └── DemoModeContext.tsx   # Demo mode state management
│   ├── hooks/           # Custom React hooks
│   │   └── useWallet.ts
│   ├── store/           # State management (Zustand)
│   │   └── walletStore.ts
│   ├── api/             # API client
│   │   ├── client.ts
│   │   └── mockApi.ts   # Mock data for demo mode
│   ├── lib/             # Utility libraries
│   │   ├── walletAuth.ts
│   │   └── walletProviders.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Wallet Integration

The frontend supports multiple Bitcoin wallet providers:

- **Hiro Wallet** (Stacks/Bitcoin)
- **Xverse**
- **Leather** (formerly Hiro)
- **UniSat**
- **Nostr**

Wallet connections are managed through the `WalletConnect` component and `walletStore`.

## API Integration

The frontend communicates with the MineSentry API through the `apiClient` in `src/api/client.ts`. All API calls use TanStack Query for caching, refetching, and error handling.

## Styling

The app uses Tailwind CSS with a custom theme matching the Bitcoin aesthetic:
- Primary color: Bitcoin orange (`#f7931a`)
- Dark background theme
- Responsive design

## Testing

```bash
npm test
```

## Deployment

### Vercel

```bash
vercel
```

### Netlify

```bash
netlify deploy
```

### Self-hosted

Build the project and serve the `dist` directory:

```bash
npm run build
# Serve dist/ directory with your web server
```

## Development Notes

- The frontend proxies API requests through Vite's dev server
- Real-time updates can be added via WebSocket connection
- Wallet integrations need actual wallet SDK implementations (currently mocked)
- Charts and visualizations can be enhanced with more data

## License

See main project license.

