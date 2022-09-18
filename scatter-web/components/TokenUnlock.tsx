import { SyntheticEvent, useCallback } from "react";

export const TokenUnlock = () => {
  const checkFile = useCallback((evt: SyntheticEvent<HTMLInputElement>) => {
    const files = evt?.currentTarget.files;
    if (files && files[0]) {
      console.log(files[0]);
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
