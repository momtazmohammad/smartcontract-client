const initstate={
    enqueries:[],
    account:"",
    web3: null,
    contract: null
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
        case 'updateEnq':
            return {...state,enqueries:action.payload}
        default:
            return state;    
}
}
export default rootReducer;