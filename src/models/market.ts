import lodash from 'lodash';

export interface Currency {
  code?: string;
  name?: string;
  symbol?: string;
}

export const CURRENCIES_LIST: Currency[] = [
  {
    code: "usd",
    name: "Dolar",
    symbol: "$",
  },
  {
    code: "btc",
    name: "Bitcoin",
    symbol: "Ƀ",
  },
];

export class MarketCurrency implements Currency {
  code: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume: number;

  fromCurrency(currency: Currency) {
    this.code = currency.code;
    this.name = currency.name;
    this.symbol = currency.symbol;
  }
}

export class MarketInfo {
  category: string;
  identifier: string;
  name: string;
  position: number;
  symbol: string;
}

export class MarketTicker {
  date: Date;
  timestamp: number;
  change1h: number;
  change7d: number;
  change24h: number;
  info: MarketInfo;
  market: MarketCurrency[];

  constructor(data?: any) {
    if (!data) return;

    let self: any = this;

    for (let prop in data) {
      self[prop] = data[prop];
    }

    return self;
  }

  getCurrency(query: Currency) {
    return lodash.find(this.market, query);
  }

  deserialize(input: any): MarketTicker {
    let self: any = this;
    if (!input || !lodash.isObject(input)) return;

    let inputMarket = input.markets ? input.markets[0] : input;

    self.timestamp = input.timestamp;
    self.date = new Date(input.timestamp * 1000);
    self.change1h = inputMarket.change1h || null;
    self.change7d = inputMarket.change7d || null;
    self.change24h = inputMarket.change24h || null;

    self.info = {
      category: inputMarket.category,
      identifier: inputMarket.identifier,
      name: inputMarket.name,
      position: inputMarket.position,
      symbol: inputMarket.symbol,
    }

    let currencies: MarketCurrency[] = [];

    for (let currency of CURRENCIES_LIST) {
      let marketCurrency: MarketCurrency = new MarketCurrency();
      marketCurrency.fromCurrency(currency);

      marketCurrency.price = inputMarket.price ? inputMarket.price[currency.code] : 0.0;
      marketCurrency.marketCap = inputMarket.marketCap ? inputMarket.marketCap[currency.code] : 0.0;
      marketCurrency.volume = inputMarket.volume24 ? inputMarket.volume24[currency.code] : 0.0;

      currencies.push(marketCurrency);
    }

    self.market = currencies;

    return self;
  }
}

export class MarketHistory {
  history: any;

  deserialize(input: any): MarketHistory {
    let self: any = this;
    if (!Array.isArray(input)) return;

    let history = {};

    for (let ticker of input) {
      let obj = new MarketTicker().deserialize(ticker);
      let date = obj.date.setHours(0, 0, 0, 0);

      history[date] = obj;
    }

    self.history = history;

    return self;
  }

  findDate(date: Date): MarketTicker {
    let timestampDate = date.setHours(0, 0, 0, 0);

    return new MarketTicker(this.history[timestampDate]);
  }
}