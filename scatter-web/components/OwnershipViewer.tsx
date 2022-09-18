import { useAccount, useContractRead } from "wagmi"
import abi from "../abi/safe.json";

export const OwnershipViewer = ({contractAddress, tokenId}: {contractAddress: string, tokenId: string}) => {
  const account = useAccount();
  const owner = useContractRead({
    addressOrName: contractAddress,
    contractInterface: abi,
    functionName: 'ownerOf',
    args: [tokenId]
  })  

  if (owner.isLoading) {
    return <>determining nft ownership...</>
  }

  if (owner?.data && (owner?.data as any).toLowerCase() === account.address?.toLowerCase()) {
    return <>you are the owner! you can claim NFTs</>
  }
  
  return <>you are not the owner and can only view ownership</>;
}