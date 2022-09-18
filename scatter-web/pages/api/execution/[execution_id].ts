import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // import fetch from 'node-fetch';
  const execution_id = request.query.execution_id;

  //  Call the Dune API
  const dataResponse = await fetch(
    `https://api.dune.com/api/v1/execution/${execution_id}/results`,
    {
      method: "GET",
      headers: new Headers({
        "x-dune-api-key": process.env.DUNE_API_KEY!,
        "content-type": "application/json",
      }),
    }
  );
  const body = await dataResponse.json();

  response.status(200).json({
    body: body,
  });
}
