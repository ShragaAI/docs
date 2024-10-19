---
sidebar_position: 5
---

# Services

## List Services

Retrieves information about all available services.

```http
GET /services
```

### Response

The response is a JSON object containing information about the embedder and retrievers:

```json
{
  "embedder": string,
  "retriever:name": {
    "type": string,
    "test": object,
    "failure": string
  }
}
```

- `embedder`: The type of embedder being used (currently only "bedrock" is supported).
- `retriever:name`: An object for each configured retriever, where "name" is the retriever's identifier.
  - `type`: The type of the retriever ("opensearch" or "elasticsearch").
  - `test`: The result of an empty query test. This field is present only if the test was successful.
  - `failure`: If the retriever test failed, this field will contain an error message. This field is present only if an error occurred.


Example response:

```json
{
  "embedder": "bedrock",
  "retriever:opensearch": {
    "type": "opensearch",
    "test": {
      "took": 5,
      "timed_out": false,
      "_shards": {
        "total": 5,
        "successful": 5,
        "skipped": 0,
        "failed": 0
      },
      "hits": {
        "total": {
          "value": 1000,
          "relation": "eq"
        },
        "max_score": null,
        "hits": []
      }
    }
  },
  "retriever:elasticsearch": {
    "type": "elasticsearch",
    "failure": "ConnectionError: Unable to connect to Elasticsearch"
  }
}
```

#### Notes

1. For each configured retriever:
   - The API attempts to execute an empty query to test the connection.
   - If the test is successful, the `test` field will contain the result of the empty query.
   - If the test fails, the `failure` field will contain an error message, and the `test` field will be absent.
   - A retriever entry will never have both `test` and `failure` fields simultaneously.

2. The actual structure of the `test` result may vary depending on the type of retriever (OpenSearch or Elasticsearch) and its specific configuration.

3. This endpoint does not require any authentication or query parameters.