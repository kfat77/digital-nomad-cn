# @digital-nomad-cn/sdk

> JavaScript/TypeScript SDK for Digital Nomad CN Global Mobility API

## Install

```bash
npm install @digital-nomad-cn/sdk
```

## Usage

```typescript
import { NomadClient } from '@digital-nomad-cn/sdk';

const client = new NomadClient();

// List all countries
const { data: countries } = await client.listCountries();

// Get a specific country
const { data: thailand } = await client.getCountry('thailand');

// Search
const { data: results } = await client.search('泰国');

// Filter by region
const { data: asianCountries } = await client.listCountries({ region: 'southeast-asia' });
```

## API

### `new NomadClient(options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | `https://api.digital-nomad.cn` | API base URL |
| `apiKey` | `string` | - | API key (if required) |
| `timeout` | `number` | `30000` | Request timeout (ms) |

### Methods

| Method | Description |
|--------|-------------|
| `listCountries(options?)` | List all countries with optional filtering |
| `getCountry(id)` | Get country by ID |
| `search(query, options?)` | Search countries |
| `health()` | Check API health |

## License

MIT
