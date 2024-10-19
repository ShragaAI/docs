---
sidebar_position: 4
---

# Analytics

## Get Analytics

Retrieves analytics data based on the specified time range.

```http
POST /analytics
```

### Request Body

```json
{
  "start": "string (optional, date format: YYYY-MM-DDTHH:mm:ssZ)",
  "end": "string (optional, date format: YYYY-MM-DDTHH:mm:ssZ)"
}
```

Both `start` and `end` are optional. If provided, they filter the analytics data to the specified time range.

Example:
```json
{
  "start": "2024-03-01T00:00:00Z",
  "end": "2024-03-31T23:59:59Z"
}
```

### Response:

The response is a JSON object containing analytics data:

```json
{
  "steps": {},
  "feedback": {}
}
```

## Get Chat History

Retrieves chat history data for analytical purposes.

```http
GET /analytics/chat-history
```

### Query Parameters

| Parameter | Type   | Description                                             |
|-----------|--------|---------------------------------------------------------|
| start     | string | Start date for filtering (format: YYYY-MM-DDTHH:mm:ssZ) |
| end       | string | End date for filtering (format: YYYY-MM-DDTHH:mm:ssZ)   |

Both parameters are optional. If provided, they filter the chat history to the specified time range.

Example usage:
```
GET /analytics/chat-history?start=2024-03-01T00:00:00Z&end=2024-03-31T23:59:59Z
```

### Response:

The response is an array of `Chat` objects, similar to the History API:

```json
[
  {
    "chat_id": "string",
    "timestamp": "string (format: YYYY-MM-DDTHH:mm:ssZ)",
    "messages": [
      {
        "position": integer,
        "text": "string",
        "feedback": "string (optional)",
        "feedback_text": "string (optional)"
      }
    ],
    "user_id": "string (optional)",
    "retrieval_results": [
      {
        "id": "string (optional)",
        "document_id": "integer (optional)",
        "date": "string (optional)",
        "title": "string (optional)",
        "link": "string (optional)",
        "description": "string (optional)",
        "score": "number (optional)"
      }
    ],
    "payload": {},
    "step_stats": [
      {
        "step": "string (optional)",
        "input_tokens": "integer (optional)",
        "output_tokens": "integer (optional)",
        "latency": "integer (optional)"
      }
    ],
    "total_stats": {
      "input_tokens": "integer (optional)",
      "output_tokens": "integer (optional)",
      "latency": "integer (optional)"
    }
  }
]
```