import React, { Component, Fragment } from 'react';
import Web3 from "web3";
import Web3Modal from "web3modal";
import { getChainData } from "./helpers/utilities";
import supportedChains from "./helpers/config";
import './App.css';

interface AppState {
  subscribeProvider: boolean
  fetching: boolean
  address: string
  chainBalance: string
  balance: string
  web3: any
  provider: any
  connected: boolean
  chainId: number
  networkId: number
  networkSupported: boolean
  pendingDeposit: boolean
  pendingApproval: boolean
  depositAmount: string
  allowance: string
}

const INITIAL_STATE: AppState = {
  subscribeProvider: true,
  fetching: false,
  address: "",
  chainBalance: "0",
  balance: "0",
  web3: null,
  provider: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  networkSupported: false,
  pendingDeposit: false,
  pendingApproval: false,
  depositAmount: "0",
  allowance:"0"
}

class App extends Component { 

  public  web3Modal: Web3Modal
  public  state: AppState
  private contract: any
  private token: any

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    };

    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {}
    });
  }

  componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.connectWallet();
    }
  }

  connectWallet = async () => {
    const provider = await this.web3Modal.connect()
    await this.subscribeProvider(provider)
    await provider.enable()
    const web3: any = new Web3(provider)
    await this.setState({
      web3,
      provider,
      connected: true,
    });
    this.onConnect();
  }

  onConnect = async () => {
    const { web3 } = this.state;
    const accounts = await web3.eth.getAccounts()
    const address = accounts[0]
    const networkId = await web3.eth.net.getId()
    const chainId = await web3.eth.getChainId()
    const chainData = getChainData(chainId)
    const networkSupported = !!chainData.wallet_address.length && (chainData.use_native_currency || !!chainData.token_address.length)
    if ( await web3.eth.net.isListening() && networkSupported ) {
      this.contract =
        new web3.eth.Contract(
          chainData.wallet_abi,
          chainData.wallet_address
        )
      if ( !!chainData.token_address.length ) {
        this.token =
          new web3.eth.Contract(
            chainData.token_abi,
            chainData.token_address
          )
      }
    } else {
      this.contract = {}
      this.token = {}
    }
    await this.setState({
      address,
      chainId,
      networkId,
      networkSupported
    });
    await this.getAccountAssets();
  };

  public resetApp = async () => {
    const { web3 } = this.state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({ ...INITIAL_STATE, subscribeProvider: false })
  }

  public subscribeProvider = async (provider: any) => {
    const { subscribeProvider } = this.state;
    
    if (!provider.on || !subscribeProvider) { return }

    provider.on("close", () => this.resetApp())
    provider.on("accountsChanged", () => this.onConnect())
    provider.on("chainChanged", () => this.onConnect())

    await this.setState({
      subscribeProvider : false
    });
  };

  public async switchNetwork(chainId: number) {
    const { web3 } = this.state;
    let chainData: any
    
    try {
      chainData = getChainData(chainId)
    } catch (error:any) {
      this.resetApp()
      return
    }
    
    try {
      await (web3.currentProvider! as any).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chainData.chain_id) }],
      });
    } catch (error:any) {
      if (error.code === 4902) {
        try {
          await (web3.currentProvider! as any).request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: web3.utils.toHex(chainData.chain_id),
                chainName: chainData.name,
                rpcUrls: [chainData.rpc_url],
                nativeCurrency: {
                  name: chainData.native_currency.name,
                  symbol: chainData.native_currency.symbol,
                  decimals: Number(chainData.native_currency.decimals),
                }
              },
            ],
          });
        } catch (error:any) {
          alert('Unable to add new network: '+chainData.name+'. Please try to add this network manually.');
          console.log(error.message)
        }
      }
    }
  }

  public getAllowance = async () => {
    const { web3, address, chainId, networkSupported } = this.state;
    const chainData = getChainData(chainId)
    this.setState({ fetching: true });
    if ( networkSupported && !!chainData.token_address.length ) {
      try {
        await this.token.methods.allowance(
          address,
          chainData.wallet_address
        ).call().then( async (allowance: string) => {
          await this.setState({ 
            fetching: false, 
            allowance: web3.utils.fromWei(allowance, 'ether')
          })
        } )
      } catch (error) {
        console.error(error);
        await this.setState({ fetching: false });
      }
    } else {
      await this.setState({ balance: "0" });
    }
    web3.eth.getBalance(address).then( (balance: any) => {
      this.setState({ chainBalance: web3.utils.fromWei(balance, 'ether') });
    } )
  }

  public getAccountAssets = async () => {
    const { web3, address, chainId, networkSupported } = this.state;
    const chainData = getChainData(chainId)
    this.setState({ fetching: true });
    if ( networkSupported && !!chainData.token_address.length ) {
      try {
        await this.token.methods.balanceOf(address).call().then( async (balance: string) => {
          await this.setState({ 
            fetching: false, 
            balance: web3.utils.fromWei(balance, 'ether')
          })
        } )
        await this.getAllowance()
      } catch (error) {
        console.error(error);
        await this.setState({ fetching: false });
      }
    } else {
      await this.setState({ balance: "0" });
    }
    web3.eth.getBalance(address).then( (balance: any) => {
      this.setState({ chainBalance: web3.utils.fromWei(balance, 'ether') });
    } )
  }

  public approveAllowance = async () => {
    const { web3, address, chainId, networkSupported } = this.state;
    const chainData = getChainData(chainId)
    await this.getAllowance()
    if ( networkSupported ) {
      if ( Number(this.state.allowance) < Number(this.state.depositAmount) ) {
        try {
          this.setState({ fetching: true });
          await this.token.methods.approve(
            chainData.wallet_address,
            web3.utils.toWei(
              chainData.token_approve ? String(chainData.token_approve) : this.state.depositAmount, 
              'ether'
            )
          ).send({from: address})
          await this.setState({
            pendingApproval: false,
            pendingDeposit: true
          });
        } catch (error) {
          console.error(error);
          await this.setState({ fetching: false });
        }
      }
    }
  }

  public async handleDepositChanged(event:any) {
    const { allowance, chainId } = this.state;
    const chainData = getChainData(chainId)
    await this.setState({
      depositAmount: String(event.target.value),
      pendingApproval: !chainData.use_native_currency && Number(allowance) < Number(event.target.value)
    });
  }

  public async toggleSubmit() {
    this.setState({ pendingDeposit: !this.state.pendingDeposit })
  }

  public async handleDeposit() {
    const { web3, address, chainId, networkSupported } = this.state;
    const chainData = getChainData(chainId)
    if ( networkSupported && chainData.use_native_currency ) {
      try {
        this.setState({ fetching: true });
        // Call internal API to get user identifier (e.g. deposit_id)
        // Only a mockup here
        const call_api = async (): Promise<number> => {
          return new Promise<number>((resolve) => {
            resolve(123456)
          })
        }
        call_api().then(async (deposit_id: number) => {
          await this.contract.methods.deposit(
            deposit_id,
          ).send({
            from: address,
            value: web3.utils.toWei(
              this.state.depositAmount, 
              'ether'
            )
          })
          // Set some success state here
          this.setState({ 
            fetching: false,
            depositAmount: "0"
          });
        } )
      } catch (error) {
        console.error(error);
        await this.setState({ fetching: false });
      }
    } else {
      await this.getAllowance()
      if( networkSupported && (Number(this.state.allowance) >= Number(this.state.depositAmount)) ) {
        try {
          this.setState({ fetching: true });
          // Call internal API to get user identifier (e.g. deposit_id)
          // Only a mockup here
          const call_api = async (): Promise<number> => {
            return new Promise<number>((resolve) => {
              resolve(123456)
            })
          }
          call_api().then(async (deposit_id: number) => {
            await this.contract.methods.deposit(
              deposit_id,
              web3.utils.toWei(
                this.state.depositAmount, 
                'ether'
              )
            ).send({from: address})
            // Set some success state here
            this.setState({ 
              fetching: false,
              depositAmount: "0"
            });
          } )
        } catch (error) {
          console.error(error);
          await this.setState({ fetching: false });
        }
        await this.getAccountAssets()
      }
    }
  }

  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching,
      pendingDeposit,
      pendingApproval,
      depositAmount,
      networkSupported,
      balance,
      chainBalance,
      allowance,
    } = this.state;

    const chainData = getChainData(chainId)

    const renderWalletButton = (
      connected ? (
        <button value="" onClick={this.resetApp}>Disconnect Metamask</button>
      ) : (
        <button value="" onClick={this.connectWallet}>Connect Metamask</button>
      )
    )

    const renderFormButton = (
      pendingApproval ? (
        <button onClick={()=>this.approveAllowance()}>Approve</button>
      ) : pendingDeposit ? (
        <Fragment>
          <button onClick={()=>this.toggleSubmit()}>Back</button>
          <button onClick={()=>this.handleDeposit()}>Submit</button> 
        </Fragment>
      ) : (
       <button onClick={()=>this.toggleSubmit()}>Next</button>  
      )
    )

    const renderFormInput = (
      pendingDeposit ? (
        <div>
          Chain: {chainData.chain} <br/>
          Amount: {depositAmount} <br/>
        </div>
      ) : (
        <input type="number" value={depositAmount} onChange={this.handleDepositChanged.bind(this)}/>
      )
    )

    const renderChains = supportedChains.map(chain => (
      <button className={`chainbutton ${chainId == chain.chain_id ? "active" : ""}`} value="" onClick={()=>this.switchNetwork(chain.chain_id)}>{chain.name}</button>
    ))

    return (
      <div className="App">
        {renderWalletButton}<br/><br/>
        {connected && renderChains}
        <div>
          {networkSupported
            ? <div>
                <span>Network supported.</span><br/>
                <span>Contract address: {chainData.wallet_address}</span><br/>
                {!chainData.use_native_currency &&
                  <Fragment>
                    <span>Token address: {chainData.token_address}</span><br/>
                    <span>Token balance: {balance}</span><br/>
                    <span>Allowance: {allowance}</span>
                  </Fragment> 
                }
              </div>
            : <div>
                <span>Network unsupported.</span><br/>
              </div>
          }
          {connected &&
            <div>
              <span>Chain balance: {chainBalance}</span><br/>
            </div> 
          }
        </div>
        { (networkSupported && connected) && renderFormInput }
        { (networkSupported && connected) && renderFormButton }
      </div>
    )
  }
}

export default App;
