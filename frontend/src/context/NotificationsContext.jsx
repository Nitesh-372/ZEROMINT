import React, { createContext, useContext, useReducer, useMemo } from 'react'

const Ctx = createContext(null)

function reducer(state, action){
  switch(action.type){
    case 'SET_ALL':
      return { ...state, list: action.list }
    case 'ADD':
      return { ...state, list: [action.item, ...state.list] }
    case 'MARK_READ':
      return { ...state, list: state.list.map(n => n.id === action.id ? {...n, read:true} : n) }
    case 'MARK_ALL_READ':
      return { ...state, list: state.list.map(n => ({...n, read:true})) }
    default:
      return state
  }
}

export function NotificationsProvider({ children, initial=[] }){
  const [state, dispatch] = useReducer(reducer, { list: initial })
  const unread = useMemo(() => state.list.filter(n => !n.read).length, [state.list])

  const api = {
    list: state.list,
    unread,
    setAll: (list) => dispatch({ type:'SET_ALL', list }),
    add: (item) => dispatch({ type:'ADD', item }),
    markRead: (id) => dispatch({ type:'MARK_READ', id }),
    markAllRead: () => dispatch({ type:'MARK_ALL_READ' }),
  }

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useNotifications(){
  const ctx = useContext(Ctx)
  if(!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
