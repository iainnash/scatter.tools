import { useRouter } from "next/router";
import { SyntheticEvent, useCallback } from "react";
import { processFile } from "../processor";

export const TokenUnlock = () => {
  const router = useRouter();
  const checkFile = useCallback((evt: SyntheticEvent<HTMLInputElement>) => {
    const files = evt?.currentTarget.files;
    if (files && files[0]) {
      console.log(files[0]);
      const reader = new FileReader();
      reader.addEventListener("load", (event: any) => {
        const iniFile = event.target.result;
        const fileResult = processFile(iniFile);
        const path = `${fileResult.config.chainId}:${fileResult.config.contractAddress}:${fileResult.config.tokenId}`;
        window.localStorage.setItem(
          `${path}`,
          JSON.stringify({
            key: iniFile,
          })
        );
        router.push(`/token/${path}`);
      });
      reader.readAsBinaryString(files[0]);
    }
  }, []);

  return (
    <form onSubmit={() => {}}>
      <p>
        <label>
          upload config file
          <br />
          <input onChange={checkFile} type="file" />
          <br />
        </label>
        to access token
      </p>
    </form>
  );
};
