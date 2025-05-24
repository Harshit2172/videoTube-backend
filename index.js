import connectDB from "./db/index.js"
import dotenv from "dotenv"
import {app} from "./app.js"

dotenv.config({ path:"./.env"})

console.log("MY Name is Harshit");



connectDB().then(()=>{

    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port :${process.env.PORT}`);
        
    }),
    app.get("/",(req,res)=>{
        res.send("Hello from server");
    })
}).catch((err)=>{
    console.log("MONGO DB connection Failed!!!",err);
    
})
