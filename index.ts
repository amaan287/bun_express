import express,{ type miniResponse } from "./express"
const app = express()
app.get("/",(req:Request,res:miniResponse)=>{
    res.status(201).send({hello:"Hello bun js"})
})
app.listen(3000)
