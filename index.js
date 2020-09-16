const sjs = require('syscoinjs-lib')
const BN = require('bn.js')
const mnemonic = 'club toss element melody skin ship rifle student reason real interest insane elevator beauty movie'
// blockbook URL
const backendURL = 'http://localhost:9130'
// 'null' for no password encryption for local storage and 'true' for testnet
const HDSigner = new sjs.utils.HDSigner(mnemonic, null, true)
const syscoinjs = new sjs.SyscoinJSLib(HDSigner, backendURL)

async function newAsset () {
  const feeRate = new BN(10)
  const txOpts = { rbf: false }
  const assetOpts = { precision: 8, symbol: 'CAT', updatecapabilityflags: 255, balance: new BN(10000000000), maxsupply: new BN(100000000000), description: 'publicvalue' }
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetNew(assetOpts, txOpts, sysChangeAddress, feeRate)
  if(!psbt) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  // example of once you have it signed you can push it to network via backend provider
  const resSend = await sjs.utils.sendRawTransaction(syscoinjs.blockbookURL, psbt.extractTransaction().toHex(), HDSigner)
  if (resSend.error) {
    console.log('could not send tx! error: ' + resSend.error.message)
  } else if (resSend.result) {
    console.log('tx successfully sent! txid: ' + resSend.result)
  } else {
    console.log('Unrecognized response from backend')
  }
}

async function updateAsset () {
  const feeRate = new BN(10)
  const txOpts = { rbf: true }
  const assetGuid = 3372068234
  const assetMap = new Map([
    [3372068234, { outputs: [{ value: new BN(0), address: 'tsys1qt8aq6hrrlc6ueps4wqc6ynfckrxxrw20ydamc9' }] }]
  ])
  const assetOpts =  { updatecapabilityflags: 127, balance: new BN(42000000), contract: Buffer.from('2b1e58b979e4b2d72d8bca5bb4646ccc032ddbfc', 'hex'), description: 'new publicvalue' }
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetUpdate(assetGuid, assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if(!psbt) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  // example of once you have it signed you can push it to network via backend provider
  const resSend = await sjs.utils.sendRawTransaction(syscoinjs.blockbookURL, psbt.extractTransaction().toHex(), HDSigner)
  if (resSend.error) {
    console.log('could not send tx! error: ' + resSend.error.message)
  } else if (resSend.result) {
    console.log('tx successfully sent! txid: ' + resSend.result)
  } else {
    console.log('Unrecognized response from backend')
  }
}
updateAsset()
