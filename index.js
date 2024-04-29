const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@expresstaskmanager.grxys5y.mongodb.net/?retryWrites=true&w=majority`;


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
    // await client.connect();
    const countryCollection = client.db("travel").collection("country");
    const spotCollection = client.db("travel").collection("spot");
    const bannerCollection = client.db("travel").collection("banner");

    // add country
    app.post("/country", async (req, res) => {
      const newCountry = req.body;
      const result = await countryCollection.insertOne(newCountry);
      res.send(result);
    });
    // get all country
    app.get("/country", async (req, res) => {
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get country by id
    app.get("/country/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await countryCollection.findOne(query);
      res.send(result);
    });
    // update country by id
    app.put("/country/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedCountry = req.body;

      const country = {
        $set: {
          country_Name: updatedCountry.country_Name,
          description: updatedCountry.description,
          image: updatedCountry.image,
          banner: updatedCountry.banner,
        },
      };

      const result = await countryCollection.updateOne(filter, country);
      res.send(result);
    });
    // delete country by id
    app.delete("/country/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await countryCollection.deleteOne(query);
      res.send(result);
    });
    // delete all country
    app.delete("/country", async (req, res) => {
      const result = await countryCollection.deleteMany();
      res.send(result);
    });

    // add banner
    app.post("/banner", async (req, res) => {
      const newBanner = req.body;
      const result = await bannerCollection.insertOne(newBanner);
      res.send(result);
    });
    // get last three banner
    app.get("/banner", async (req, res) => {
      const cursor = bannerCollection.find().sort({ _id: -1 }).limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });
    // delete all banners
    app.delete("/banner", async (req, res) => {
      const result = await bannerCollection.deleteMany();
      res.send(result);
    });

    // add spot
    app.post("/spot", async (req, res) => {
      try {
        const newSpot = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await spotCollection.insertOne(newSpot);
        res.send(result);
      } catch (e) {
        console.log(e);
      }
    });
    // get all spot
    app.get("/spots", async (req, res) => {
      let { sort } = req.query;
      let cursor = spotCollection.find();
      if (sort === "latest") {
        cursor = cursor.sort({ updatedAt: -1 });
      }
      if (sort === "oldest") {
        cursor = cursor.sort({ updatedAt: 1 });
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;
      cursor = cursor.skip(skip).limit(limit);
      const result = await cursor.toArray();
      const total = await spotCollection.countDocuments();
      res.send({ result, total });
    });
    // get all spot by user email
    app.get("/spots/user", async (req, res) => {
      const user_email = req.body.user_email;
      const query = { user_email: user_email };
      const cursor = spotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get spot by country name
    app.get("/spots/country/:country_Name", async (req, res) => {
      const country_Name = req.params.country_Name;
      const query = { country_Name: country_Name };
      const cursor = spotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get spot by id
    app.get("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    // update spot by id
    app.put("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedSpot = req.body;

      const spot = {
        $set: {
          image: updatedSpot.image,
          tourists_spot_name: updatedSpot.tourists_spot_name,
          country_Name: updatedSpot.country_Name,
          location: updatedSpot.location,
          short_description: updatedSpot.short_description,
          average_cost: updatedSpot.average_cost,
          seasonality: updatedSpot.seasonality,
          travel_time: updatedSpot.travel_time,
          totalVisitorsPerYear: updatedSpot.totalVisitorsPerYear,
          user_email: updatedSpot.user_email,
          user_name: updatedSpot.user_name,
          rating: updatedSpot.rating,
          createdAt: updatedSpot.createdAt,
          updatedAt: new Date(),
        },
      };

      const result = await spotCollection.updateOne(filter, spot);
      res.send(result);
    });
    // delete spot by id
    app.delete("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    });
  } catch (e) {
    console.error(e);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("travel is running...");
});

app.listen(port, () => {
  console.log(`travel is running... ${port}`);
});
