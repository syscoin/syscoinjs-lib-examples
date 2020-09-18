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
  // let HDSigner find asset destination address
  const sysReceivingAddress = null
  const psbt = await syscoinjs.assetNew(assetOpts, txOpts, sysChangeAddress, sysReceivingAddress, feeRate)
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
  // mint 42000000 satoshi for asset, update capability flags, update description and update eth smart contract address
  const assetOpts =  { updatecapabilityflags: 127, balance: new BN(42000000), contract: Buffer.from('2b1e58b979e4b2d72d8bca5bb4646ccc032ddbfc', 'hex'), description: 'new publicvalue' }
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetUpdate(assetGuid, assetOpts, txOpts, sysChangeAddress, feeRate)
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

async function issueAsset () {
  const feeRate = new BN(10)
  const txOpts = { rbf: true }
  const assetGuid = 3372068234
  // note no destination address in first output as syscoinjslib will auto fill it with new change address for 0 value asset outputs
  // mint 1000 satoshi (not COINS)
  const assetMap = new Map([
    [assetGuid, { outputs: [{ value: new BN(1000), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetSend(txOpts, assetMap, sysChangeAddress, feeRate)
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

async function sendAsset () {
  const feeRate = new BN(10)
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: true }
  const assetGuid = 3372068234
  // note no destination address in first output as syscoinjslib will auto fill it with new change address for 0 value asset outputs
  // send 10 satoshi (not COINS)
  const assetMap = new Map([
    [assetGuid, { outputs: [{ value: new BN(10), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate)
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

async function assetBurnToSys () {
  const feeRate = new BN(10)
  const txOpts = { rbf: true }
  // empty ethaddress means burning SYSX to SYS, otherwise its burning asset to goto Etheruem
  const assetOpts = { ethaddress: Buffer.from('') }
  // in reality this would be a known asset (SYSX)
  const assetGuid = 3372068234
  // note no destination address in first output as syscoinjslib will auto fill it with new change address for 0 value asset outputs
  // burn 1 satoshi (not COINS)
  const assetMap = new Map([
    [assetGuid, { outputs: [{ value: new BN(1), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationBurn(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
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

async function assetBurnToEth () {
  const feeRate = new BN(10)
  const txOpts = { rbf: true }
  const assetOpts = { ethaddress: Buffer.from('9667de58c15475626165eaa4c9970e409e1181d0', 'hex') }
  // in reality this would be a known asset (SYSX)
  const assetGuid = 3372068234
  // note no destination address in first output as syscoinjslib will auto fill it with new change address for 0 value asset outputs
  // burn 1 satoshi (not COINS)
  const assetMap = new Map([
    [assetGuid, { outputs: [{ value: new BN(1), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationBurn(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
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

async function assetMintToSys () {
  const feeRate = new BN(10)
  const txOpts = { rbf: true } 
  const assetOpts = { 
    bridgetransferid: 43,
    blocknumber: 7214232,
    txvalue: Buffer.from('f901493b843b9aca008307a12094443d9a14fb6ba2a45465bec3767186f404ccea2580b8e45f959b690000000000000000000000000000000000000000000000000000000047868c0000000000000000000000000000000000000000000000000000000000752cbd74000000000000000000000000e3d9ccbaedabd8fd4401aab7752f6f224a7ef1c8000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000150035d868aff0e7aba5b4333b41554818d0da56c8fc00000000000000000000002ca075fec35db44a193cd426b3a8a46dce47f2890a9917de889ae57f394cdf011b92a021a13df3254384c9f146ff9d054ff98b5fb8cd09ba78958bb3850e2ef5a1e90e', 'hex'),
    txparentnodes: Buffer.from('f9031af871a0ebb6810bee7494cce3570c708535006b6f93621f51d883a44d2fa5f727236b4ea0855a69066e2724d005dcce236c8772ccf9985dfbfd4e98f08bd2c9ba7093260a808080808080a0cf757e87d43011b7036ed3d0e3407abdbb613c76a2738cc447825eca8a437e8f8080808080808080f90151a066c9b052866f3d0f8e31eb069cc444b9ce7e9877aa0d3fab7c3a4f8aa7e2b1f0a026f628fce4afa01736e6de0fbeba3c186818f80b683d99defd95fb9c94553a19a095c6cb1568d59ec1f352f7377a7443923d74c6163313143931ab85168a384726a0cc7c7658b82f403056645b929b5cd8ec82db4598757dc6ad8f27a36934bc45b8a0b8a4e4de9ff77a11ccb32aa58f13645b05a4226df840085257a7af1a1d566012a0789d328230d980f1cdc51ab0ea9c25d901c30c2f89ed2316c946ff5074311065a00e44641d6b299753717d92818d543ebc13da99de29534b3a1c8f54d38d53648ba080952ddbb31b1a24a3bfcb9d9c1a986795d6f4c9faf2409d3efbc02bb7135f0ca07c699a456f87d97dd47b0da2bd207d7d5264adbefa180682d09040fb946e27cea06648f55a06ecd2790019409700f90f289743cfdc8442eb4f49e076b5fbb280d580808080808080f9015020b9014cf901493b843b9aca008307a12094443d9a14fb6ba2a45465bec3767186f404ccea2580b8e45f959b690000000000000000000000000000000000000000000000000000000047868c0000000000000000000000000000000000000000000000000000000000752cbd74000000000000000000000000e3d9ccbaedabd8fd4401aab7752f6f224a7ef1c8000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000150035d868aff0e7aba5b4333b41554818d0da56c8fc00000000000000000000002ca075fec35db44a193cd426b3a8a46dce47f2890a9917de889ae57f394cdf011b92a021a13df3254384c9f146ff9d054ff98b5fb8cd09ba78958bb3850e2ef5a1e90e', 'hex'),
    txpath: Buffer.from('17', 'hex'),
    receiptvalue: Buffer.from('f902e001831ca23fb901000002000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000021000008000000000000000000000a000000000004000000000000000000000000000000000000000000000000000100000000000000000000000000000010040000000000000020000010000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000002000000000000020000000004000000000000000000000000000000000010000100000000800000000000000000000000000080000000000000000000f901d5f89b94e3d9ccbaedabd8fd4401aab7752f6f224a7ef1c8f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000000763e1d872f2d72dd75f1ea1630dda726aca3faba0000000000000000000000000443d9a14fb6ba2a45465bec3767186f404ccea25a00000000000000000000000000000000000000000000000000000000047868c00f89b94e3d9ccbaedabd8fd4401aab7752f6f224a7ef1c8f863a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000000763e1d872f2d72dd75f1ea1630dda726aca3faba0000000000000000000000000443d9a14fb6ba2a45465bec3767186f404ccea25a00000000000000000000000000000000000000000000000000000000000000000f89994443d9a14fb6ba2a45465bec3767186f404ccea25e1a0aabab1db49e504b5156edf3f99042aeecb9607a08f392589571cd49743aaba8db8600000000000000000000000000763e1d872f2d72dd75f1ea1630dda726aca3fab0000000000000000000000000000000000000000000000000000000047868c00000000000000000000000000000000000000000000000000000000000000002b', 'hex'),
    receiptparentnodes: Buffer.from('f904b1f871a02c2b4497ce868f68426e36d5bf82ba7da1f51751925f2f0343c380e60a24c5eba024efb83f119f0ecc867a1bea6da39d5d039c39907f91065b6910ff69e660c789808080808080a0c670fde19e5a076fa24b6b9ceba019cb83a2d9a5633ff75e0769f91b52255e2e8080808080808080f90151a08a18c68ef438ff1579b64b8bd2a479b584e6c9a87b07917df79db6c1f8fa2caba0c2b3024f49bd4a82b1c6132092e0949a950204fdb489bfa5bf8018723efe0bd1a0a34132bcdd86eeab6712a20e38b442d3d11309e0759b755f640dfc451d7139e6a0b04c1114de80587976d4230a1eda56623e9a572f376416b3a4bd6b3ccdb9c891a0913a36a363ef0f17e02310910d8f205246d11bd603b704116680706cdeb4afb0a07adc84d46a02c6ef5337ceebfd2176bba83b43666a7d13fb8cef31448aa27a5da0506cf37b512947989c2453725dfb5d7f7d733e56a3368b6cee15131b7061b731a07c1d9f62aa211116a482a81d7f2790780973205dacd9221c36a773c718fe45cda04bf9fca33c2d353e3b04a6fb69eb84bb50f249f0ca8b1db567398f2fe337369ca06cf9f79ec960b5887a086c59fc6ff0db97e4d7339c9ed976c98a61bb165ac69080808080808080f902e720b902e3f902e001831ca23fb901000002000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000021000008000000000000000000000a000000000004000000000000000000000000000000000000000000000000000100000000000000000000000000000010040000000000000020000010000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000002000000000000020000000004000000000000000000000000000000000010000100000000800000000000000000000000000080000000000000000000f901d5f89b94e3d9ccbaedabd8fd4401aab7752f6f224a7ef1c8f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000000763e1d872f2d72dd75f1ea1630dda726aca3faba0000000000000000000000000443d9a14fb6ba2a45465bec3767186f404ccea25a00000000000000000000000000000000000000000000000000000000047868c00f89b94e3d9ccbaedabd8fd4401aab7752f6f224a7ef1c8f863a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000000763e1d872f2d72dd75f1ea1630dda726aca3faba0000000000000000000000000443d9a14fb6ba2a45465bec3767186f404ccea25a00000000000000000000000000000000000000000000000000000000000000000f89994443d9a14fb6ba2a45465bec3767186f404ccea25e1a0aabab1db49e504b5156edf3f99042aeecb9607a08f392589571cd49743aaba8db8600000000000000000000000000763e1d872f2d72dd75f1ea1630dda726aca3fab0000000000000000000000000000000000000000000000000000000047868c00000000000000000000000000000000000000000000000000000000000000002b', 'hex')
  }
  // asset and address being minted to from Eth to Sys
  const mintAddress = 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae'
  const assetGuid = 1965866356
  // mint 100 COINS
  const amountToMint = new BN(10000000000)
  
  // note no destination address in first output as syscoinjslib will auto fill it with new change address for 0 value asset outputs
  const assetMap = new Map([
    [assetGuid, { outputs: [{ value: amountToMint, address: mintAddress }] }]
  ])
  // let HDSigner find change address
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationMint(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
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

assetMintToSys()
