import {express, cors, type MiniResponse } from "./express"

const app = express()
// app.use(cors({
    //     origin: ["https://myapp.com", "https://staging.myapp.com"],
    //     methods: ["GET", "POST"],
    //     credentials: true,
    //     maxAge: 3600,
    // }))
app.use(cors())
app.get("/",async(req:Request,res:MiniResponse)=>{
    await new Promise(r => setTimeout(r, 1000))
    res.json({ message: "Async works!" })
})
app.post('/',async(req:Request,res:MiniResponse)=>{
res.json({message:"PST is working"})
        })
app.listen(3000)
