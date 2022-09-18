import useSWR from "swr";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useProvider,
} from "wagmi";
import { ZDK, ZDKChain, ZDKNetwork } from "@zoralabs/zdk";
import abi from "../abi/safe.json";
import { useCallback, useState, useEffect } from "react";

const HiddenWalletItem = ({
  tokenId,
  password,
  address,
  rootContract,
}: {
  tokenId: string;
  password: string;
  rootContract: string;
  address: string;
}) => {
  const provider = useProvider();
  const { chain } = useNetwork();
  const [code, setCode] = useState<any>();
  const attemptReadCode = useCallback(async () => {
    const code = await provider.getCode(address);
    console.log(code);
    setCode(code);
  }, [address]);
  useEffect(() => {
    attemptReadCode();
  });
  const { config } = usePrepareContractWrite({
    addressOrName: rootContract,
    contractInterface: abi,
    functionName: "reveal",
    args: [tokenId, password],
  });
  const { write } = useContractWrite(config);
  const onReveal = useCallback(() => {
    write?.();
  }, [write]);
  return (
    <li>
      <code>
        {address}: {code && code.length > 2 ? "gathered" : "hidden"}
      </code>
      <div>
        {code && code.length > 2 ? (
          <a
            href={
              chain?.id === 100
                ? `https://gnosisscan.io/address/${address}`
                : `https://goerli.etherscan.io/address/${address}`
            }
            target="_blank"
          >
            claim nfts and view on etherscan
          </a>
        ) : (
          <button style={{ fontSize: "0.6em" }} onClick={onReveal}>
            reveal!
          </button>
        )}
      </div>
    </li>
  );
};

export const HiddenNFTFinder = ({
  contractAddress,
  walletData,
}: {
  contractAddress: string;
  walletData: any;
}) => {
  const { chain } = useNetwork();

  const { data, isError, isLoading } = useContractRead({
    addressOrName: contractAddress,
    contractInterface: abi as any,
    functionName: "computeAddresses",
    args: [walletData.config.tokenId, walletData.passphrases.wallets],
    chainId: parseInt(walletData.config.chainId, 10),
  });

  const nftsQuery = useSWR(
    chain?.id === 100 && data && JSON.stringify(data),
    async (input: string) => {
      const queryResults = await fetch("/api/query", {
        method: "POST",
        body: input,
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
      });
      const queryResponse = await queryResults.json();
      return queryResponse;
    },
    { refreshInterval: 10000000 }
  );

  const queryResults = useSWR(
    nftsQuery.data?.body?.execution_id,
    async (execution_id: string) => {
      const queryResults = await fetch(`/api/execution/${execution_id}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
      });
      const queryResponse = await queryResults.json();
      if (!queryResponse.body.result) {
        console.log("no result -- yet");
        throw new Error("missing result");
      }
      return queryResponse;
    }
  );

  const zNFTs = useSWR(
    data && chain?.id === 5 && JSON.stringify(data),
    async (input: string) => {
      const addresses = JSON.parse(input);
      const zdk = new ZDK({
        networks: [
          {
            chain: ZDKChain.Goerli,
            network: ZDKNetwork.Ethereum,
          },
        ],
      });
      return await zdk.tokens({
        where: {
          ownerAddresses: addresses,
        },
      });
    }
  );

  console.log(zNFTs);

  if (isLoading) {
    return <li>finding hidden wallets 🔎</li>;
  }

  if (data) {
    return (
      <>
        <li>
          <ul>
            {data.map((address: string, i: number) => (
              <HiddenWalletItem
                tokenId={walletData.config.tokenId}
                password={walletData.passphrases.wallets[i]}
                rootContract={contractAddress}
                address={address}
                key={address}
              />
            ))}
          </ul>
        </li>
        {queryResults.data ? (
          <>
            <li>
              found {queryResults.data.body?.result?.rows?.length} nfts in
              hidden wallets
            </li>
            {/* <li> */}
            {/* <pre>{JSON.stringify(queryResults.data?.body?.result)}</pre> */}
            {/* </li> */}
          </>
        ) : zNFTs.data ? (
          <>
            {zNFTs.data.tokens.nodes.map((node: any) => (
              <li key={node.token.tokenId}>
                tokenId: {node.token.tokenId}
                <br />
                name: {node.token.tokenContract.name}
                <br />
                symbol: {node.token.tokenContract.symbol}
                <br />
                wallet: {node.token.owner}
              </li>
            ))}
          </>
        ) : (
          <li>searching for nfts on dune...🔎</li>
        )}
      </>
    );
  }

  return <li>error loading data from contract :-/</li>;
};
