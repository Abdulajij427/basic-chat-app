import { useState  , useEffect , useRef } from 'react'



import './App.css'

function App() {
  const [message , setMessage] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [input , setInput] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null)
  
  
  useEffect(()=>{

    


    if(wsRef.current) return;
    
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event)=>{
      //@ts-ignore
      setMessage(m => [...m, event.data])
    }
    wsRef.current = ws;

    ws.onopen = ()=>{
      ws.send(JSON.stringify({
        type: "join",
        payload: {
          roomId: "purple"
        }
      }))
    }
    return ()=>{
      ws.close();
      wsRef.current = null;
    }
  },[]);


  const sendMessage = () => {
  
    if(input.trim() === "") return;
    
    
    if(wsRef.current?.readyState === WebSocket.OPEN){
      wsRef.current?.send(
        JSON.stringify({
          type:"chat",
          payload: {
            message: input,
          },
        })
      );
    setInput("");

    inputRef.current?.focus();
    }else{
      console.log("websocket is not connected");
    }
  };


  return (
    
    <div className='h-screen bg-black '>
      <div className="h-[85vh] ">
          
        {message.map((msg , index)=>(  <div key={index} className="p-4"><span key={index} className='text-black bg-white rounded p-4 m-8'>{msg}</span></div>))} 
      </div> 
      <div className='w-full bg-white flex p-4'>
        <input ref={inputRef} 
               value = {input}
               onChange={(e)=> setInput(e.target.value)}
                 className="flex-1 p-4" ></input>
        <button  
          onClick={
            sendMessage
          }
         className='bg-purple-600 text-white p-4'>Send message</button>
      </div>  


    </div>
    
  )
}

export default App



