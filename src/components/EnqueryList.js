import React, { useState, useEffect, useRef } from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import PaymentIcon from "@material-ui/icons/Payment";
import DeleteIcon from "@material-ui/icons//Delete";
import UpdateIcon from "@material-ui/icons/Update";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import StoreIcon from "@material-ui/icons/Store";
import Switch from "@material-ui/core/Switch";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import NewEnquery from "./NewEnquery";
import NewBid from "./NewBid";
import { connect } from "react-redux";

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
    backgroundColor: "#999",
  },
  button: {
    marginRight: theme.spacing(2),
  },
}));

const statusEnum = {
  0: "Still Open",
  1: "closed",
  2: "Received",
  3: "Settlement",
  4: "Cancle",
  null: "",
};

function EnqueryList(props) {
  const [sendtxn, setSendtxn] = React.useState(false);
  const [openNewEnquery, setOpenNewEnquery] = useState(false);
  const [openPlaceBid, setOpenPlaceBid] = useState(false);
  const [enquery, setEnquery] = useState({});
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: "success",
    msg: "",
  });
  const [filterState, setfilterState] = useState({
    myEnqueries: false,
    myBids: false,
    openEnqs: false,
  });
  // It is same as computed property in vue js
  const filterEnqs = props.enqueries.filter((item) => {
    if (
      !filterState.myBids &&
      !filterState.myEnqueries &&
      !filterState.openEnqs
    )
      return true;
    if (filterState.openEnqs) {
      if(item.status < 3) {
        if (filterState.myEnqueries && item.buyerAdd === props.account)
          return true;
        if (filterState.myBids && item.bidder === props.account) return true;
        if (filterState.myBids || filterState.myEnqueries) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      } 
    } else {
      if (filterState.myEnqueries && item.buyerAdd === props.account)
          return true;
      if (filterState.myBids && item.bidder === props.account) return true;
          return false;
    }
  });
  const handleFilterChange = (event) => {
    setfilterState((filterState) => ({
      ...filterState,
      [event.target.name]: event.target.checked,
    }));
  };
  useInterval(async () => {
    const updEnqs = [];
    let updflg = false;
    try {
      //const res= await props.contract.methods.getBlocktime().call();
      // for (const item of props.enqueries) {
      //   if (
      //     +item.status === 0 &&
      //     item.buyerAdd === props.account &&
      //     item.enqEndTime * 1000 + 60000 < Date.now()
      //   ) {
      //     await props.contract.methods
      //       .endEnquery(item.enqid)
      //       .send({ from: props.account });
      //     if (item.supName === "") {
      //       updEnqs.push({ ...item, status: 4 });
      //       updflg = true;
      //     } else {
      //       updEnqs.push({ ...item, status: 1 });
      //       updflg = true;
      //     }
      //   } else {
      //     updEnqs.push(item);
      //   }
      // }
      // if (updflg) {
      //   props.updateEnq(updEnqs);
      // }
    } catch (err) {
      if (updflg) {
        for (const item of props.enqueries) {
          if (!updEnqs.find(({ enqid }) => +enqid === +item.engid)) {
            updEnqs.push(item);
          }
        }
        props.updateEnq(updEnqs);
      }
      console.log("err:", err);
    }
  }, 60000);

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

  const onNewEnquery = () => {
    setOpenNewEnquery(true);
  };

  const onPlaceBid = (enquery) => {
    if (
      +enquery.status === 0 &&
      enquery.bidder !== props.account &&
      enquery.buyerAdd !== props.account
    ) {
      setEnquery(enquery);
      setOpenPlaceBid(true);
    } else {
      if (enquery.bidder === props.account) {
        setOpenSnack({
          open: true,
          severity: "warning",
          msg: "You already send your quotation",
        });
      } else if (enquery.buyerAdd === props.account) {
        setOpenSnack({
          open: true,
          severity: "warning",
          msg: "Buyer can't send the quotation",
        });
      } else {
        setOpenSnack({
          open: true,
          severity: "warning",
          msg: "Enquery is not open any more",
        });
      }
    }
  };

  const onEnd = async (enq) => {
    setSendtxn(true);
    try {
      if (
        enq.buyerAdd === props.account &&
        +enq.status === 0 &&
        enq.enqEndTime * 1000 < Date.now()
      ) {
        await props.contract.methods
          .endEnquery(enq.enqid)
          .send({ from: props.account });
        props.updateEnq(
          props.enqueries.map((item) => {
            if (item.enqid === enq.enqid) {
              item = { ...item, status: 1 };
            }
            return item;
          })
        );
      } else {
        setOpenSnack({
          open: true,
          severity: "error",
          msg: "Just not closed overdue Enquery can be closed by Buyer",
        });
      }
    } catch (err) {
      setOpenSnack({
        open: true,
        severity: "error",
        msg: "Error happned please check the requirement",
      });
    }
    setSendtxn(false);
  };

  const onCancle = async (enq) => {
    setSendtxn(true);
    try {
      if (enq.buyerAdd === props.account && +enq.status === 0 && !enq.amount) {
        await props.contract.methods
          .cancleEnquery(enq.enqid)
          .send({ from: props.account });
        props.updateEnq(
          props.enqueries.map((item) => {
            if (item.enqid === enq.enqid) {
              item = { ...item, status: 4 };
            }
            return item;
          })
        );
      } else {
        setOpenSnack({
          open: true,
          severity: "error",
          msg: "Just not closed Enquery which dont have any quotation can be cancled by Buyer",
        });
      }
    } catch (err) {
      setOpenSnack({
        open: true,
        severity: "error",
        msg: "Error happned please check the requirement",
      });
    }
    setSendtxn(false);
  };
  const onRecieved = async (enq) => {
    setSendtxn(true);
    try {
      if (enq.buyerAdd === props.account && +enq.status === 1) {
        await props.contract.methods
          .receivedItem(enq.enqid)
          .send({ from: props.account });
        props.updateEnq(
          props.enqueries.map((item) => {
            if (item.enqid === enq.enqid) {
              item = { ...item, status: 2 };
            }
            return item;
          })
        );
      } else {
        setOpenSnack({
          open: true,
          severity: "error",
          msg: "When enquery is closed, just winner can anounced received the cargo",
        });
      }
    } catch (err) {
      setOpenSnack({
        open: true,
        severity: "error",
        msg: "Error happned please check the requirement",
      });
    }
    setSendtxn(false);
  };

  const onSettlement = async (enq) => {
    setSendtxn(true);
    try {
      if (enq.bidder === props.account && +enq.status === 2) {
        await props.contract.methods
          .settlement(enq.enqid)
          .send({ from: props.account });
        props.updateEnq(
          props.enqueries.map((item) => {
            if (item.enqid === enq.enqid) {
              item = { ...item, status: 3 };
            }
            return item;
          })
        );
      } else {
        setOpenSnack({
          open: true,
          severity: "error",
          msg: "When enquery is in received stage, just seller can tell payment has been done by buyer",
        });
      }
    } catch (err) {
      setOpenSnack({
        open: true,
        severity: "error",
        msg: "Error happned please check the requirement",
      });
    }
    setSendtxn(false);
  };

  const handleClose = () => {
    setOpenNewEnquery(false);
  };

  const handleCloseBid = () => {
    setOpenPlaceBid(false);
  };

  const classes = useStyles();

  const statusAv = (s) => {
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
      default:
        return "";
    }
  };

  return (
    <div>
        <Dialog
        open={sendtxn}
      >
        <DialogTitle >{"Transaction is in progress ..."}</DialogTitle>
        <DialogContent>          
          <LinearProgress />
        </DialogContent>
        <DialogActions>        
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnack.open}
        autoHideDuration={4000}
        onClose={() => setOpenSnack({ ...openSnack, open: false, msg: "" })}
      >
        <Alert
          onClose={() => setOpenSnack({ ...openSnack, open: false, msg: "" })}
          severity={openSnack.severity}
        >
          {openSnack.msg}
        </Alert>
      </Snackbar>
      <AppBar className={classes.appBar} position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Enquery List
          </Typography>
          <Button
            variant="contained"
            size="medium"
            className={classes.button}
            color="primary"
            onClick={onNewEnquery}
          >
            New Enquery
          </Button>
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
          <FormControlLabel
            control={
              <Switch
                checked={filterState.openEnqs}
                onChange={handleFilterChange}
                name="openEnqs"
                color="primary"
              />
            }
            label="Just Open Enqueries"
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
              <TableCell width="6%" align="center" colSpan={3}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterEnqs.map((row) => {
              return (
                <TableRow key={row.enqid}>
                  <TableCell component="th" scope="row">
                    {row.enqno}
                  </TableCell>
                  <TableCell align="right">{`${new Date(
                    row.enqEndTime * 1000
                  ).toLocaleDateString()} ${new Date(
                    row.enqEndTime * 1000
                  ).toLocaleTimeString()}`}</TableCell>
                  <TableCell>{row.partNo}</TableCell>
                  <TableCell>{row.partName}</TableCell>
                  <TableCell>{row.uom}</TableCell>
                  <TableCell>{row.qty}</TableCell>
                  <TableCell>{row.buyerName}</TableCell>
                  <TableCell>{row.locationAddress}</TableCell>
                  <TableCell>{row.buyerDeposit}</TableCell>
                  <TableCell>{row.supName}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.sellerRcvDeposit}</TableCell>
                  <TableCell>{row.sellerPaidDeposit}</TableCell>
                  <TableCell>                  
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      avatar={<Avatar>{statusAv(row.status)}</Avatar>}
                      label={statusEnum[row.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      edge="start"
                      onClick={() => onPlaceBid(row)}
                      color="primary"
                      title="Send Quotation"
                    >
                      <StoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      edge="start"
                      onClick={() => onRecieved(row)}
                      color="primary"
                      title="Recieved Goods"
                    >
                      <LocalShippingIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      edge="start"
                      onClick={() => onSettlement(row)}
                      color="primary"
                      title="Settlement"
                    >
                      <PaymentIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      edge="start"
                      onClick={() => onEnd(row)}
                      color="primary"
                      title="Close"
                    >
                      <UpdateIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      edge="start"
                      onClick={() => onCancle(row)}
                      color="primary"
                      title="Cancle"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <NewEnquery open={openNewEnquery} close={handleClose} />
      <NewBid open={openPlaceBid} close={handleCloseBid} enquery={enquery} />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    enqueries: state.enqueries,
    contract: state.contract,
    account: state.account,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    updateEnq: (enqs) => dispatch({ type: "updateEnq", payload: enqs }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnqueryList);
