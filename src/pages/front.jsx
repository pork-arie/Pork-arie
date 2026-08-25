


function Front({progress}){
 return(
    <>
    <section className="front"style={{
        opacity: 1 - progress,
        pointerEvents: progress === 1 ? "none" : "auto",
      }}
    >
    <h2>front</h2>
    </section>
    
    </>
 )
}

export default Front;