import { readFileSync } from 'fs';
import ethers from "ethers";
import { table } from 'table';
import { getBalancesForEthereumAddress } from 'ethereum-erc20-token-balances-multicall';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { tokenList } from './tokens.js';

const tableConfig = {
  columnDefault: {
      width: 14
  },
  columns: [
      { alignment: 'center', width: 5 },
      { alignment: 'center' },
      { alignment: 'center' },
      { alignment: 'center' },
      { alignment: 'center' }
  ]
}
const tableHeader = ["Rank", "Name", "Success Rate", "Total Time", "Avg Time/req"]

// Utils

function countdown(s) {

  const d = Math.floor(s / (3600 * 24));
  s  -= d * 3600 * 24;
  const h = Math.floor(s / 3600);
  s  -= h * 3600;
  const m = Math.floor(s / 60);
  s  -= m * 60;
  const tmp = [];
  (d) && tmp.push(d + 'd');
  (d || h) && tmp.push(h + 'h');
  (d || h || m) && tmp.push(m + 'm');
  tmp.push(parseInt(s) + 's');
  return tmp.join(' ');

}

async function testRunner(name, addresses, fn, rpc){

  let total = addresses.length;
  let success = 0;
  let startTime = Date.now();

  for (let i = 0; i < addresses.length; i++) {
    const add = addresses[i];
    let resp = await fn.apply(this, [rpc, add]);

    if (resp) {
      success += 1
    }
  }

  let endTime = Date.now();

  let retData = {
    name,
    success,
    startTime,
    endTime,
    total,
    avgTime: (endTime - startTime)/total
  }

  console.log(`🟢 ${name}/${fn?.name} Test Complete.`, retData?.avgTime);

  return retData
}

async function testRunner2(name, fn, rpc){

  let total = 1;
  let success = 0;
  let startTime = Date.now();

  let resp = await fn.apply(this, [rpc]);

  if (resp) {
    success += 1
  }

  let endTime = Date.now();

  let retData = {
    name,
    success,
    startTime,
    endTime,
    total,
    avgTime: (endTime - startTime)/total
  }

  console.log(`🟢 ${name}/${fn?.name} Complete.`, retData?.avgTime);

  return retData
}

function randomPriceFeedContract(){
  let arr = [
    "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8",
  "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
  "0x139C8512Cde1778e9b9a8e721ce1aEbd4dD43587",
  "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
  "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
  "0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55",
  "0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10",
  "0x194a9AaF2e0b67c35915cD01101585A33Fe25CAa",
  "0xc355e4C0B3ff4Ed0B49EaACD55FE29B311f42976",
  "0x89c7926c7c15fD5BFDB1edcFf7E7fC8283B578F6",
  "0x8994115d287207144236c13Be5E2bDbf6357D9Fd",
  "0x7eed379bf00005CfeD29feD4009669dE9Bcc21ce",
  "0x8f83670260F8f7708143b836a2a6F11eF0aBac01",
  "0xc7de7f4d4C9c991fF62a07D18b3E31e349833A18",
  "0xD10aBbC76679a20055E167BB80A24ac851b37056",
  "0xc40ec815A2f8eb9912BD688d3bdE6B6D50A37ff2",
  "0x15c8eA24Ba2d36671Fa22aD4Cff0a8eafe144352",
  "0xDC4BDB458C6361093069Ca2aD30D74cc152EdC75",
  "0x77F9710E7d0A19669A13c055F62cd80d313dF022",
  "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7",
  "0x58921Ac140522867bf50b9E009599Da0CA4A2379",
  "0x66a47b7206130e6FF64854EF0E1EDfa237E65339",
  "0xC1438AA3823A6Ba0C159CfA8D98dF5A994bA120b",
  "0xdF2917806E30300537aEB49A7663062F4d1F2b5F",
  "0x0BDb051e10c9718d1C29efbad442E88D38958274",
  "0x0d16d4528239e9ee52fa531af613AcdB23D88c94",
  "0x9F0F69428F923D6c95B781F89E165C9b2df9789D",
  "0x7b33EbfA52F215a30FaD5a71b3FeE57a4831f1F0",
  "0xc546d2d06144F9DD42815b8bA46Ee7B8FcAFa4a2",
  "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A",
  "0xCf61d1841B178fe82C8895fe60c2EDDa08314416",
  "0x1E6cF0D433de4FE882A437ABC654F58E1e78548c",
  "0xdd22A54e05410D8d1007c38b5c7A3eD74b855281",
  "0x971E8F1B779A5F1C36e1cd7ef44Ba1Cc2F5EeE0f",
  "0xdeb288F737066589598e9214E782fa5A8eD689e8",
  "0x614715d2Af89E6EC99A233818275142cE88d1Cfd",
  "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
  "0xE95CDc33E1F5BfE7eB26f45E29C6C9032B97db7F",
  "0xa34317DB73e77d453b1B8d04550c44D10e981C8e",
  "0xEb0adf5C06861d6c07174288ce4D0a8128164003",
  "0xF017fcB346A1885194689bA23Eff2fE6fA5C483b",
  "0x75FbD83b4bd51dEe765b2a01e8D3aa1B020F9d33",
  "0x9ae96129ed8FE0C707D6eeBa7b90bB1e139e543e",
  "0x449d117117838fFA61263B61dA6301AA2a88B13A",
  "0xeF8A4aF35cd47424672E3C590aBD37FBB7A7759a",
  "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699",
  "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
  "0x82597CFE6af8baad7c0d441AA82cbC3b51759607",
  "0x00Cb80Cf097D9aA9A3779ad8EE7cF98437eaE050",
  "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e",
  "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
  "0x9e37a8Ee3bFa8eD6783Db031Dc458d200b226074",
  "0x0a1d1b9847d602e789be38B802246161FFA24930",
  "0xC9CbF687f43176B302F03f5e58470b77D07c61c6",
  "0xd962fC30A72A84cE50161031391756Bf2876Af5D"
  ]

  return arr[Math.floor(Math.random() * arr.length)];
}

