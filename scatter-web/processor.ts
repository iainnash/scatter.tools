import ini from "ini";
import { ethers } from "ethers";

export function processFile(fileString: string) {
  const result = ini.parse(fileString);
  return result;
}

function generateWallets(amount: number) {
  return Array.from(
    Array(amount),
    () => ethers.Wallet.createRandom().mnemonic.phrase
  );
}

export function generateKeyFile({
  tokenId,
  chainId,
  contractAddress,
}: {
  tokenId: number;
  chainId: number;
  contractAddress: string;
}) {
  const wallets = generateWallets(12);
  const iniEncode = ini.encode({
    passphrases: {
      wallets,
    },
    config: {
      tokenId,
      chainId,
      contractAddress,
    },
  });
  return iniEncode;
}
