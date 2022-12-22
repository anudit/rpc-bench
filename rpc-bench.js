const { readFileSync } = require('fs');
const ethers = require("ethers");
const { createStream } = require('table');

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

async function getBalance(rpcUrl, userAddress){
  try {

    let balance = await fetch(rpcUrl, {
      "method": "POST",
      "headers": {
        "accept": "*/*",
        "content-type": "application/json",
      },
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

async function bench(args){

  if (args.mode == 'sequential'){

    console.log('Running in Sequential Mode');

    let rpcs = readFileSync(args.config, {encoding:'utf8', flag:'r'});
    rpcs = JSON.parse(rpcs);
    // console.log(rpcs);

    let testdata = readFileSync(args.testdata, {encoding:'utf8', flag:'r'});
    testdata = JSON.parse(testdata);
    testdata = testdata.map(e=>e?.address);
    console.log('Test Data Size:', testdata.length);

    const stream = createStream({
      columnDefault: {
          width: 14
      },
      columnCount: 4,
      columns: [
          { alignment: 'center' },
          { alignment: 'center' },
          { alignment: 'center' },
          { alignment: 'center' }
      ]
    });

    stream.write(
      ["Name", "Success Rate", "Total Time", "Avg Time /req"]
    )

    for(rpcName in rpcs){
      const rpcUrl = rpcs[rpcName];
      let total  = testdata.length;
      let success = 0;
      let startTime = Date.now();

      for (let i = 0; i < testdata.length; i++) {
        const add = testdata[i];
        let resp = await getBalance(rpcUrl, add);
        if (resp) {
          success += 1
        }
      }

      let endTime = Date.now();

      stream.write(
        [
          rpcName,
          (success/total*100).toFixed(2) + '%',
          countdown(Math.floor((endTime-startTime)/1000)),
          ((endTime-startTime)/total).toFixed(2)+'ms'
        ]
      )

    }
  }
  else if (args.mode == 'parallel'){
    console.log('In Prog');
  }

}

require('yargs')
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

