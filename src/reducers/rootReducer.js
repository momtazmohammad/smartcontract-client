const initstate={
    enqueries:[],
    account:"",
    contract:null,
    web3: null
}
const rootReducer=(state=initstate,action)=>{    
    switch (action.type) {
        case 'setEnqs':            
            return {...state,enqueries:action.payload}        
        case'ADD_ENQ':
            return { ...state,enqueries:[...state.enqueries,action.payload]}        
        case'setWeb3':
            return { ...state,web3:action.payload}        
        case 'setAccount':
            return {...state,account:action.payload}
        case 'setContract':
            return {...state,contract:action.payload}
        case 'updateEnq':
            console.log(action.payload);
            return {...state,enqueries:action.payload}
        default:
            return state;    
}
}
export default rootReducer;