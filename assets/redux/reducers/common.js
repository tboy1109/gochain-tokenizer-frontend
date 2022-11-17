import { CHANGE_WALLET, SHOW_TOAST, HIDE_TOAST, START_ACTION, END_ACTION } from "../../constants/actionTypes/index.js";

const INITIAL_STATE = {
  walletAddress: '',
  showToast: false,
  header: '',
  message: '',
  loading: false
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CHANGE_WALLET:
      return {
        ...state,
        walletAddress: action.wallet
      }
    case SHOW_TOAST:
      return {
        ...state,
        showToast: true,
        header: action.header,
        message: action.message
      }
    case HIDE_TOAST:
      return {
        ...state,
        showToast: false
      }
    case START_ACTION:
      return {
        ...state,
        loading: true
      }
    case END_ACTION:
      return {
        ...state,
        loading: false
      }
    default:
      return state;
  }
};

export default reducer