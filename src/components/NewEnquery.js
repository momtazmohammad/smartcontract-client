import React,{useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { makeStyles } from '@material-ui/core'
//import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
          margin: theme.spacing(1),
          width: '25%',
        },
      },    
    dialogPaper: {
        minHeight: '90vh',
        maxHeight: '90vh',        
    },
    textfld:{
      width:"45%",margin:"1rem"
    }
}));

function FormDialog(props) {
    const [enquery, setEnquery] = useState({enqno:null,duration:null,partNo:null,partName:null,uom:null,qty:null,buyerName:null,locationAddress:null,buyerDeposit:null,sellerRcvDeposit:null,sellerPaidDeposit:null})
    const [errors, setErrors] = useState({enqno:"",duration:"",partNo:"",partName:"",uom:"",qty:"",buyerName:"",locationAddress:"",buyerDeposit:"",sellerRcvDeposit:"",sellerPaidDeposit:""})
    const classes = useStyles()
    const onSubmit= ()=>{
        let vld=true;                
         for(const fld in enquery) {                                     
            if(!enquery[fld]) {
                vld=false;           
                setErrors((errors)=>({ ...errors, [fld]: "Please fill this field" }));
                //setErrors({ ...errors, [fld]: "Please fill this field" });
            } else {
                  setErrors((errors)=>({...errors,[fld]:""}));                 
                  //setErrors({...errors,[fld]:""});                 
            }
        }
        if(vld) {
        props.save(enquery);
        }
   }   
    const setEnqueryState=(({target})=>{                
        setEnquery((enquery)=>({...enquery,[target.name]:target.value}));
    })
  return (
    <div >
      <Dialog open={props.open} onClose={props.handleClose} maxWidth="lg" classes={{ paper: classes.dialogPaper }} aria-labelledby="form-dialog-title">
        <DialogTitle name="form-dialog-title">New Enquery</DialogTitle>
        <DialogContent >       
        {/* <form className={classes.root} noValidate autoComplete="off"> */}      
      <TextField error={""!==errors.enqno} helperText={errors.enqno} className={classes.textfld} required onChange={setEnqueryState}  name="enqno" label="Enquery No" />
      <TextField error={""!==errors.duration} helperText={errors.duration} className={classes.textfld} required onChange={setEnqueryState} type="number" name="duration" label="Enquery duration in Mins" />
      <TextField error={""!==errors.partNo} helperText={errors.partNo} className={classes.textfld} required onChange={setEnqueryState}  name="partNo" label="Part Nnumber"/>
      <TextField error={""!==errors.partName} helperText={errors.partName} className={classes.textfld} required onChange={setEnqueryState}  name="partName" label="Part Name"/>
      <TextField error={""!==errors.uom} helperText={errors.uom} className={classes.textfld} required onChange={setEnqueryState}  name="uom" label="Uint of Measurement"/>
      <TextField error={""!==errors.qty} helperText={errors.qty} className={classes.textfld} required onChange={setEnqueryState} type="number" name="qty" label="quantity"/>
      <TextField error={""!==errors.buyerName} helperText={errors.buyerName} className={classes.textfld} required onChange={setEnqueryState}  name="buyerName" label="Buyer Name"/>
      <TextField error={""!==errors.locationAddress} helperText={errors.locationAddress} className={classes.textfld} required onChange={setEnqueryState}  name="locationAddress" label="Buyer Location Address"/>
      <TextField error={""!==errors.buyerDeposit} helperText={errors.buyerDeposit} className={classes.textfld} required onChange={setEnqueryState} type="number" name="buyerDeposit" label="Buyer Deposit in Ether"/>
      <TextField error={""!==errors.sellerRcvDeposit} helperText={errors.sellerRcvDeposit} className={classes.textfld} required onChange={setEnqueryState} type="number" name="sellerRcvDeposit" label="Seller Deposit which will release in Buyer Recieved Phase"/>
      <TextField error={""!==errors.sellerPaidDeposit} helperText={errors.sellerPaidDeposit} className={classes.textfld} required onChange={setEnqueryState} type="number" name="sellerPaidDeposit" label="Seller Deposit which will release in settlement phase"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.close} color="primary">
            Cancel
          </Button>
          <Button onClick={onSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default FormDialog;