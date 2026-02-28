import express,{ type MiniResponse } from "./express"

const app = express()
app.get("/",async(req:Request,res:MiniResponse)=>{
    await new Promise(r => setTimeout(r, 1000))
    res.json({ message: "Async works!" })
})
app.post('/',async(req:Request,res:MiniResponse)=>{
res.json({message:"POST is working"})
        })
app.listen(3000)