function parseTestData(testData){

  let cleanedRes = [];

  for (let i = 0; i < testData.length; i++) {
    const {name, success, startTime, endTime, total} = testData[i];

    cleanedRes.push([
      name,
      ((success/total)*100).toFixed(2) + '%',
      countdown(Math.floor((endTime-startTime)/1000)),
      ((endTime-startTime)/total)
    ])

  }

  return cleanedRes
  .sort((a, b)=>a[3] - b[3])
  .map((e, ind)=>{
    let arr = e;
    arr[3] = arr[3].toFixed(2) + 'ms'
    return [`#${ind+1}`].concat(arr);
  })

}

async function getLocationData(){
  let data = await fetch('http://ip-api.com/json/').then(e=>e.json());
  return data;
}

// Test Functions

async function getBalance(rpcUrl, userAddress){
  try {

    let headers = {
      "accept": "*/*",
      "content-type": "application/json",
    }
    if (rpcUrl.includes('@')) {
      let rUrl = new URL(rpcUrl);
      rpcUrl = rUrl.origin + rUrl.pathname;
      headers['Authorization']=`Basic ${btoa(rUrl.username + ':' + rUrl.password)}`;
    }

    let balance = await fetch(rpcUrl, {
      "method": "POST",
      "headers": headers,
      "body": JSON.stringify({
        id: 44,
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [userAddress, "latest"]
      })
    }).then(e=>e.json()).then(e=>parseFloat(ethers.utils.formatEther(e.result)));

    return balance > 0;
  } catch (error) {
    return false;
  }

}

async function getContractValue(rpcUrl, add){
  try {

    let headers = {
      "accept": "*/*",
      "content-type": "application/json",
    }

    if (rpcUrl.includes('@')) {
      let rUrl = new URL(rpcUrl);
      rpcUrl = rUrl.origin + rUrl.pathname;
      headers['Authorization']=`Basic ${btoa(rUrl.username + ':' + rUrl.password)}`;
    }

    let data = await fetch(rpcUrl, {
      "method": "POST",
      "headers": headers,
      "body": JSON.stringify({
        id: 44,
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{
          data: "0xfeaf968c",
          to: randomPriceFeedContract()
        }, "latest"]
      })
    }).then(e=>e.json()).then(e=>e.result);

    return Boolean(data);
  } catch (error) {
    return false;
  }
}

async function runMulticall(rpcUrl, add){

  try {
    let provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const balances = await getBalancesForEthereumAddress({
      contractAddresses: tokenList.map(e=>e.address),
      ethereumAddress: add,
      formatBalances: true,
      providerOptions: {
        ethersProvider: provider,
      },
    });

    return balances;

  } catch (error) {
    return false
  }

}

