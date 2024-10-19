---
sidebar_position: 3
---

# History

## Get User History

Retrieves the chat history for the authenticated user.

```http
GET /history
```

### Response

The response is an array of `Chat` objects:

```json
[
  {
    "chat_id": "string",
    "timestamp": "string (ISO 8601 format)",
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


## Get Specific Chat

Retrieves a specific chat by its ID.

```http
GET /history/{chat_id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| chat_id | string | The ID of the chat |

Response:

The response is a single `Chat` object, with the same structure as in the Get History response.


## Submit Feedback

Submits feedback for a specific chat message.

```http
POST /history/feedback
```

### Request Body

```json
{
  "chat_id": "string",
  "message_position": "integer (optional)",
  "feedback": "string (either 'thumbs_up' or 'thumbs_down')",
  "feedback_text": "string (optional)"
}
```

### Response

```json
{
  "ok": boolean,
  "message": "string (optional)"
}
```

- If successful, `{"ok": true}` is returned.
- If unsuccessful, `{"ok": false, "message": "Failed to update feedback"}` is returned.
