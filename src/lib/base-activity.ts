const BASE_RPC_URL = "https://mainnet.base.org";
const BASE_CHAIN_ID = "0x2105";

export const MIN_ALLOCATION = 1_000;
export const MAX_ALLOCATION = 97_000;

export type BaseActivity = {
  address: string;
  transactionCount: number;
  balanceEth: number;
  isContract: boolean;
  score: number;
  allocation: number;
};

type RpcResponse<T> = {
  result?: T;
  error?: { message?: string };
};

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(BASE_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });

  if (!response.ok) {
    throw new Error(`Base RPC returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as RpcResponse<T>;
  if (payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message || "Base activity data was unavailable.");
  }

  return payload.result;
}

function hexToNumber(value: string): number {
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Base returned an invalid activity value.");
  }
  return parsed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toEth(weiHex: string): number {
  const wei = BigInt(weiHex);
  const whole = wei / 1_000_000_000_000_000_000n;
  const remainder = wei % 1_000_000_000_000_000_000n;
  return Number(whole) + Number(remainder) / 1e18;
}

/**
 * Fetches only public, keyless Base RPC data. The score intentionally uses
 * measurable state that the public RPC can provide without pretending to have
 * a complete historical transaction index.
 */
export async function getBaseActivity(address: string): Promise<BaseActivity> {
  const chainId = await rpc<string>("eth_chainId", []);
  if (chainId.toLowerCase() !== BASE_CHAIN_ID) {
    throw new Error("The activity source did not respond as Base mainnet.");
  }

  const [transactionCountHex, balanceHex, code] = await Promise.all([
    rpc<string>("eth_getTransactionCount", [address, "latest"]),
    rpc<string>("eth_getBalance", [address, "latest"]),
    rpc<string>("eth_getCode", [address, "latest"]),
  ]);

  const transactionCount = hexToNumber(transactionCountHex);
  const balanceEth = toEth(balanceHex);
  const isContract = code !== "0x";

  // Public Base RPC exposes nonce, balance, and deployed-code state reliably.
  // The weights are fixed, monotonic, and capped so allocation is deterministic.
  const transactionScore = clamp(Math.log1p(transactionCount) / Math.log1p(1_000), 0, 1) * 0.8;
  const balanceScore = clamp(Math.log1p(balanceEth) / Math.log1p(10), 0, 1) * 0.1;
  const contractScore = isContract ? 0.1 : 0;
  const score = clamp(transactionScore + balanceScore + contractScore, 0, 1);
  const allocation = Math.round(MIN_ALLOCATION + score * (MAX_ALLOCATION - MIN_ALLOCATION));

  return {
    address,
    transactionCount,
    balanceEth,
    isContract,
    score,
    allocation: Math.min(MAX_ALLOCATION, Math.max(MIN_ALLOCATION, allocation)),
  };
}

export function formatAllocation(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatBaseActivity(activity: BaseActivity): string {
  const txLabel = `${activity.transactionCount.toLocaleString("en-US")} ${activity.transactionCount === 1 ? "transaction" : "transactions"}`;
  const balanceLabel = `${activity.balanceEth.toFixed(activity.balanceEth < 0.01 ? 4 : 2)} ETH`;
  return `${txLabel} · ${balanceLabel}${activity.isContract ? " · contract" : ""}`;
}

export async function connectBaseWallet(): Promise<string> {
  const provider = window.ethereum;
  if (!provider) {
    throw new Error("No wallet was detected. Paste a Base / EVM address instead.");
  }

  const chainId = await provider.request({ method: "eth_chainId" });
  if (String(chainId).toLowerCase() !== BASE_CHAIN_ID) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID }],
      });
    } catch {
      throw new Error("Switch your wallet to Base mainnet, then try again.");
    }
  }

  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("No wallet account was returned.");
  return address;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