async function testGetLogs(rpcUrl){
  try {

    let headers = {
      "accept": "*/*",
      "content-type": "application/json",
    }

    if (rpcUrl.includes('@')) {
      let rUrl = new URL(rpcUrl);
      rpcUrl = rUrl.origin + rUrl.pathname;
      headers['Authorization']=`Basic ${btoa(rUrl.username + ':' + rUrl.password)}`;
    }

    let data = await fetch(rpcUrl, {
      "method": "POST",
      "headers": headers,
      "body": JSON.stringify({
        id: 44,
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [
          {
              "topics": [
                  "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118",
                  "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
              ],
              "fromBlock": "0xF116C0", // 15,800,000
              "toBlock": "latest",
              "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984"
          }
        ]
      })
    }).then(e=>e.json());

    if (data?.result){
      return data?.result.length>0;
    }
    else {
      console.log('error', rpcUrl, data?.error?.message)
      return false;
    }
    // console.log('got res', data.length)
  } catch (error) {
    return false;
  }
}

async function bench(args){


  let locData = await getLocationData();
  console.log(locData);

  if (args.mode == 'sequential'){

    console.log('Running in Sequential Mode');

    let rpcs = readFileSync(args.config, {encoding:'utf8', flag:'r'});
    rpcs = JSON.parse(rpcs);

    let testdata = readFileSync(args.testdata, {encoding:'utf8', flag:'r'});
    testdata = JSON.parse(testdata);
    testdata = testdata.map(e=>e?.address);
    console.log('Test Data Size:', testdata.length);





    let promiseArray = [];

    for(let rpcName in rpcs){
      const rpcUrl = rpcs[rpcName];
      promiseArray.push(testRunner(rpcName, testdata, getBalance, rpcUrl))
    }

    let results = await Promise.allSettled(promiseArray);
    results = results.map(e=>e?.value);
    results = parseTestData(results);

    console.log("### Benchmarking `eth_getBalance`");
    console.log(table(
      [tableHeader].concat(results),
      tableConfig
    ));





    promiseArray = [];

    for(let rpcName in rpcs){
      const rpcUrl = rpcs[rpcName];
      promiseArray.push(testRunner(rpcName, testdata, getContractValue, rpcUrl))
    }

    results = await Promise.allSettled(promiseArray);
    results = results.map(e=>e?.value);
    results = parseTestData(results);

    console.log("### Benchmarking `eth_call`");
    console.log(table(
      [tableHeader].concat(results),
      tableConfig
    ));





    promiseArray = [];

    for(let rpcName in rpcs){
      const rpcUrl = rpcs[rpcName];
      promiseArray.push(testRunner2(rpcName, testGetLogs, rpcUrl))
    }

    results = await Promise.allSettled(promiseArray);
    results = results.map(e=>e?.value);
    results = parseTestData(results);

    console.log(`### Benchmarking 'eth_getLogs', Fetching ETH Uniswap Pools (last 500k Blocks)`);
    console.log(table(
      [tableHeader].concat(results),
      tableConfig
    ));




    promiseArray = [];

    for(let rpcName in rpcs){
      const rpcUrl = rpcs[rpcName];
      promiseArray.push(testRunner(rpcName, testdata, runMulticall, rpcUrl))
    }

    results = await Promise.allSettled(promiseArray);
    results = results.map(e=>e?.value);
    results = parseTestData(results);

    console.log(`### Benchmarking 'multicall' with ${tokenList.length} Tokens`);
    console.log(table(
      [tableHeader].concat(results),
      tableConfig
    ));


  }
  else if (args.mode == 'parallel'){
    console.log('In Prog');
  }

}

yargs(hideBin(process.argv))
  .scriptName("rpc-bench")
  .usage('$0 <cmd> [args]')
  .command('bench', 'Benchmark RPC Endpoints', (yargs) => {
    yargs.positional('mode', {
      alias: 'm',
      describe: 'Test Mode',
      choices: ['sequential', 'parallel'],
      default: "sequential"
    })
    yargs.positional('config', {
        alias: 'c',
        type: 'string',
        default: './config.json',
        describe: 'Config File'
    })
    yargs.positional('testdata', {
      alias: 't',
      type: 'string',
      default: './testdata.json',
      describe: 'Test Data'
    })
    yargs.positional('limit', {
      alias: 'l',
      type: 'number',
      default: 100,
      describe: 'Limit (only in Sequential)'
    })
    yargs.positional('batch', {
      alias: 'b',
      type: 'number',
      default: 10,
      describe: 'Batch Size (only in Parallel)'
    })

  }, function (argv) {
    // console.log(argv);
    if (argv._[0] === 'bench') bench(argv);
  })
  .help()
  .argv