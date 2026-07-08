import { jsonResponse } from '../index';
import countriesData from '../../../datasets/countries.json';

interface Country {
  id: string;
  iso: { alpha2: string; alpha3: string };
  name: { zh: string; en: string };
  region: string;
  coordinates: { latitude: number; longitude: number };
  color: string;
  info: Record<string, any>;
  status: string;
  metadata: any;
}

const countries: Country[] = countriesData as Country[];

// GraphQL Schema (string)
export const typeDefs = `
  type Query {
    countries(region: String, limit: Int, offset: Int): CountryConnection!
    country(id: ID!): Country
    search(query: String!, lang: String, limit: Int): CountryConnection!
  }

  type CountryConnection {
    data: [Country!]!
    meta: Meta!
  }

  type Country {
    id: ID!
    iso: ISO!
    name: LocalizedName!
    region: String!
    coordinates: Coordinates!
    color: String!
    status: String!
    metadata: Metadata!
  }

  type ISO {
    alpha2: String!
    alpha3: String!
  }

  type LocalizedName {
    zh: String!
    en: String!
  }

  type Coordinates {
    latitude: Float!
    longitude: Float!
  }

  type Metadata {
    version: String!
    lastUpdated: String!
    dataQuality: DataQuality!
  }

  type DataQuality {
    completeness: Int!
    accuracy: Int!
    freshness: Int!
  }

  type Meta {
    version: String!
    total: Int
    limit: Int
    offset: Int
    hasMore: Boolean
  }
`;

// Resolvers
export const resolvers = {
  Query: {
    countries: (_: any, args: { region?: string; limit?: number; offset?: number }) => {
      let result = countries;
      
      if (args.region) {
        result = result.filter(c => c.region === args.region);
      }
      
      const total = result.length;
      const limit = args.limit || 100;
      const offset = args.offset || 0;
      result = result.slice(offset, offset + limit);
      
      return {
        data: result,
        meta: {
          version: '1.0.0',
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    },
    
    country: (_: any, args: { id: string }) => {
      return countries.find(c => c.id === args.id) || null;
    },
    
    search: (_: any, args: { query: string; lang?: string; limit?: number }) => {
      const query = args.query.toLowerCase();
      const lang = args.lang || 'zh';
      const limit = args.limit || 10;
      
      const result = countries.filter(c => {
        const nameField = lang === 'en' ? c.name.en : c.name.zh;
        return c.id.includes(query) || 
               nameField.toLowerCase().includes(query) ||
               c.region.includes(query);
      }).slice(0, limit);
      
      return {
        data: result,
        meta: {
          version: '1.0.0',
          total: result.length,
          limit,
          query: args.query
        }
      };
    }
  }
};
