# Digital Nomad CN API v1

> REST API for Global Mobility Open Infrastructure

## Base URL

```
https://api.digital-nomad.cn/v1
```

## Endpoints

### Health Check

```
GET /health
```

### Countries

```
GET /v1/countries                    # List all countries
GET /v1/countries?region=asia        # Filter by region
GET /v1/countries?limit=20&offset=0  # Pagination
GET /v1/countries/:id                # Get country by ID
```

### Search

```
GET /v1/search?q=thailand            # Search countries
GET /v1/search?q=泰国&lang=zh        # Search in Chinese
```

## Response Format

```json
{
  "data": {},
  "meta": {
    "version": "1.0.0",
    "total": 61,
    "limit": 20,
    "offset": 0
  }
}
```

## CORS

All endpoints support CORS:
```
Access-Control-Allow-Origin: *
```

## Deployment

```bash
cd api
npm install
npm run deploy
```
