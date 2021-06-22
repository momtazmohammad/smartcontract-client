import React, { useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { connect } from "react-redux";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25%",
    },
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    //color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  dialogPaper: {
    minHeight: "40vh",
    maxHeight: "40vh",
  },
}));
function FormDialog(props) {
  const [bid, setBid] = useState({ amount: null, supName: null });
  const [errors, setErrors] = useState({ amount: "", supName: "" });
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: "success",
    msg: "",
  });
  const [loading, setLoading] = React.useState(false);
  const classes = useStyles();
  
  const onSubmit = async () => {
    let vld = true;
    for (const fld in bid) {
      if (!bid[fld]) {
        vld = false;
        setErrors({ ...errors, [fld]: "Please fill this field" });
      } else {
        setErrors({ ...errors, [fld]: "" });
      }
    }
    if (
      props.enquery.bidder !== "0x0000000000000000000000000000000000000000" &&
      props.enquery.amount < bid.amount
    ) {
      setOpenSnack({
        open: true,
        severity: "error",
        msg: "Your offer amount is greater than best offer price",
      });
      vld = false;
    }
    if (vld) {      
      setLoading(true);
      try {
        await props.contract.methods
          .placeBid(
            props.enquery.enqid,
            props.enquery.enqno,
            bid.amount,
            bid.supName
          )
          .send({
            from: props.account,
            value:
              props.enquery.sellerRcvDeposit * 10 ** 18 +
              props.enquery.sellerPaidDeposit * 10 ** 18,
          });
        props.updateEnq(
          props.enqueries.map((item) => {
            if (item.enqid === props.enquery.enqid) {
              item = {
                ...item,
                amount: bid.amount,
                supName: bid.supName,
                bidder: props.account,
              };
            }
            return item;
          })
        );
        setLoading(false);
        props.close();
      } catch (err) {
        setLoading(false);
        console.log(err);
        setOpenSnack({
          open: true,
          severity: "error",
          msg: "Error happned please check the requirement",
        });
      }
    }
  };
  const setBidState = ({ target }) => {
    setBid({ ...bid, [target.name]: target.value });
  };
  return (
    <div>
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
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        maxWidth="md"
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">New Bid</DialogTitle>
        <DialogContent>
          <TextField
            error={"" !== errors.amount}
            helperText={errors.amount}
            fullWidth
            required
            onChange={setBidState}
            type="number"
            name="amount"
            label="Amount"
          />
          <TextField
            error={"" !== errors.supName}
            helperText={errors.supName}
            fullWidth
            required
            onChange={setBidState}
            name="supName"
            label="Supplier Name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.close} color="primary">
            Cancel
          </Button>
          <div className={classes.wrapper}>
            <Button onClick={onSubmit} color="primary" disabled={loading}>
              Save
            </Button>
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </DialogActions>
      </Dialog>
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
export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
