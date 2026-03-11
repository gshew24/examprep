import express from "express"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"

dotenv.config()

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static("public"))

const client = new MongoClient(process.env.MONGO_URI)

await client.connect()

const db = client.db("examprep")
const notes = db.collection("notes")

app.get("/api/health",(req,res)=>{
 res.json({status:"healthy"})
})

app.get("/api/notes", async (req,res)=>{

 const data = await notes
   .find({})
   .sort({timestamp:-1})
   .toArray()

 res.json(data)

})

app.post("/api/notes", async (req,res)=>{

 const result = await notes.insertOne({
   ...req.body,
   timestamp: new Date()
 })

 res.json({
   message:"Note saved",
   id: result.insertedId
 })

})

app.put("/api/notes/:id", async (req,res)=>{

 await notes.updateOne(
   {_id:new ObjectId(req.params.id)},
   {$set:req.body}
 )

 res.json({message:"Updated"})

})

app.delete("/api/notes/:id", async (req,res)=>{

 await notes.deleteOne({
   _id:new ObjectId(req.params.id)
 })

 res.json({message:"Deleted"})

})

app.listen(PORT, ()=>{
 console.log(`Server running on port ${PORT}`)
})
