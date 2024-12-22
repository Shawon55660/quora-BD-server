require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3000
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const db = client.db('quora');
    const quoraCollections = db.collection('quoraCollections')
    const recommandCollection = db.collection('recommandCollection')


    // query data post api
    app.post('/add-query', async (req, res) => {

      const postInfo = req.body;
      const result = await quoraCollections.insertOne(postInfo)
      res.send(result)

    })

    // query all data get  api

    app.get('/all-query', async (req, res) => {
      const data = req.body;
      const search = req.query.search;
      const query = {
        productName: {
          $regex: search,
          $options: 'i'
        }
      }

      const result = await quoraCollections.find(query, data).toArray()
      res.send(result)
    })

    // myQuery data get with my email api

    app.get('/my-query', async (req, res) => {
      const email = req.query.owner_email;
      const filter = { owner_email: email }
      const result = await quoraCollections.find(filter).sort({ currentData: -1 }).toArray();
      res.send(result)


    })
    // delete data form my-query api
    app.delete('/query-delete/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await quoraCollections.deleteOne(filter)
      res.send(result)
    })

    //get data by _id api

    app.get('/query/details/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await quoraCollections.findOne(filter)
      res.send(result)
    })

    // update data by patch api

    app.patch('/query-update/:id', async (req, res) => {
      const id = req.params.id;
      const currentData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateData = {
        $set: currentData
      }
      const options = {
        upsert: true
      }
      const result = await quoraCollections.updateOne(filter, updateData, options)
      res.send(result)
    })

    //recommanded api start

    // post recommaned api
    app.post('/recommanded', async (req, res) => {
      const recInfo = req.body;

      const filter = { recommender_email: recInfo.recommender_email, recommand_id: recInfo.recommand_id }
      const alreadyExist = await recommandCollection.findOne(filter);
      if (alreadyExist) return res.send('You have already placed a bid on this job!')
      const result = await recommandCollection.insertOne(recInfo);
      res.send(result)

      const query = { _id: new ObjectId(recInfo.recommand_id) };
      const update = {
        $inc: { recommendationCount: 1 }
      }

      await quoraCollections.updateOne(query, update)


    })

    // my recommendation get by recommand_email API
    app.get('/my-recommendation', async (req, res) => {
      const email = req.query.recommender_email;
      const query = { recommender_email: email };
      const result = await recommandCollection.find(query).toArray()
      res.send(result)
    })
    // my recommendation delete by id  API
    app.delete('/my-recommendation/:id', async (req, res) => {
      // const recInfo = req.body
      const id = req.params.id;
      
      
      const filter = { recommand_id: id };
      const result = await recommandCollection.deleteOne(filter)
      if (result.deletedCount > 0) {
        
        console.log(id)
      
        const query = { _id: new ObjectId(id) };
        const update = {
          $inc: { recommendationCount: -1 }
        }

        await quoraCollections.updateOne(query, update)

      }
      res.send(result)

    })

    //  recommendation for me get by recommand_email API
    app.get('/recommendation-for-me', async (req, res) => {
      const email = req.query.owner_email;
      const query = { owner_email: email };
      const result = await recommandCollection.find(query).toArray()
      res.send(result)
    })

  } finally {

  }
}
run().catch(console.dir);

//test 
app.get('/', (req, res) => {
  res.send('hello i am from quora server.....................')
})

app.listen(port, () => console.log(`server running on ${port}`))