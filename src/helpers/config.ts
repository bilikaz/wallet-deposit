import { AbiItem } from 'web3-utils'

export interface ChainData {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  chain_id: number;
  network_id: number;
  rpc_url: string;
  wallet_address: string;
  wallet_abi: AbiItem[];
  token_address: string;
  token_abi: AbiItem[];
  token_approve: number;
  use_native_currency: boolean;
  native_currency: {
    symbol: string;
    name: string;
    decimals: string;
  };
}

const supportedChains: ChainData[] = [
  {
    name: "Ethereum Mainnet",
    short_name: "eth",
    chain: "ETH",
    network: "mainnet",
    chain_id: 1,
    network_id: 1,
    rpc_url: "https://mainnet.infura.io/v3/%API_KEY%",
    wallet_address: "",
    wallet_abi: [],
    token_address: "",
    token_abi: [],
    token_approve: 0,
    use_native_currency: true,
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
    }
  },
  {
    name: "Ethereum Ropsten",
    short_name: "rop",
    chain: "ETH",
    network: "ropsten",
    chain_id: 3,
    network_id: 3,
    rpc_url: "https://ropsten.infura.io/v3/%API_KEY%",
    wallet_address: "0x43ab74575C7b1Ec16F8bD8757960E133827aB8Cc",
    wallet_abi: [
        {"constant":false,"name":"deposit","inputs":[{"internalType":"uint256","name":"__depositId","type":"uint256"},{"internalType":"uint256","name":"__amount","type":"uint256"}],"outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}
    ],
    token_address: "0xffFb75282e5d10780afce094794A42e6CBB428a7",
    token_abi: [
      {"constant":true,"name":"name","inputs":[],"outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":false,"name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"constant":true,"name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":true,"name":"balanceOf","inputs":[{"name":"_owner","type":"address"}],"outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":true,"name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":true,"name":"allowance","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"}
    ],
    token_approve: 0,
    use_native_currency: false,
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
    }
  },
  {
    name: "Ethereum Rinkeby",
    short_name: "rin",
    chain: "ETH",
    network: "rinkeby",
    chain_id: 4,
    network_id: 4,
    rpc_url: "https://rinkeby.infura.io/v3/%API_KEY%",
    wallet_address: "0xdE2509e46C941581C6f726FB8Ae0f729598d0E26",
    wallet_abi: [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "__depositId",
            "type": "uint256"
          }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ],
    token_address: "",
    token_abi: [],
    token_approve: 0,
    use_native_currency: true,
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18"
    }
  },
  {
    name: "Binance Smart Chain",
    short_name: "bsc",
    chain: "smartchain",
    network: "mainnet",
    chain_id: 56,
    network_id: 56,
    rpc_url: "https://bsc-dataseed.binance.org/",
    wallet_address: "",
    wallet_abi: [],
    token_address: "",
    token_abi: [],
    token_approve: 0,
    use_native_currency: false,
    native_currency: {
      symbol: "BNB",
      name: "BNB",
      decimals: "18"
    }
  },
  {
    name: "Polygon",
    short_name: "polygon",
    chain: "polygon",
    network: "mainnet",
    chain_id: 137,
    network_id: 137,
    rpc_url: "https://polygon-rpc.com/",
    wallet_address: "",
    wallet_abi: [],
    token_address: "",
    token_abi: [],
    token_approve: 0,
    use_native_currency: false,
    native_currency: {
      symbol: "MATIC",
      name: "MATIC",
      decimals: "18"
    }
  },
  {
    name: "Avalanche Network",
    short_name: "avax",
    chain: "avax",
    network: "mainnet",
    chain_id: 43114,
    network_id: 43114,
    rpc_url: "https://api.avax.network/ext/bc/C/rpc",
    wallet_address: "",
    wallet_abi: [],
    token_address: "",
    token_abi: [],
    token_approve: 0,
    use_native_currency: false,
    native_currency: {
      symbol: "AVAX",
      name: "AVAX",
      decimals: "18"
    }
  },
];

export default supportedChains;