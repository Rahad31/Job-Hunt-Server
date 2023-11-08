const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// midleware
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.64k1q4w.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCollection = client.db("jobDB").collection("job");
    const appjobCollection = client.db("appjobDB").collection("appjob");

    app.post("/job", async (req, res) => {
      const jobdetail = req.body;
      console.log(jobdetail);
      const result = await jobCollection.insertOne(jobdetail);
      res.send(result);
    });

    app.get("/job", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // update
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.put("/job/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const upjob = req.body;
      const job = {
        $set: {
          image: upjob.image,
          name: upjob.name,
          username: upjob.username,
          type: upjob.type,
          price: upjob.price,
          description: upjob.description,
          pdate: upjob.pdate,
          ddate: upjob.ddate,
          applicant: upjob.applicant,
        },
      };
      const result = await jobCollection.updateOne(filter, job, options);
      res.send(result);
    });

    //Applied job
    app.post("/appjob", async (req, res) => {
      const jobdetail = req.body;
      console.log(jobdetail);
      const result = await appjobCollection.insertOne(jobdetail);
      res.send(result);
    });

    app.get("/appjob", async (req, res) => {
      const cursor = appjobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get("/job/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await jobCollection.findOne(query);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Home page running");
});

app.listen(port, () => {});
