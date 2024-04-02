const router = require("express").Router();
const leadsScraper = require("../controllers/leads-scraper");

router.get("/subscriptionInfo", leadsScraper.getSubscriptionInfo);
router.get("/placeTypes", leadsScraper.getPlaceTypes);
router.get("/geoLocations", leadsScraper.getGeoLocations);
router.get("/onePlace", leadsScraper.getOnePlace);
router.get("/allPlaces", leadsScraper.getAllPlaces);

module.exports = router;
