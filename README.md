# dcli - DynamoDB CLI Tool

A simple command-line tool to interact with DynamoDB tables.

You can use it to find, get, delete, or clear items from your tables. Useful for development and maintenance.

## Features

- Find all items by partition key
- Get a single item by partition and sort key
- Delete a single item by partition and sort key
- Delete all items with a specific partition key (truncate model)
- Output results as JSON

## Usage

```
Usage: dcli <tableName> <mode> <pk> [sk]

  tableName   DynamoDB table name (e.g., my-table)
  mode        One of: find, get, delete, truncate
  pk          Partition key (e.g., "users")
  sk          Sort key (only required for get/delete)

Examples:
  dcli my-table find users
  dcli my-table get users user:01ABCD...
  dcli my-table delete users user:01XYZ...
  dcli my-table truncate users
```

## Setup

This CLI uses your local AWS credentials. Make sure you have a valid AWS profile configured.

```
export AWS_PROFILE=your-profile-name
```

## Installation

```bash
npm install -g @nivincp/dcli
# or run directly without installing:
npx @nivincp/dcli
```
