const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

app.use(express.json());
require("dotenv").config();
app.use(
  cors({
    origin: [
      'http://localhost:5173',
    
    ],
    credentials: true,
  })
);

app.use(cookieParser());
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

// middlewares 
const logger = (req, res, next) =>{
    console.log('log: info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) =>{
    const token = req?.cookies?.token;
    // console.log('token in the middleware', token);
    // no token available 
    if(!token){
        return res.status(401).send({message: 'unauthorized access'})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err){
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.user = decoded;
        next();
    })
}

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

    app.get("/job", logger,verifyToken,async (req, res) => {
        if (req.user.email !== req.query.email) {
          return res.status(403).send({ message: "forbidden access" });
        }
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
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
    app.get("/job/:id", logger, verifyToken, async (req, res) => {
      
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

    app.get("/appjob", logger, verifyToken, async (req, res) => {
        if (req.user.email !== req.query.email) {
          return res.status(403).send({ message: "forbidden access" });
        }
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
      const cursor = appjobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // auth related api
    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });
    
      app.post("/logout", async (req, res) => {
        const user = req.body;
        console.log("logging out", user);
        res.clearCookie("token", { maxAge: 0 }).send({ success: true });
      });

    // app.get("/appjob", async (req, res) => {
    //   const cursor = appjobCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

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
