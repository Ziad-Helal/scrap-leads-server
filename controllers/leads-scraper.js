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
  let { meta, data } = await sendScrappingRequest(
    url,
    response,
    {
      ...params,
      cursor:
        "eyJnbWFwX3BsYWNlX2lkIjo0NjU3NTM0MiwiX3BvaW50c1RvTmV4dEl0ZW1zIjp0cnVlfQ",
    },
    c
  );

  while (meta.has_more_pages && c < 100) {
    c++;
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
  }

  response.json({ meta, data });
}

async function sendScrappingRequest(url, response, params, counter) {
  let result,
    c = 1;

  do {
    result = await axios
      .get(url, { headers, params })
      .then(({ data }) => data)
      .catch((error) => response.json(error));
    console.log(c, result.meta);
    await new Promise((resolver) => setTimeout(resolver, 10000));
    c++;
  } while (result.meta.status != "completed");
  console.log(
    `${counter * result.meta.per_page + 17500} / ${result.meta.count}\n${
      result.meta.count - counter * result.meta.per_page - 17500
    } remaining...`
  );

  return result;
}
