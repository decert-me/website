import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { coinbase, network, phantom, trust } from "./utils/solana";
import { WagmiConfig } from "wagmi";
import { AppInfo, chains, wagmiConfig } from "./utils/wagmi";
import { ConfigProvider } from 'antd';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';
import * as Sentry from "@sentry/react";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
require("@solana/wallet-adapter-react-ui/styles.css");

const queryClient = new QueryClient()

const sentryKey = process.env.REACT_APP_SENTRY_KEY;
if (sentryKey) {
  Sentry.init({
    dsn: sentryKey,
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
      }),
      new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.REACT_APP_SENTRY_TRACES || 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: process.env.REACT_APP_SENTRY_REPLAYS_SESSION || 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR || 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}


export default function Providers({children}) {
    window.Buffer = window.Buffer || require("buffer").Buffer;

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [
          coinbase, phantom, trust
        ],
        [network]
    );
    
    return (
        <QueryClientProvider client={queryClient}>
            {/* solana */}
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        {/* wagmi */}
                        <WagmiConfig config={wagmiConfig}>
                            <RainbowKitProvider chains={chains} appInfo={AppInfo} id="rainbowkit">
                                <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
                                    <ConfigProvider
                                        theme={{
                                        components: {
                                            Progress: { gapDegree: 0},
                                        }}}
                                    >
                                        {children}
                                    </ConfigProvider>
                                </StyleProvider>
                            </RainbowKitProvider>
                        </WagmiConfig>
                        
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </QueryClientProvider>
    )
}