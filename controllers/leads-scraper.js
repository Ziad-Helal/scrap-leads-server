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
  let c = 1;
  let { meta, data } = await sendScrappingRequest(url, response, params, c);
  c++;

  while (meta.has_more_pages) {
    const { meta: currentMeta, data: currnetData } = await sendScrappingRequest(
      url,
      response,
      {
        ...params,
        cursor: meta.next_cursor,
      },
      c
    );
    meta = currentMeta;
    data.push(...currnetData);
    c++;
  }

  response.json({ meta, data });
}

async function sendScrappingRequest(url, response, params, c) {
  let result,
    i = 1;

  do {
    result = await axios
      .get(url, { headers, params })
      .then(({ data }) => data)
      .catch((error) => console.log(error));
    console.log(i, result.meta);
    await new Promise((resolver) => setTimeout(resolver, 200));
    i++;
  } while (result.meta.status != "completed");
  console.log(
    `${c * 50} / ${result.meta.count}\n${
      result.meta.count - c * 50
    } remaining...`
  );

  return result;
}
