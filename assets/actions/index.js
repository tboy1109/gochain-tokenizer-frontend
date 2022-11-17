import { CHANGE_WALLET, HIDE_TOAST, SHOW_TOAST, START_ACTION, END_ACTION } from '../constants/actionTypes/index.js'

export const changeWallet = wallet => {
  return {
    type: CHANGE_WALLET,
    wallet
  }
}

export const showToast = (header, message) => {
  return {
    type: SHOW_TOAST,
    header,
    message
  }
}

export const hideToast = () => {
  return {
    type: HIDE_TOAST,
  }
}

export const startAction = () => {
  return {
    type: START_ACTION
  }
}

export const endAction = () => {
  return {
    type: END_ACTION
  }
}