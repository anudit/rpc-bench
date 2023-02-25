# RPC Benchmark Setup

## Setup Test Data

Head to [https://console.cloud.google.com/bigquery](https://console.cloud.google.com/bigquery) and get some addresses to test.

```sql
-- The code checks if the balance is > 0 so make sure to keep eth_balance atleast > 0
SELECT * FROM `bigquery-public-data.crypto_ethereum.balances`  WHERE eth_balance > 1000000000000000000 LIMIT 1000
```

Save it to `testdata.json`

## Setup Config

Setup the `config.json` as follows,

```json
{
    "provider1": "https://example-rpc.com",
    "provider2": "https://rpc.omnid.space",
}
```

Save it to `config.json`

## Run it

1. Install Dependencies
```bash
npm i
# or
yarn i
# or
pnpm i
```

2. Run it
```bash
npm bench
# or
yarn bench
# or
pnpm bench
```

## Advanced Usage

```
node ./rpc-bench.js bench -c config.json -t testdata.json
```

