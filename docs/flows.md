---
sidebar_position: 2
---

# Flows

## List Flows

Retrieves a list of available flows.

```http
GET /flows
```

### Query Parameters

| Parameter | Type    | Description                                                                        |
|-----------|---------|------------------------------------------------------------------------------------|
| full      | boolean | When set to `true`, includes full preference details for each flow. Default is `true`. |

### Response

The response is an array of flow objects. Each flow object contains:

```json
{
  "id": "string",
  "description": "string",
  "preferences": {
    "parameter_name": {
      "default_value": "value",
      "description": "string",
      "available_values": ["value1", "value2"],  // Optional
      "type": "string"  // Can be "string", "integer", etc.
    },
    // ... other parameters
  }
}
```

The `preferences` object can vary between flows. It may include parameters such as:
- `index_name`: The index to use for searches
- `embedding_model`: The embedding model to use
- `retrieval_type`: The type of search (e.g., semantic or hybrid)
- `k`: Number of nearest neighbors to retrieve
- `response_length_min` and `response_length_max`: Minimum and maximum response lengths
- And others, depending on the specific flow


## Get Flow Preferences

Retrieves preferences for a specific flow.

```http
GET /flows/{flow_id}/preferences
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| flow_id | string | The ID of the flow |

### Response

The response is a JSON object containing the preferences for the specified flow:

```json
{
  "parameter_name": {
    "default_value": "value",
    "description": "string",
    "available_values": ["value1", "value2"],  // Optional
    "type": "string"  // Can be "string", "integer", etc.
  },
  // ... other parameters
}
```

The structure of preferences can vary between flows, as shown in the List Flows response.


## Run Flow

Executes a specific flow.

```http
POST /flows/run
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| keep | boolean | When set to `true`, saves the flow execution in history. Default is `true`. |

### Request Body

```json
{
  "flow_id": "string",
  "question": "string",
  "preferences": {
    // Flow-specific preferences, as described in the flow's preferences
  },
  "chat_id": "string"  // Optional
}
```

### Response

```json
{
  "chat_id": "string",
  "response_text": "string",
  "allow_reply": boolean,
  "retrieval_results": [
    {
      "id": "string",
      "document_id": integer,
      "date": "string",
      "title": "string",
      "link": "string",
      "description": "string",
      "score": number
    }
  ],
  "payload": {},
  "trace": {},
  "stats": []
}
```

- `chat_id`: A unique identifier for the chat session.
- `response_text`: The main text response from the flow.
- `allow_reply`: Indicates if further replies are allowed in this flow.
- `retrieval_results`: An array of relevant documents or search results.
- `payload`: Additional data returned by the flow.
- `trace`: Debugging information (if available).
- `stats`: Performance statistics for the flow execution.
