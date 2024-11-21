# Simple Ticket Checkout

This is a simple ticket checkout system to pay with SATS.

It use Lightning Network to pay tickets, NOSTR to comunication, Sendy to mailing
service and SQLite to database.

# Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Endpoints](#endpoints)
   - [Create a new order](#create-a-new-order)
   - [Create invite tickets](#create-invite-tickets)
   - [Claim ticket](#claim-ticket)
   - [Get tickets](#get-tickets)
   - [Check In ticket](#check-in-ticket)

# Getting Started

1. Copy the `.env.example` file to `.env` and fill in the required values.

```bash
cp .env.example .env
```

2. Install dependencies

```bash
pnmp install
```

3. Use the correct node version

```bash
nvm use
```

4. Create database

```bash
pnpm prisma migrate dev --init
```

5. Start the server

```bash
pnpm dev
```

# Endpoints

## Create a new order

> Order is a collection of tickets with information about the payment. (Can contain one or more tickets)

`your_ticketing_domain/api/ticket/request`

- Validate the request with zod
- Validate zap receipt
- Create user in the database (If the email is not already in the database)
- Create a new ticket in the database
- Add email to Sendy list (If is subscribed to newsletter)

### Parameters:

```json
{
  "fullname": <string>,
  "email": <string>,
  "ticketQuantity": <number>,
  "totalMiliSats": <number>,
  "newsletter": <boolean>,
  "code": <string, optional, discount code>
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
		"pr": <string, invoice to pay>,
		"verify": <string, url to verify the payment (LUD-21)>,
		"eveventReferenceId": <64-character lowercase hex value, tag e of zap request>
	}
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <array of json objects, each one object describe one error>
}
```

## Create invite tickets

> Create tickets without payment, for admin use.

`your_ticketing_domain/api/admin/invite`

- Validate the request with zod
- Validate if you are an authorized admin
- Create tickets in the database
- Send email with the ticket information

### Parameters:

```json
{
    "authEvent": <json object>,
}
```

Auth Event:

> Nostr Event signed with your SIGNER_PRIVATE_KEY

```json
{
  "id": <32-bytes lowercase hex-encoded sha256 of the serialized event data>,
  "pubkey": <32-bytes lowercase hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": 27243,
  "tags": [],
  "content": <string>,
  "sig":  <64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data>
}
```

Content:

> Stringified json with the action and the list of emails and fullname.

```json
{
    "action": <string, "add" or "remove">,
    "list": <array of arrays, [[fullname, email], ...]>
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
		"message": <string>
	}
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <string>
}
```

## Claim ticket

> Ticket is a single ticket for an event, only emmit when the order is paid.

`your_ticketing_domain/api/ticket/claim`

- Validate the request with zod
- Validate zap receipt and zap request
- Update database to mark the ticket as paid
- Send email with the ticket information

### Parameters:

```json
{
    "fullname": <string>,
    "email": <string>,
    "zapReceipt": <json object zap receipt nostr eveventReferenceId>,
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
		"claim": <boolean>
	}
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <array of json objects, each one object describe one error>
}
```

## Get tickets

> Get all tickets with your filter.

`your_ticketing_domain/api/ticket/tickets`

- Validate the request with zod
- Validate if you are an authorized admin
- Get all tickets with your filter

### Parameters:

```json
{
    "authEvent": <json object>,
}
```

Auth Event:

> Nostr Event signed with your ADMIN_PRIVATE_KEY

```json
{
  "id": <32-bytes lowercase hex-encoded sha256 of the serialized event data>,
  "pubkey": <32-bytes lowercase hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": 27242,
  "tags": [],
  "content": <string>,
  "sig":  <64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data>
}
```

Content (filter):

```json
{
  "limit": <number, 0 for all or specify te quantity>,
  "checked_in": <boolean, optional, not passed means both>
  "ticket_id": <string, optional, not passed means all orders>
  "email":  <string, optional, not passed means all orders>
}
```

> You can combine that you prefer. ei. all orders checked in of X email, only
> order with X ticket ID.

### Response:

#### Valid

Data is an array of objects with order information.

```json
{
	"status": <boolean>,
	"data": [
		{
			"user": {
				"fullname": <string>,
				"email": <string>
			},
			"ticketId": <string>,
			"checkIn": <boolean>
		},
		...
	]
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <string>
}
```

## Check In ticket

> Check in the ticket with the ticket ID.

`your_ticketing_domain/api/ticket/checkin`

- Validate the request with zod
- Validate if you are an authorized admin
- Check ticket and flag if it was already checked in

### Parameters:

```json
{
    "authEvent": <json object>,
}
```

Auth Event:

> Nostr Event signed with your ADMIN_PRIVATE_KEY

```json
{
  "id": <32-bytes lowercase hex-encoded sha256 of the serialized event data>,
  "pubkey": <32-bytes lowercase hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": 27242,
  "tags": [],
  "content": <string>,
  "sig":  <64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data>
}
```

Content:

```json
{
  "ticket_id": <string>,
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
    "alreadyCheckedIn": <boolean, true if the order already checked>,
    "checkIn": <boolean>
  }
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <string>
}
```

## Admin login

> Validate if the user is an admin and access the admin panel.

`your_ticketing_domain/api/admin/login`

- Validate the public key

### Parameters:

```json
{
  "publicKey": <string, 32-bytes lowercase hex-encoded public key>
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
    "message": <string>
  }
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <string>
}
```
