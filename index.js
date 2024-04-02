require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const leadsScraperRoute = require("./routes/leads-scraper");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/leads-scraper", leadsScraperRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is listining on Port: ${process.env.PORT}`);
});
