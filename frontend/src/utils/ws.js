export function connectNotificationsWS(onMessage){
  const url = import.meta.env.VITE_WS_URL
  if(!url){
    // Demo timer: push a fake notification every 20s
    const id = setInterval(() => {
      onMessage({
        id: 'ws-' + Date.now(),
        title: 'New Credit Update',
        body: 'Your credits grew by +10',
        time: 'just now',
        ok: true,
        read: false,
      })
    }, 20000)
    return () => clearInterval(id)
  }
  const ws = new WebSocket(url)
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)) } catch {}
  }
  return () => ws.close()
}
