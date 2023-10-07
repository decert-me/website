import { useMemo } from "react";
import App from "../App";
import { clusterApiUrl } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function WalletAdapter() {
  window.Buffer = window.Buffer || require("buffer").Buffer;

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const phantom = new PhantomWalletAdapter();
  const coinbase = new CoinbaseWalletAdapter();
  const trust = new TrustWalletAdapter();
  const wallets = useMemo(
    () => [
      coinbase, phantom, trust
      // new SolflareWalletAdapter({ network }),
    ],
    [network]
  );
    console.log(window?.solana);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
