import React, { Component } from "react";
import PurchaseContract from "./contracts/Purchase.json";
import getWeb3 from "./getWeb3";
import EnqueryList from './components/EnqueryList';
import {connect} from 'react-redux'
//import '@fontsource/roboto';

class App extends Component {
  state = { enqueries:[], web3: null, accounts: null, contract: null};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

    this.props.setWeb3(web3);  // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      this.props.setAccounts(accounts);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PurchaseContract.networks[networkId];
      const instance = new web3.eth.Contract(
        PurchaseContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      this.props.setContract(instance);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
       // get Enqueries from smart contract
       const enqCnt = await instance.methods.getEnqueryCount().call();  
       let enqList=[];
       let bid,enquery;
       // Update state with the result.
       for(let i=0;i<enqCnt;i++){
           enquery=await instance.methods.getEnquery(i).call();
           bid = await instance.methods.getBid( i ).call();      
           enqList.push({enqid:i,enqno:enquery[0],enqEndTime:enquery[1],partNo:enquery[2],partName:enquery[3],uom:enquery[4],qty:enquery[5],buyerName:enquery[6],locationAddress:enquery[7],status:enquery[8],buyerDeposit:enquery[9]/10**18,
                         bidder:bid[0],amount:bid[1],supName:bid[2],buyerAdd:bid[3],sellerRcvDeposit:bid[4]/10**18,sellerPaidDeposit:bid[5]/10**18})
       }
       this.props.setEnqs(enqList);       
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleNewEnquery=async (enquery)=>{
    const result=await this.state.contract.methods.createEnquery(enquery.enqno,enquery.duration*60,enquery.partNo,enquery.partName,enquery.uom,enquery.qty,enquery.buyerName,enquery.locationAddress,enquery.buyerDeposit*10**18,enquery.sellerRcvDeposit*10**18,enquery.sellerPaidDeposit*10**18).send({ from: accounts[0],value:enquery.buyerDeposit*10**18});             
    if(result>0) {
    this.setState((state)=>({
      enqueries:[...state.enqueries,{enqid:result,enqno:enquery.enqno,enqEndTime:~~(Date.now()/1000)+enquery.duration*60,partNo:enquery.partNo,partName:enquery.partName,uom:enquery.uom,qty:enquery.qty,buyerName:enquery.buyerName,locationAddress:enquery.locationAddress,status:0,buyerDeposit:enquery.buyerDeposit,
        bidder:"",amount:0,supName:"",buyerAdd:"",sellerRcvDeposit:enquery.sellerRcvDeposit,sellerPaidDeposit:enquery.sellerPaidDeposit}]
    }));
  }
  }

  handleNewBid=async (bid)=>{
    const res=await this.state.contract.methods.placeBid(bid.enqid,bid.enqno,bid.amount,bid.supName).send({from:accounts[0],value:bid.sellerRcvDeposit*10**18+bid.sellerPaidDeposit*10**18});
    if(res) {
    this.setState((state)=>({
      enqueries:state.enqueries.map(item=>{
        if(item.enqid==bid.enqid) {
item={...item,bidder:state.accounts[0],amount:bid.amount,supName:bid.supName}
        }
        return item
      })
    }));
  }    
}
//new Date(a).toLocaleString("fa-IR")
handleEndEnquery=(async ({enqid})=>{
  const res = await contract.methods.endEnquery(enqid).call();  
  if(res) {
    this.setState((state)=>({
      enqueries:state.enqueries.map(item=>{
        if(item.enqid==enqid) {
item={...item,state:1}
        }
        return item
      })
    }));  
  }
})
  handleRcvItems=(async ({enqid})=>{
    const res = await contract.methods.receivedItem(enqid).call();  
    if(res) {
      this.setState((state)=>({
        enqueries:state.enqueries.map(item=>{
          if(item.enqid==enqid) {
  item={...item,state:2}
          }
          return item
        })
      }));  
    }
  })
  handleSettlement=(async ({enqid})=>{
    const res = await contract.methods.settlement(enqid).call();  
    if(res) {
      this.setState((state)=>({
        enqueries:state.enqueries.map(item=>{
          if(item.enqid==enqid) {
  item={...item,state:3}
          }
          return item
        })
      }));  
    }
  })
  
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <EnqueryList />   
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setEnqs: (enqs) => dispatch({type: 'setEnqs', payload: enqs}),
    setWeb3: (web3) => dispatch({type: 'setWeb3', payload: web3}),
    setAccounts: (accounts) => dispatch({type: 'setAccounts', payload: accounts}),
    setContract:(inst) => dispatch({type: 'setContract', payload: inst}),
  }
}

export default connect(undefined,mapDispatchToProps)(App)
