import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
  chain,
  configureChains,
  createClient,
  infuraRpcUrls,
  WagmiConfig,
} from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const gnosischain = {
  id: 100,
  chainId: 100,
  name: "Gnosis Chain",
  network: "gnosis-chain",
  nativeCurrency: { name: "xDai", symbol: "xDAI", decimals: 18 },
  rpcUrls: {
    default: "https://rpc.gnosischain.com",
    infura: "https://rpc.gnosischain.com",
  },
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    gnosischain,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [chain.goerli]
      : []),
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        console.log({ chain });
        if (chain.id === 100) {
          return { http: "https://rpc.gnosischain.com" };
        }
        if (chain.id === 5) {
          return {
            http: `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
          };
        }
        return {
          http: `https://${chain.name}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
        };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
