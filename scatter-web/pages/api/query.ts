import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // import fetch from 'node-fetch';
  const addresses = request.body.addresses!;

  //  Call the Dune API
  const dataResponse = await fetch(
    "https://api.dune.com/api/v1/query/1279487/execute",
    {
      method: "POST",
      headers: new Headers({
        "x-dune-api-key": process.env.DUNE_API_KEY!,
        "content-type": "application/json",
        'accept': 'application/json',
      }),
      body: JSON.stringify({
        query_parameters: {
          addresses,
        },
      }),
    }
  );
  const body = await dataResponse.json();

  response.status(200).json({
    body: body,
  });
}
