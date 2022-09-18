import { wallet } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { HiddenNFTFinder } from "../../components/HiddenNFTFinder";
import { OwnershipViewer } from "../../components/OwnershipViewer";
import { Page } from "../../components/Page";
import { TokenUnlock } from "../../components/TokenUnlock";
import { processFile } from "../../processor";
import styles from "../../styles/Home.module.css";

const ViewToken: NextPage = () => {
  const router = useRouter();
  const { chain } = useNetwork()

  const [walletData, setWalletData] = useState<any>(undefined);
  const [walletStatus, setWalletStatus] = useState("LOADING");
  const [parsedArgs, setParsedArgs] = useState<{
    chain?: string;
    address?: string;
    id?: string;
  }>({ chain: undefined, address: undefined, id: undefined });

  const [configStr, setConfigStr] = useState("");

  useEffect(() => {
    if (router.isReady) {
      const [chain, address, id] = (router.query.args as string).split(":");
      console.log(`${chain}:${address}:${id}`);
      setParsedArgs({ chain, address, id });
      const data = window.localStorage.getItem(`${chain}:${address}:${id}`);
      if (!data) {
        setWalletStatus("NO_WALLET");
        console.error("no-data");
      } else {
        try {
          setWalletData(processFile(JSON.parse(data).key));
          setConfigStr(JSON.parse(data).key);
          setWalletStatus("SUCCESS");
        } catch (e: any) {
          console.error(e);
          setWalletStatus("NO_WALLET");
        }
      }
    }
  }, [router.isReady, setWalletData]);

  if (chain?.id && walletData && walletData.config.chainId !== chain.id.toString()) {
    return <Page>invalid network</Page>
  }

  return (
    <Page>
      <h1>scatter #{parsedArgs.id} </h1>
      <h3>{walletStatus === "SUCCESS" ? "[unlocked]" : "[locked]"}</h3>
      {walletStatus === "NO_WALLET" && <h2>!!NO WALLET FOUND!!</h2>}
      <ol>
        {walletStatus !== "SUCCESS" && (
          <li>
            unlock wallet: <TokenUnlock />
          </li>
        )}
        {walletStatus === "SUCCESS" && walletData ? (
          <HiddenNFTFinder
            contractAddress={walletData.config.contractAddress}
            walletData={walletData}
          />
        ) : (
          <>waiting </>
        )}
        <li>
          <OwnershipViewer
            contractAddress={walletData?.config?.contractAddress}
            tokenId={parsedArgs.id!}
          />
        </li>
        <li>
          !!important:{" "}
          <a download={`scatter-${parsedArgs.chain!}-${parsedArgs.id!}.ini`} href={`data:text/plain;utf-8,${encodeURIComponent(configStr)}`}>
            download
          </a>{" "}
          keyfile
        </li>
      </ol>
    </Page>
  );
};

export default ViewToken;
