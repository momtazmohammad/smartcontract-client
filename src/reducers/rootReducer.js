const initstate={
    enqueries:[],
    accounts:[],
    web3: null,
    contract: null
}
const rootReducer=(state=initstate,action)=>{
    switch (action.type) {
        case 'setEnqs':            
            return {...state,enqueries:action.payload}        
        case'ADD_ENQ':
            return { ...state,enqueries:[...state.enqueries,action.payload]}        
        case'setweb3':
            return { ...state,web3:action.payload}        
        case 'setAccounts':
            return {...state,accounts:action.payload}
        case 'updateEnq':
            return {...state,enqueries:action.payload}
        default:
            return state;    
}
}
export default rootReducer;