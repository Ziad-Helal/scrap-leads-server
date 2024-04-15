const axios = require("axios");
const baseUrl = "https://scrap.io/api/v1/";
const headers = {
  Authorization: `Bearer ${process.env.API_KEY}`,
};

exports.getSubscriptionInfo = async (_, response) => {
  await sendRequest("subscription", response);
};

exports.getPlaceTypes = async (request, response) => {
  await sendRequest("gmap/types", response, request.query);
};

exports.getGeoLocations = async (request, response) => {
  await sendRequest("gmap/locations", response, request.query);
};

exports.getOnePlace = async (request, response) => {
  await sendMultiRequests("gmap/place", response, request.query);
};

exports.getAllPlaces = async (request, response) => {
  await sendMultiRequests("gmap/search", response, request.query);
};

function sendRequest(endPoint, response, params) {
  const url = baseUrl + endPoint;
  return axios
    .get(url, { headers, params })
    .then(({ data }) => response.json(data))
    .catch((error) => response.json(error));
}

async function sendMultiRequests(endPoint, response, params) {
  const url = baseUrl + endPoint;
  let results,
    meta,
    data = [],
    status,
    cursor;

  do {
    const result = await axios
      .get(url, { headers, params })
      .then(({ data }) => data)
      .catch((error) => response.json(error));
    status = result.meta.status;
    if (status != "updating") {
      results = result;
      break;
    }
    await new Promise((resolver) => setTimeout(resolver, 5000));
  } while (status == "updating");

  if (results.meta.has_more_pages && params.skip_data != 1) {
    cursor = results.meta.next_cursor;
    data = results.data;
    do {
      const result = await axios
        .get(url, {
          headers,
          params: { ...params, cursor },
        })
        .then(({ data }) => data)
        .catch((error) => response.json(error));
      meta = result.meta;
      data.push(...result.data);
      cursor = meta.next_cursor;
    } while (cursor);
    response.json({ meta, data });
  } else response.json(results);
}
