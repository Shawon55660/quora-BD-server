require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3000
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');

//mideware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.DATABASE_PASSWORD}@cluster0.u5q3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;







// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
  } finally {
   
  }
}
run().catch(console.dir);

//test 
app.get('/',(req,res)=>{
    res.send('hello i am from quora server.....................')
})

app.listen(port,()=> console.log(`server running on ${port}` ))