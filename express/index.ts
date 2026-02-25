type Handler = (req:Request,res:any) => void
export type miniResponse = {
    statusCode:number,
    status(code:number):miniResponse
    send(body:any):void
}
class Express{
    private routes:{[key:string]:Handler} ={}
    get(path:string,handler:Handler){
        this.routes[`GET:${path}`] = handler
    }
        listen(port:number){
            Bun.serve({
                port:port,
                fetch:(req)=>{
                    const key = `${req.method}:${new URL(req.url).pathname}`
                    const handler = this.routes[key]
                    if (!handler){
                       return new Response("Not found",{status:404})
                    }
                    let response:Response|null = null
                    const res:miniResponse = {
                        statusCode:200,
                        status(code:number){
                            this.statusCode = code
                            return this
                        },
                        send(body:any){
                            if (typeof body === "object"){
                                response = new Response(JSON.stringify(body),{
                                    status:this.statusCode,
                                    headers:{"Content-Type":"application/json"}
                                })
                                return
                            }
                            response = new Response(body,{
                                status:this.statusCode
                            })
                        }
                    }
                    handler(req,res)
                    return response ?? new Response("No response send")
                        
                }
            })
        console.log(`server is running on port http://localhost:${port}`)
    }
}
export default function express(){
    return new Express()
}