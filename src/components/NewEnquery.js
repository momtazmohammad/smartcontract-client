import React, { useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
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
    minHeight: "90vh",
    maxHeight: "90vh",
  },
  textfld: {
    width: "45%",
    margin: "1rem",
  },
}));

function FormDialog(props) {
  const [enquery, setEnquery] = useState({
    enqno: null,
    duration: null,
    partNo: null,
    partName: null,
    uom: null,
    qty: null,
    buyerName: null,
    locationAddress: null,
    buyerDeposit: null,
    sellerRcvDeposit: null,
    sellerPaidDeposit: null,
  });
  const [errors, setErrors] = useState({
    enqno: "",
    duration: "",
    partNo: "",
    partName: "",
    uom: "",
    qty: "",
    buyerName: "",
    locationAddress: "",
    buyerDeposit: "",
    sellerRcvDeposit: "",
    sellerPaidDeposit: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: "success",
    msg: "",
  });
  const classes = useStyles();
  const onSubmit = async () => {
    let vld = true;
    for (const fld in enquery) {
      if (!enquery[fld]) {
        vld = false;
        setErrors((errors) => ({ ...errors, [fld]: "Please fill this field" }));
      } else {
        setErrors((errors) => ({ ...errors, [fld]: "" }));
      }
    }
    if (vld) {
      setLoading(true);
      try {
        const result = await props.contract.methods
          .createEnquery(
            enquery.enqno,
            +enquery.duration * 60,
            enquery.partNo,
            enquery.partName,
            enquery.uom,
            +enquery.qty,
            enquery.buyerName,
            enquery.locationAddress,
            String(enquery.buyerDeposit * 10 ** 18),
            String(enquery.sellerRcvDeposit * 10 ** 18),
            String(enquery.sellerPaidDeposit * 10 ** 18)
          )
          .send({
            from: props.account,
            value: String(enquery.buyerDeposit * 10 ** 18),
          });
        props.addEnq({
          enqid: result.events.EnqueryCreated.returnValues.id,
          enqno: enquery.enqno,
          enqEndTime: enquery.duration * 60 + Date.now() / 1000,
          partNo: enquery.partNo,
          partName: enquery.partName,
          uom: enquery.uom,
          qty: enquery.qty,
          buyerName: enquery.buyerName,
          locationAddress: enquery.locationAddress,
          buyerDeposit: enquery.buyerDeposit,
          sellerRcvDeposit: enquery.sellerRcvDeposit,
          sellerPaidDeposit: enquery.sellerPaidDeposit,
          status: 0,
          buyerAdd: props.account,
        });
        props.close();
      } catch (err) {
        console.log(err);
        setOpenSnack({
          open: true,
          severity: "error",
          msg: "Error happned please check the requirement",
        });
      }
      setLoading(false);
    }
  };
  const setEnqueryState = ({ target }) => {
    setEnquery((enquery) => ({ ...enquery, [target.name]: target.value }));
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
        maxWidth="lg"
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle name="form-dialog-title">New Enquery</DialogTitle>
        <DialogContent>          
          <TextField
            error={"" !== errors.enqno}
            helperText={errors.enqno}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            name="enqno"
            label="Enquery No"
          />
          <TextField
            error={"" !== errors.duration}
            helperText={errors.duration}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            type="number"
            name="duration"
            label="Enquery duration in Mins"
          />
          <TextField
            error={"" !== errors.partNo}
            helperText={errors.partNo}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            name="partNo"
            label="Part Nnumber"
          />
          <TextField
            error={"" !== errors.partName}
            helperText={errors.partName}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            name="partName"
            label="Part Name"
          />
          <TextField
            error={"" !== errors.uom}
            helperText={errors.uom}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            name="uom"
            label="Uint of Measurement"
          />
          <TextField
            error={"" !== errors.qty}
            helperText={errors.qty}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            type="number"
            name="qty"
            label="quantity"
          />
          <TextField
            error={"" !== errors.buyerName}
            helperText={errors.buyerName}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            name="buyerName"
            label="Buyer Name"
          />
          <TextField
            error={"" !== errors.locationAddress}
            helperText={errors.locationAddress}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            name="locationAddress"
            label="Buyer Location Address"
          />
          <TextField
            error={"" !== errors.buyerDeposit}
            helperText={errors.buyerDeposit}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            type="number"
            name="buyerDeposit"
            label="Buyer Deposit in Ether"
          />
          <TextField
            error={"" !== errors.sellerRcvDeposit}
            helperText={errors.sellerRcvDeposit}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            type="number"
            name="sellerRcvDeposit"
            label="Seller Deposit which will release in Buyer Recieved Phase"
          />
          <TextField
            error={"" !== errors.sellerPaidDeposit}
            helperText={errors.sellerPaidDeposit}
            className={classes.textfld}
            required
            onChange={setEnqueryState}
            type="number"
            name="sellerPaidDeposit"
            label="Seller Deposit which will release in settlement phase"
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
    addEnq: (enq) => dispatch({ type: "ADD_ENQ", payload: enq }),    
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
