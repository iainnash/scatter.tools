import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import styles from "../styles/Home.module.css";
import abi from "../abi/safe.json";
import { useRouter } from "next/router";
import { TokenUnlock } from "../components/TokenUnlock";
import { generateKeyFile } from "../processor";
import { Page } from "../components/Page";

const Home: NextPage = () => {
  const router = useRouter();
  const account = useAccount();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState(0);
  const getChainIdSet = useCallback(async () => {
    if (!account.connector) {
      return;
    }
    setChainId(await account.connector?.getChainId());
  }, [account]);
  useEffect(() => {
    setLoaded(true);
    getChainIdSet();
  }, []);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT!;
  const { config } = usePrepareContractWrite({
    addressOrName: contractAddress,
    contractInterface: abi as any,
    functionName: "mint",
  });
  const doMintNFT = useContractWrite(config);
  const mintNFT = useCallback(async () => {
    setLoading(true);
    const receipt = await doMintNFT.writeAsync?.();
    try {
      const result = await receipt?.wait();
      setLoading(false);
      result?.logs.forEach((log) => {
        const tokenId = parseInt(log.topics[3], 16);
        const lowerAddress = contractAddress.toLowerCase();
        const path = `${chainId}:${lowerAddress}:${tokenId}`;
        router.push(`/token/${path}`);
        window.localStorage.setItem(
          `${path}`,
          JSON.stringify({
            key: generateKeyFile({ chainId, contractAddress: lowerAddress, tokenId }),
          })
        );
        const directory = JSON.parse(
          window.localStorage.getItem("directory") || "{}"
        );
        directory[path] = true;
        window.localStorage.setItem("directory", JSON.stringify(directory));
      });
    } catch (e: any) {
      setLoading(false);
    }
  }, [doMintNFT, chainId, contractAddress]);

  return (
    <Page>
      <div>
        <h1>scatter</h1>
        <p></p>
        {loading ? (
          <h4>waiting for blockchain...</h4>
        ) : loaded && account.isConnected ? (
          <button disabled={doMintNFT.isLoading} onClick={mintNFT}>
            {doMintNFT.isLoading ? "minting..." : "Mint"}
          </button>
        ) : (
          <ConnectButton />
        )}
        <div className="detail"></div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <div>
        gather
        <TokenUnlock />
      </div>
    </Page>
  );
};

export default Home;
