import React, { Component } from "react";
import PurchaseContract from "./contracts/Purchase.json";
import getWeb3 from "./getWeb3";
import EnqueryList from './components/EnqueryList';
import {connect} from 'react-redux'
//import '@fontsource/roboto';

class App extends Component {
  componentDidMount = async () => {
    try {      
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
    this.props.setWeb3(web3);  // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      
      this.props.setAccount(accounts[0]);
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
    //   this.setState({ web3, accounts, contract: instance },this.runExample);    
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
//    runExample=async ()=>{
//     const {  contract } = this.state;
//   const enqCnt = await contract.methods.getEnqueryCount().call();  
//   console.log("e:",enqCnt);
//   let enqList=[];
//   let bid,enquery;
//   // Update state with the result.
//   for(let i=0;i<enqCnt;i++){
//       enquery=await contract.methods.getEnquery(i).call();
//       bid = await contract.methods.getBid( i ).call();      
//       enqList.push({enqid:i,enqno:enquery[0],enqEndTime:enquery[1],partNo:enquery[2],partName:enquery[3],uom:enquery[4],qty:enquery[5],buyerName:enquery[6],locationAddress:enquery[7],status:enquery[8],buyerDeposit:enquery[9]/10**18,
//                     bidder:bid[0],amount:bid[1],supName:bid[2],buyerAdd:bid[3],sellerRcvDeposit:bid[4]/10**18,sellerPaidDeposit:bid[5]/10**18})
//   }
//   this.props.setEnqs(enqList);       

// }
  
//new Date(a).toLocaleString("fa-IR")
  
  render() {
    if (!this.props.web3) {
    return <div>Loading Web3, accounts, and contract...{this.props.web3}</div>;
    }
    return (
      <div className="App">
        <EnqueryList />   
      </div>
    );
  }
}
const mapStateToProps = (state)=>{    
  return {
  enqueries:state.enqueries,
  contract:state.contract,
  account:state.account,
  web3:state.web3
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setEnqs: (enqs) => dispatch({type: 'setEnqs', payload: enqs}),
    setWeb3: (web3) => dispatch({type: 'setWeb3', payload: web3}),
    setAccount: (account) => dispatch({type: 'setAccount', payload: account}),
    setContract:(contract) => dispatch({type: 'setContract', payload: contract}),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(App)
