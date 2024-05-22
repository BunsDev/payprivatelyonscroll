import { createContext, useMemo, useState } from "react";
import { ethers } from "ethers";
import { PoseidonHasher } from "../utils/hasher";
import { PrivateLink, PrivateLinkToken } from "../../payprivately-contracts/artifacts/contracts/types";
import { useMetamaskProvider } from "../hooks/useMetamaskProvider";
import { CONTRACT_TO_ABI, CONTRACTS, privateLink, privateLinkToken } from "../utils/contracts";

const buildPoseidon = require("circomlibjs").buildPoseidon;

const hasher = new PoseidonHasher(await buildPoseidon());
export const GlobalContext = createContext<Context>({
  provider: undefined,
  chainId: undefined,
  connect: () => {
  },
  switchChain: () => {
  },
  hasher: hasher,
  privateLink: undefined,
  privateLinkToken: undefined,
  symbol: undefined
});

export interface Context {
  provider: ethers.providers.Web3Provider | undefined,
  chainId: string | undefined,
  connect: () => void,
  switchChain: (chainId: number) => void,
  hasher: PoseidonHasher,
  privateLink: PrivateLink | undefined
  privateLinkToken: PrivateLinkToken | undefined,
  symbol: string | undefined
}

export const GlobalContextProvider = ({ children }: any) => {

  const [provider, chainId, connect, switchChain] = useMetamaskProvider();
  const [symbol, setSymbol] = useState<string | undefined>();

  const privateLinkContract = useMemo(() => {
    console.log("privateLink link contract creation");
    if (!provider) {
      return;
    }

    const contract = CONTRACTS[privateLink][chainId];
    if (!contract) {
      console.log("Can't find contract for", privateLink, chainId);
      return;
    }

    return new ethers.Contract(contract.address, CONTRACT_TO_ABI[privateLink], provider.getSigner(0)) as privateLink;
  }, [provider, chainId]);

  const privateLinkTokenContract = useMemo(() => {
    console.log("privateLink link contract creation");
    if (!provider) {
      return;
    }

    const contract = CONTRACTS[privateLinkToken][chainId];
    if (!contract) {
      console.log("Can't find contract for", privateLinkToken, chainId);
      return;
    }

    const tokenContract = new ethers.Contract(contract.address, CONTRACT_TO_ABI[privateLinkToken],
      provider.getSigner(0)) as PrivateLinkToken;

    tokenContract.symbol()
      .then(it => setSymbol(it));

    return tokenContract;
  }, [provider, chainId]);

  return (
    <GlobalContext.Provider value={{
      provider,
      chainId,
      connect,
      switchChain,
      hasher,
      privateLink: privateLinkContract,
      privateLinkToken: privateLinkTokenContract,
      symbol
    }}>
      {children}
    </GlobalContext.Provider>
  );
}