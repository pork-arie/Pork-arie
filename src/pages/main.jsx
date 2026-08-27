import { useState } from "react";

function Main(){
   const [lod,setLod] = useState(false)

   const handleL = () => {
    setLod(true)
    setTimeout(() => {setLod(false);
      alert("done")},2000)
   }
    return(
        <>
        <div  style={{
        position: "relative",
        minHeight: "100vh",
        background: "white",
        padding: "40px",
      }}>


       <h2>main screen</h2>

      </div>
      <div>
    <button onClick={handleL} disabled={lod}>{lod ? "loading":"submit"}</button>
      {lod && <p>loading pleese wait</p>}
      </div>
        
        </>
    )
}

export default Main;