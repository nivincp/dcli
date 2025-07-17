# dcli - DynamoDB CLI Tool

A simple command-line tool to interact with DynamoDB tables.

You can use it to find, get, delete, or clear items from your tables. Useful for development and maintenance.

## Features

- Find all items by partition key
- Get a single item by partition and sort key
- Delete a single item by partition and sort key
- Delete all items with a specific partition key (truncate model)
- Output results as JSON

## Installation

```bash
npm install -g dcli
# or run directly without installing:
npx dcli
```
