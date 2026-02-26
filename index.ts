import express,{ type MiniResponse } from "./express"

const app = express()
app.get("/",(req:Request,res:MiniResponse)=>{
    res.set("X-Test", "123")   
    res.set({ A: "1", B: "2"})
    res.status(201).send({hello:"Hello bun js"})
})
app.listen(3000)
