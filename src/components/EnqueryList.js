import React ,{useState,useEffect,useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
//import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PaymentIcon from '@material-ui/icons/Payment';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import StoreIcon from '@material-ui/icons/Store';
import Switch from '@material-ui/core/Switch';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import NewEnquery from './NewEnquery'
import NewBid from './NewBid'
import {connect} from 'react-redux'

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor:"#999"    
  },
  button:{
    marginRight: theme.spacing(2),      
  }
}));

const statusEnum={0:"Still Open",1:"Ended",2:"Received",3:"Settlement",4:"Cancle",null:""}

function EnqueryList(props) {
  
  const [openNewEnquery,setOpenNewEnquery]=useState(false);
  const [openPlaceBid,setOpenPlaceBid]=useState(false);
  const [enquery,setEnquery]=useState({});
  const [openSnack, setOpenSnack] = useState({open:false,severity:"success",msg:""});
  
  const [filterState, setfilterState] = useState({
    myEnqueries: false,
    myBids: false,
  });
  // It is same as computed property in vue js
  const filterEnqs=props.enqueries.filter((item)=>{
        if(!filterState.myBids && !filterState.myEnqueries) return true;
        if(filterState.myEnqueries && item.buyerAdd===props.account) return true;
        if(filterState.myBids && item.bidder===props.account) return true;
        return false;      
      });
  // useEffect(() => {
  //   setFilterEnqs(enqueries.filter((item)=>{
  //     if(!filterState.myBids && !filterState.myEnqueries) return true;
  //     if(filterState.myEnqueries && item.buyerAdd===props.account) return true;
  //     if(filterState.myBids && item.bidder===props.account) return true;
  //     return false;      
  //   }));  
  // }, [filterState,enqueries]);
  const handleFilterChange=(event)=>{   
    setfilterState((filterState)=>({...filterState,[event.target.name]: event.target.checked }));
    
  }
  useInterval( async ()=>{
    const updEnqs=[];
    let updflg=false;
    try {
    for(const item of props.enqueries) {
      console.log("i:",item,+item.status===0, item.buyerAdd===props.account, (item.enqEndTime*1000+10000),Date.now());
      if(+item.status===0 && item.buyerAdd===props.account && (item.enqEndTime*1000+10000)<Date.now()) {
        const res = await props.contract.methods.endEnquery(item.enqid).call();  
        console.log("res:",res);
        if(res) {      
          if(item.supName==="") {
            updEnqs.push({...item,status:4});
            updflg=true;
          } else {
            updEnqs.push({...item,status:1});
            updflg=true;
          }          
        } else {
          updEnqs.push(item)
        }
      } else {
        updEnqs.push(item)
      }
    }    
    if(updflg){
      console.log("update");
    props.updateEnq(updEnqs);
    }
    }
    catch (err){
      console.log("err:",err);
    }    
    // for(let i=0;i<enqueries.length;i++) {
    // if(enqueries[i].buyerAdd===props.account && enqueries[i].enqEndTime*1000<Date.now()) {      
    //   setEnqueries([...enqueries,{...enqueries[i],status:1}]);      
    //   //call smart contract
    // }
    // }
      },60000);

      function useInterval(callback, delay) {
        const savedCallback = useRef();
      
        // Remember the latest function.
        useEffect(() => {
          savedCallback.current = callback;
        }, [callback]);
      
        // Set up the interval.
        useEffect(() => {
          function tick() {
            savedCallback.current();
          }
          if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
          }
        }, [delay]);
      }

  const onNewEnquery=()=>{
    setOpenNewEnquery(true);
  }
  const onPlaceBid=(enquery)=>{
    console.log(enquery);
    if(+enquery.status===0 && enquery.bidder!==props.account && enquery.buyerAdd!==props.account) {
    setEnquery(enquery);
    setOpenPlaceBid(true);
    } else {      
      if(enquery.bidder===props.account) {
      setOpenSnack({open:true,severity:"warning",msg:"You already send your quotation"});
      } else if(enquery.buyerAdd===props.account) {
        setOpenSnack({open:true,severity:"warning",msg:"Buyer can't send the quotation"});
        } else {
        setOpenSnack({open:true,severity:"warning",msg:"Enquery is not open any more"});
        }
      }
    }  
  
  const onRecieved=async (enq)=>{
    if(enq.bidder===props.account && enq.status===1) {
      const res = await props.contract.methods.receivedItem(enq.enqid).call();  
    if(res) { 
      props.updateEnq(props.enqueries.map((item)=>{
        if(item.enqid===enq.enqid) {
          item={...item,status:2};          
        } 
        return item;
      }));  }
    } else {
      setOpenSnack({open:true,severity:"error",msg:"When enquery is closed, just winner can anounced received the cargo"});
    }
  }

  const onSettlement=async (enq)=>{
    if(enq.bidder===props.account && enq.status===2) {
      const res = await props.contract.methods.settlement(enq.enqid).call();  
    if(res) {
      props.updateEnq(props.enqueries.map((item)=>{
        if(item.enqid===enq.enqid) {
          item={...item,status:3};          
        } 
        return item;
      }));
    }
    } else {
      setOpenSnack({open:true,severity:"error",msg:"When enquery is in received stage, just seller can tell payment has been done by buyer"});
    }
  }

  const handleSave=async (e)=>{    
     const result=await props.contract.methods.createEnquery(e.enqno,+e.duration*60,e.partNo,e.partName,e.uom,+e.qty,e.buyerName,e.locationAddress,String(e.buyerDeposit*10**18),String(e.sellerRcvDeposit*10**18),String(e.sellerPaidDeposit*10**18)).send({ from: props.account,value:String(e.buyerDeposit*10**18)});     
    if(result) {
    props.addEnq({enqid:result-1,enqno:e.enqno,enqEndTime:e.duration*60+Date.now()/1000,partNo:e.partNo,partName:e.partName,uom:e.uom,qty:e.qty,buyerName:e.buyerName,locationAddress:e.locationAddress,buyerDeposit:e.buyerDeposit,sellerRcvDeposit:e.sellerRcvDeposit,sellerPaidDeposit:e.sellerPaidDeposit,status:0,buyerAdd:props.account});
    setOpenNewEnquery(false);
    }
  }
  
  const handleSaveBid=async (bid)=>{
    console.log(bid,enquery);
    const res=await props.contract.methods.placeBid(enquery.enqid,enquery.enqno,bid.amount,bid.supName).send({from:props.account,value:enquery.sellerRcvDeposit*10**18+enquery.sellerPaidDeposit*10**18});
    if(res) {
    props.updateEnq(props.enqueries.map((item)=>{
      if(item.enqid===enquery.enqid) {
        item={...item,amount:bid.amount,supName:bid.supName,bidder:props.account};
      } 
      return item;
    }));
    setOpenPlaceBid(false);
  }
  }
  const handleClose=()=>{    
    setOpenNewEnquery(false);
  }
  const handleCloseBid=()=>{    
    setOpenPlaceBid(false);
  }
    const classes = useStyles();

    const statusAv=(s)=>{
      switch (s) {
        case 0:
          return "O";
          case 1:
              return "E";    
              case 2:
                  return "R";    
                  case 3:
                      return "S";                
                      case 4:
                        return "C";                  
        default: return "";  
    }
    }

    return (
        <div>
          <Snackbar open={openSnack.open} autoHideDuration={4000} onClose={()=>(setOpenSnack({...openSnack,open:false,msg:""}))}>
        <Alert onClose={()=>(setOpenSnack({...openSnack,open:false,msg:""}))} severity={openSnack.severity}>
          {openSnack.msg}
        </Alert>
      </Snackbar>
      <AppBar className={classes.appBar} position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
          Enquery List
          </Typography>
          <Button  variant="contained" size="medium" className={classes.button} color="primary" onClick={onNewEnquery}>New Enquery</Button>
          <FormControlLabel
        control={
          <Switch
            checked={filterState.myEnqueries}
            onChange={handleFilterChange}
            name="myEnqueries"
            color="primary"
          />
        }
        label="My Enqueries"
      />
                <FormControlLabel
        control={
          <Switch
            checked={filterState.myBids}
            onChange={handleFilterChange}
            name="myBids"
            color="primary"
          />
        }
        label="My Quotations"
      />
        </Toolbar>
      </AppBar>        
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell width="5%">Enqery No</TableCell>
              <TableCell width="7%">End Time</TableCell>
              <TableCell width="5%">Part No</TableCell>
              <TableCell width="10%">Part Name</TableCell>
              <TableCell width="3%">UOM</TableCell>
              <TableCell width="4%">Quantity</TableCell>
              <TableCell width="10%">Buyer Name</TableCell>
              <TableCell width="15%">Location Address</TableCell>
              <TableCell width="5%">Buyer Deposit</TableCell>
              <TableCell width="10%">Supplier Name</TableCell>
              <TableCell width="5%">Offer Amount</TableCell>
              <TableCell width="5%">Seller Rcv Stage Deposit</TableCell>              
              <TableCell width="5%">Seller Settlment Stage Deposit</TableCell>
              <TableCell width="4%">status</TableCell>
              <TableCell width="6%" align="center"  colSpan={3}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterEnqs.map((row) =>{return (
              <TableRow key={row.enqno}>
                <TableCell component="th" scope="row">
                  {row.enqno}
                </TableCell>
                <TableCell align="right">{
                `${new Date(row.enqEndTime*1000).toLocaleDateString()} ${new Date(row.enqEndTime*1000).toLocaleTimeString()}`}</TableCell>
                <TableCell >{row.partNo}</TableCell>
                <TableCell >{row.partName}</TableCell>
                <TableCell >{row.uom}</TableCell>
                <TableCell >{row.qty}</TableCell>
                <TableCell >{row.buyerName}</TableCell>
                <TableCell >{row.locationAddress}</TableCell>
                <TableCell >{row.buyerDeposit}</TableCell>
                <TableCell>{row.supName}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.sellerRcvDeposit}</TableCell>
                <TableCell>{row.sellerPaidDeposit}</TableCell>
                <TableCell><Chip size="small" variant="outlined" color="primary" avatar={<Avatar>{statusAv(row.status)}</Avatar>} label={statusEnum[row.status]} /></TableCell>                
                <TableCell ><IconButton edge="start" onClick={()=>onPlaceBid(row)} color="primary" title="Send Quotation" ><StoreIcon/></IconButton></TableCell>
                <TableCell ><IconButton edge="start" onClick={()=>onRecieved(row)} color="primary" title="Recieved Goods" ><LocalShippingIcon/></IconButton></TableCell>
                <TableCell ><IconButton edge="start" onClick={()=>onSettlement(row)} color="primary" title="Settlement" ><PaymentIcon/></IconButton></TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </TableContainer> 
<NewEnquery open={openNewEnquery} close={handleClose} save={handleSave}/>
<NewBid open={openPlaceBid} close={handleCloseBid} save={handleSaveBid} enquery={enquery} />
      </div>   )
}

const mapStateToProps = (state)=>{    
  return {
  enqueries:state.enqueries,
  contract:state.contract,
  account:state.account,
  enquery:state.enquery
  }
}
const mapDispatchToProps = (dispatch) => {
return {
  addEnq: (enq) => dispatch({type: 'ADD_ENQ', payload: enq}),
  updateEnq:(enqs) => dispatch({type:'updateEnq',payload:enqs}) 
}
}

export default connect(mapStateToProps,mapDispatchToProps )(EnqueryList)