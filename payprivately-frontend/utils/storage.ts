import { CONTRACTS, privateLink } from "./contracts";

const P_LINK_EVENTS_KEY = "privateLink:events";
const P_LINK_EVENTS_LAST_BLOCK_KEY = "privateLink:eventsLastBlock";

export interface LocalStoredEvent {
  commitment: string,
  index: number,
}

export const getEvents = (chainId: string): LocalStoredEvent[] => {
  return JSON.parse(localStorage.getItem(`${P_LINK_EVENTS_KEY}:${chainId}`) || "[]") as LocalStoredEvent[];
}

export const saveEvents = (chainId: string, events: LocalStoredEvent[]) => {
  localStorage.setItem(`${P_LINK_EVENTS_KEY}:${chainId}`, JSON.stringify(events));
}

export const getLastBlock = (chainId: string): number => {
  const deploymentBlock = CONTRACTS[privateLink][chainId].deploymentBlock;
  console.log('dep',deploymentBlock)
  if (!deploymentBlock) {
    throw Error('DeploymentBlock is not setup for chainId=\'' + chainId + '\'');
  }
  // return deploymentBlock;
  return parseIntSafe(localStorage.getItem(`${P_LINK_EVENTS_LAST_BLOCK_KEY}:${chainId}`)) || deploymentBlock;
}

export const saveLastBlock = (chainId: string, blockNumber: number) => {
  localStorage.setItem(`${P_LINK_EVENTS_LAST_BLOCK_KEY}:${chainId}`, blockNumber.toString());
}

const parseIntSafe = (item: string | null) => {
  if (item) {
    return parseInt(item);
  }
  return undefined;
}