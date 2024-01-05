import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export const network = WalletAdapterNetwork.Mainnet;
export const phantom = new PhantomWalletAdapter();
export const coinbase = new CoinbaseWalletAdapter();
export const trust = new TrustWalletAdapter();