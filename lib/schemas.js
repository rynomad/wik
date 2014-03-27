var schema = {
  "indexes": {
  },
  "types": {
    "wik": {
      "type": "wik",
      "name": "wik",
      "properties": {
        "uri": "string",
        "title": "string",
        "steward": "steward",
        "story": "array",
        "journal": "array"
      }
    },
    "steward": {
      "type": "steward",
      "name": "steward",
      "properties": {
        "hashName": "string",
        "wiks": ["array", "wik"]
      }
    },
    "thread": {
      "type": "thread",
      "name": "thread",
      "properties": {
        "uri": "string",
        "type": "string",
        "steward": "steward"
      }
    },
    "patch": {
      "type": "patch",
      "name": "patch",
      "properties": {
        "uri": "string",
        "thread": "string",
        "operation": "string",
        "arguments": "array",
        "author": "steward"
      }
    }
  }
};

module.exports = schema
