const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukmkwhb.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const jobCollection = client.db("jobPortal").collection("jobs");

    app.post("/postJob", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      // if(!body) {
      //     return res.status(401).send({message: "body data not find"})
      // }
      const result = await jobCollection.insertOne(body);
      res.send(result);
    });

    app.get("/allJobs/:status", async (req, res) => {
      const currentStatus = req.params.status;

      if (currentStatus == "remote" || currentStatus == "offline") {
        const result = await jobCollection
          .find({ status: currentStatus })
          .sort({ createdAt: -1 })
          .toArray();
        return res.send(result);
      } else {
        const result = await jobCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        return res.send(result);
      }
      // const result = await jobCollection.find().toArray()
      // res.send(result)
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server on running port ${port}`);
});
