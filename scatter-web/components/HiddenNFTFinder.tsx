import useSWR from "swr";
import { useContractRead } from "wagmi";
import abi from "../abi/safe.json";

const HiddenWalletItem = ({ address }: { address: string }) => {
  return (
    <li>
      <code>{address}</code>
    </li>
  );
};

export const HiddenNFTFinder = ({ walletData }: { walletData: any }) => {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT!;
  console.log(walletData, contractAddress);

  const { data, isError, isLoading } = useContractRead({
    addressOrName: contractAddress,
    contractInterface: abi as any,
    functionName: "computeAddresses",
    args: [walletData.config.tokenId, walletData.passphrases.wallets],
    chainId: parseInt(walletData.config.chainId, 10),
  });

  const nftsQuery = useSWR(
    data && JSON.stringify(data),
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
    }
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

  if (isLoading) {
    return <li>finding hidden NFTs 🔎</li>;
  }

  if (data) {
    return (
      <li>
        <ul>
          {data.map((address: string) => (
            <HiddenWalletItem address={address} key={address} />
          ))}
        </ul>
      </li>
    );
  }

  return <li>error loading data from contract :-/</li>;
};
