const sjs = require('syscoinjs-lib')
const mnemonic = 'air leader stone antenna first shrug panic before nut sport bench keen'
// blockbook URL
const backendURL = 'https://sys-explorer.tk/' // if using localhost you don't need SSL see use 'systemctl edit --full blockbook-syscoin.service' to remove SSL from blockbook
// 'null' for no password encryption for local storage and 'true' for testnet
const HDSigner = new sjs.utils.HDSigner(mnemonic, null, true)
const syscoinjs = new sjs.SyscoinJSLib(HDSigner, backendURL)
const syscointx = require('syscointx-js')

async function sendSys () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: false }
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const outputsArr = [
    { address: 'tsys1quas925cuqmlkc0082442uh68efv3hdazknmjpd', value: new sjs.utils.BN(10000000) }
  ]
  const psbt = await syscoinjs.createTransaction(txOpts, sysChangeAddress, outputsArr, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}
async function sendSysMemo () {
  const feeRate = new sjs.utils.BN(10)
  const memo = Buffer.from('Gas station order id: 606c80d6cc793f13d2f0d424. Asset GUID 341906151')
  const memoHeader = Buffer.from([0xfe, 0xfe, 0xaf, 0xaf, 0xaf, 0xaf])
  const txOpts = { rbf: true, memo: memo, memoHeader: memoHeader, assetWhiteList: new Map([['341906151', {}]]) }
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = 'tsys1qnykk8e2e6wuufaz0lcdlry05fq5sj3uzczra3p'
  const outputsArr = [
    { address: 'tsys1q0hxdj9r3tyxmr66tehdhhl35l5rk4ucanteuh6', value: new sjs.utils.BN(3158692) }
  ]
  const result = await syscoinjs.createTransaction(txOpts, sysChangeAddress, outputsArr, feeRate, 'tsys1qnykk8e2e6wuufaz0lcdlry05fq5sj3uzczra3p')
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
  }
  const psbt = await syscoinjs.signAndSendWithWIF(result.psbt, 'cQh85hzaUMQDCneQvuwEvKFS418gzHfaQ9MmKj9pCd8aKgRNaEDr', result.assets)
  const memoExtracted = sjs.utils.getMemoFromOpReturn(psbt.txOutputs, memoHeader)
  console.log('memo extracted from transaction ' + memoExtracted.toString())
}
async function newAsset () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: false }
  const assetOpts = { precision: 8, symbol: 'JAG', maxsupply: new sjs.utils.BN(100000000000), description: 'publicvalue' }
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  // let HDSigner find asset destination address
  const sysReceivingAddress = null
  const psbt = await syscoinjs.assetNew(assetOpts, txOpts, sysChangeAddress, sysReceivingAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  const assets = syscointx.getAssetsFromTx(psbt.extractTransaction())
  console.log('created asset ' + assets.keys().next().value)
}

async function updateAsset () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '2125509931'
  // update capability flags, update description and update eth smart contract address
  const assetOpts = { updatecapabilityflags: 123, contract: Buffer.from('2b1e58b979e4b2d72d8bca5bb4646ccc032ddbfc', 'hex'), description: 'new publicvalue' }
  // send asset back to ourselves as well as any change
  const assetChangeAddress = null
  // send change back to ourselves as well as recipient to ourselves
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(0), address: assetChangeAddress }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetUpdate(assetGuid, assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}
async function updateAssetAuxFees () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '2229676993'
  const scalarPct = 1000
  // the aux fee keyPair
  const keyPair = HDSigner.createKeypair(0)
  // get the p2wpkh payment so we can get the keyid (payment.hash)
  const payment = sjs.utils.bitcoinjs.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: HDSigner.Signer.network
  })
  const auxFeeKeyID = Buffer.from(payment.hash.toString('hex'), 'hex')
  // setup the auxfee table
  const auxFees = [
    {
      bound: new sjs.utils.BN(0),
      percent: 1 * scalarPct
    },
    {
      bound: new sjs.utils.BN(10 * syscointx.utils.COIN),
      percent: 0.4 * scalarPct
    },
    {
      bound: new sjs.utils.BN(250 * syscointx.utils.COIN),
      percent: 0.2 * scalarPct
    },
    {
      bound: new sjs.utils.BN(2500 * syscointx.utils.COIN),
      percent: 0.07 * scalarPct
    },
    {
      bound: new sjs.utils.BN(25000 * syscointx.utils.COIN),
      percent: 0.007 * scalarPct
    },
    {
      bound: new sjs.utils.BN(250000 * syscointx.utils.COIN),
      percent: 0
    }
  ]
  // update auxfee details
  const assetOpts = { auxfeedetails: { auxfeekeyid: auxFeeKeyID, auxfees: auxFees } }
  // send asset back to ourselves as well as any change
  const assetChangeAddress = null
  // send change back to ourselves as well as recipient to ourselves
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(0), address: assetChangeAddress }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetUpdate(assetGuid, assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function updateAssetNotary () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '2039276165'
  // the notary keyPair
  const keyPair = HDSigner.createKeypair(0)
  // get the p2wpkh payment so we can get the keyid (payment.hash)
  const payment = sjs.utils.bitcoinjs.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: HDSigner.Signer.network
  })
  // the notary key and the details can be updated independently but we will update both here
  const notaryKeyID = Buffer.from(payment.hash.toString('hex'), 'hex')
  const notaryDetails =
  {
    // endpoint must be encoded in utf8 using Buffer.from (default) because it should encode as bytes represented by base64 string (encodeToBase64)
    endpoint: Buffer.from(syscointx.utils.encodeToBase64('https://test12.com')),
    instanttransfers: true,
    hdrequired: false
  }
  // update auxfee details
  const assetOpts = { notarykeyid: notaryKeyID,  notarydetails: notaryDetails }
  // send asset back to ourselves as well as any change
  const assetChangeAddress = null
  // send change back to ourselves as well as recipient to ourselves
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(0), address: assetChangeAddress }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetUpdate(assetGuid, assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function transferAsset () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '3372068234'
  const assetOpts = { }
  // send asset to tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae and it will send change to new output owned by HDSigner
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(0), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetUpdate(assetGuid, assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function issueAsset () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '3813460941'
  // mint 11000 satoshi (not COINS)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(6000), address: 'tsys1qpay7ehn7epk5dmh8xv7dn5ksvyhr06323mtz0s' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetSend(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function issueAssetNFT () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '2264781424'
  const NFTID = sjs.utils.createAssetID('1', assetGuid)
  // mint 1000 satoshi (not COINS)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(1000), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }],
    [NFTID, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(1), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetSend(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function issueAssetNFT1 () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetGuid = '2441957158'
  const NFTID = sjs.utils.createAssetID('1', assetGuid)
  // mint 1000 satoshi (not COINS)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [NFTID, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(1), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetSend(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function sendAsset () {
  const feeRate = new sjs.utils.BN(10)
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: false }
  const assetguid = '3813460941'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(500), address: 'tsys1qgkyez6kz2l2qkr5zmjmwx0rwkrkylf2p09lyd4' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function sendAssetWithoutSigner () {
  const feeRate = new sjs.utils.BN(10)
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: true }
  const assetguid = '682797033'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = 'tsys1qma37l03q036525653n5m66yun3m7kkjxdm42jk'
  const assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(0.0001*10**8), address: 'tsys1q4nla8xg9e7ww8zafwkxdwkwl8dxmn78nz4dcc7' }] }]
  ])
  const xpub = 'vpub5YBbnk2FsQPCd4LsK7rESWaGVeWtq7nr3SgrdbeaQgctXBwpFQfLbKdwtDAkxLwhKubbpNwQqKPodfKTwVc4uN8jbsknuPTpJuW8aN1S3nC'
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = 'tsys1qma37l03q036525653n5m66yun3m7kkjxdm42jk'
  const result = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate, xpub)
  console.log('base64 psbt ' + result.psbt.toBase64())
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
  }
  const newpbst = sjs.utils.bitcoinjs.Psbt.fromBase64( result.psbt.toBase64())
  console.log('base64 psbt new ' + newpbst.toBase64())
  console.log('base64 psbt new ' + JSON.stringify(newpbst))
}

async function sendAssetFundedByAddress () {
  const feeRate = new sjs.utils.BN(10)
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: true }
  const assetguid = '2201781193'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(1000000), address: 'tsys1qk0mrytgd06tc4rdtcs7h6nvx9ph67rjavv7qx6' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const result = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate, 'tsys1qd2wejyl606fratchj0emvwcl78p67wq4x9cy4w')
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  await syscoinjs.signAndSendWithWIF(result.res, 'cSRej8siHpwEKN9Mzh8s7WFwFenhb2my5dnyWK8pH1jUwonCvEdP', result.assets)
}

async function sendAssetFundedByXPUB () {
  const feeRate = new sjs.utils.BN(10)
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: true }
  const assetguid = '341906151'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(100000), address: 'tsys1qk0mrytgd06tc4rdtcs7h6nvx9ph67rjavv7qx6' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const result = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate, 'vpub5ZnEznWQvUgz3caxxZVnfnxkHkDstTFrsdSi9zQAf48ozc4a1XdfaAY6eBgKigm4NxykfcFh7d3oBwMHqKzzGo2jKET8AbypuuffvbBwAwH')
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  await syscoinjs.signAndSend(result.res, result.assets)
}

async function sendAssetFundedByMultiHDSigners () {
  const mnemonic1 = 'bicycle lucky earn primary wasp ranch dinner gravity property tenant gospel nephew soul cruise tool'
  const HDSigner1 = new sjs.utils.HDSigner(mnemonic1, null, true)
  const feeRate = new sjs.utils.BN(10)
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: true }
  const assetguid = '3813460941'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(6000), address: 'tsys1qfqq6fg6jacruta85xysa4hzc00y9c0numedhh8' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const sysFromXpubOrAddress = [HDSigner.getAccountXpub(), HDSigner1.getAccountXpub()]
  const result = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate, sysFromXpubOrAddress)
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  // this should sign one of the inputs with HDSigner
  let psbt = await syscoinjs.signAndSend(result.psbt, result.assets)
  // this should sign the other input with HDSigner1, and then notarize, signing one input with HDSigner1 again
  const psbt1 = await syscoinjs.signAndSend(psbt, result.assets, HDSigner1)
  // this should finalize the transaction from HDSigner signing (this time notarized) and send it to network
  psbt = await syscoinjs.signAndSend(psbt1, result.assets)
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  
async function sendAssetFundedByMultisig() {
  const mnemonic1 = 'bicycle lucky earn primary wasp ranch dinner gravity property tenant gospel nephew soul cruise tool'
  const HDSigner1 = new sjs.utils.HDSigner(mnemonic1, null, true)
  hdSignerKP = await HDSigner.createKeypair(0, false)
  hdSigner1KP = await HDSigner1.createKeypair(0, false)
  const p2ms = sjs.utils.bitcoinjs.payments.p2ms({
    m: 2, pubkeys: [
      hdSignerKP.publicKey,
      hdSigner1KP.publicKey,
    ], network: HDSigner.Signer.network})
  const addressMS = sjs.utils.bitcoinjs.payments.p2wsh({
    redeem: p2ms
  })
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  // send some gas to the multisig
  const outputsArr = [
    { address: addressMS.address, value: new sjs.utils.BN(10000000) }
  ]
  const assetguid = '341906151'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  let psbt = await syscoinjs.createTransaction(txOpts, sysChangeAddress, outputsArr, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
  
  // send some asset to the multisig
  let assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(6000), address: addressMS.address }] }]
  ])
  let result = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  console.log('Waiting for 10 seconds so we can spend the multisig(wait for 1 block)...')
  await sleep(10000);
  // now spend the asset from the multisig
  assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(5000), address: 'tsys1qk0mrytgd06tc4rdtcs7h6nvx9ph67rjavv7qx6' }] }]
  ])
  const sysFromXpubOrAddress = [addressMS.address]
  result = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate, sysFromXpubOrAddress, null, p2ms.output)
  if (!result) {
    console.log('Could not create transaction, not enough funds?')
    return
  }
  // this should add signature with 0th index path in HDSigner
  psbt = await syscoinjs.signAndSend(result.psbt, result.assets, null, HDSigner.getHDPath(0, false))
  // this should add second signature with 0th index path in HDSigner1
  await syscoinjs.signAndSend(psbt, result.assets, HDSigner1, HDSigner1.getHDPath(0, false))


}
async function sendAssetWithMemo () {
  const feeRate = new sjs.utils.BN(10)
  // data carrying memo field added to opreturn commitment
  const memo = Buffer.from('a7bf215279d3f6568dcd17c429d41a35a466f803', 'hex')
  const memoHeader = Buffer.from([0xfe, 0xfe, 0xaf, 0xaf, 0xaf, 0xaf])
  // set to false for ZDAG, true disables it but it is replaceable by bumping the fee
  const txOpts = { rbf: true, memo: memo, memoHeader: memoHeader }
  const assetguid = '341906151'
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetguid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(5), address: 'tsys1qk0mrytgd06tc4rdtcs7h6nvx9ph67rjavv7qx6' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationSend(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
  const memoExtracted = sjs.utils.getMemoFromOpReturn(psbt.txOutputs, memoHeader)
  console.log('memo extracted from transaction ' + memoExtracted.toString('hex'))
}

async function assetBurnToSys () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  // empty ethaddress means burning SYSX to SYS, otherwise its burning asset to goto Etheruem
  const assetOpts = { ethaddress: Buffer.from('') }
  // in reality this would be a known asset (SYSX)
  const assetGuid = '3372068234'
  // burn 1 satoshi (not COINS)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(1), address: 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationBurn(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function sysBurnToAsset () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  // asset and address being minted to from Eth to Sys
  const mintAddress = 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae'
  const assetGuid = '3372068234'
  // mint 10 COINS
  const amountToMint = new sjs.utils.BN(1000000000)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: amountToMint, address: mintAddress }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.syscoinBurnToAssetAllocation(txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function assetBurnToEth () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetOpts = { ethaddress: Buffer.from('07C72973d42D28de80D47Eb1F8Bc4a8ee0D5bBb1', 'hex') }
  // in reality this would be a known asset (SYSX)
  const assetGuid = '1965866356'
  // burn 1 satoshi (not COINS)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = 'tsys1q7zewkwya3je369vyzq5l5e83mrvdqwzgvv9nzg'
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: new sjs.utils.BN(1), address: 'tsys1quexf5zalfak2cvv9mujkh9pc3f3wrcgz7gzhh5' }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = 'tsys1q7zewkwya3je369vyzq5l5e83mrvdqwzgvv9nzg'
  const sysFromXpubOrAddress = 'vpub5ZdpZuCU7ubDRZ5V7uryBDBEZxDNP67FLgPyHgPtiVgjwDk8rjxAFbg4cHNAyp9ZLXNgJRq6f9QjWCc4Ef7gUxFivP7GkSKo6ANNb2jrzhA'
  const psbt = await syscoinjs.assetAllocationBurn(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate, sysFromXpubOrAddress)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

async function assetMintToSys () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  const assetOpts = {
    ethtxid: Buffer.from('3c3bfe141fcbe313f2afd31be1b63dd3a0147235161e637407fbb8605d3d294f', 'hex'),
    blockhash: Buffer.from('ee524852fb7df5a6c27106f4bc47e740e6a6751e66bce1f98363ff2eecbf8c0d', 'hex'),
    txvalue: Buffer.from('f9012b82051f843b9aca008307a120940765efb302d504751c652c5b1d65e8e9edf2e70f80b8c454c988ff00000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000009be8894b0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002c62637274317130667265323430737939326d716b386b6b377073616561366b74366d3537323570377964636a00000000000000000000000000000000000000002ca0dccb6e077c3f6252d199202113893407119d4ba09667113f2d20c63a31487b87a01e0a059e50f08f2772781691f2c9e43a9503a167c98cf467b1afc177b74d84e6', 'hex'),
    txroot: Buffer.from('a0842ab40a9c4770c8ec74158aadcf943e8158128fdd1ba8cef9c7cb8eda732692', 'hex'),
    txparentnodes: Buffer.from('f9039cf871a04442f3f69add48df0531fe3c0025103b53fcf3fe38060e5f29366caec8855e4fa0229f7b7e69c0b5793f8a61c06f5cc09b0f4938561856c632ee56c3b2c4d6d153808080808080a07720fff5e8eabef55fa129ee55b3b0d82875e2b25b8f26e22cf6b5c4f9cec7ab8080808080808080f901f180a03ee147749c5b769bc5d1a53e4f37567506d417de4ec4e67722130eda4638427da043caa62b40dad61bce4d50fb62ea485729a6687c3aa13895cf4ba234b92afe82a0b79958e4aa63104da4599ebb91e712375e6adfc89abc14b9533c5778f107e7d8a01bc7f80f81a8d281253ac882bb89aca6131e5794bfcbdccde990bb6d5be6cb2fa0aedad62f1426b68e395a59e06bf242fb28b882af67589bce3495a99650058ec4a0c21a7e0b9d0948bb6b65a5e73f5f01173064d20e4819ca4884d1eabc22bf737da090087708c533b10af8925eebf398c005fc16cb6a515111f2be4f328f762949d0a02827daacd6a52ae6c74a78791ff0c5e33a7a85f5ca0a47cdfbcd5219f75f705ca0af7ecf31d56575155d272cd813bf7d7ac435f62b0538c31771e407dafef6be53a09b74707c3abdbfa305cb61f23c940f063f553f17d0bd3013126aad357193353ea067a52ed59820bb48f8010d2b2bb0ee92803b1a00a8341fd4c3269b065ed070d9a0bf0e9b45955283e6e04b71eda63bfc7b55d9f54527943aa1c159b4161b1e1daea0ecabd4c00deacf9a7ff25be942c9f468628eb776fbec23a9ca0d8fc256f14a31a0df406c7ac7f38c2ea1d9bdb06c2e51db3de8cf0e655a8e0e683e19ca1ddf83d3a08360ec6c5e26614f144520ed9d0b577640381f0f38b5429b67422f75d603ad5a80f9013220b9012ef9012b82051f843b9aca008307a120940765efb302d504751c652c5b1d65e8e9edf2e70f80b8c454c988ff00000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000009be8894b0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002c62637274317130667265323430737939326d716b386b6b377073616561366b74366d3537323570377964636a00000000000000000000000000000000000000002ca0dccb6e077c3f6252d199202113893407119d4ba09667113f2d20c63a31487b87a01e0a059e50f08f2772781691f2c9e43a9503a167c98cf467b1afc177b74d84e6', 'hex'),
    txpath: Buffer.from('0b', 'hex'),
    receiptvalue: Buffer.from('f902e00183192ee2b9010000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000200000000000000008000000000000000000000100200000000000000000010000000000000200000000000000000000000000000000000010000000000000000000000000000004000000000000000000000000400004001000000000020000000000000000000000000080000000000000408000000040000000000000000002000000000000000000000000000000000000000000000000000000000010000000000000000010000000000000000000000000000000000000000000f901d5f89b94f2bb7bfa19e7c4b6bb333ee1afdf8e5e8f9b3561f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000b0ea8c9ee8aa87efd28a12de8c034f947c144053a00000000000000000000000000765efb302d504751c652c5b1d65e8e9edf2e70fa000000000000000000000000000000000000000000000000000000002540be400f89b94f2bb7bfa19e7c4b6bb333ee1afdf8e5e8f9b3561f863a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a0000000000000000000000000b0ea8c9ee8aa87efd28a12de8c034f947c144053a00000000000000000000000000765efb302d504751c652c5b1d65e8e9edf2e70fa00000000000000000000000000000000000000000000000000000000000000000f899940765efb302d504751c652c5b1d65e8e9edf2e70fe1a09c6dea23fe3b510bb5d170df49dc74e387692eaa3258c691918cd3aa94f5fb74b860000000000000000000000000b0ea8c9ee8aa87efd28a12de8c034f947c14405300000000000000000000000000000000000000000000000000000002540be4000000000000000000000000000000000000000000000000000000080800000002', 'hex'),
    receiptroot: Buffer.from('a0a958499bf48fcce17672b58aa9037bd3dafeb6231880722d909c60bacfaaa8d4', 'hex'),
    receiptparentnodes: Buffer.from('f90551f871a0cab13def05783d763febde31920bd234d0486c26955c2937e0486db909a28eeea09cf564a668a29a5f1cc5d6ef8e19988dfd2b30d290672f0ffc4200e608cb65ac808080808080a029b8ed2258c53562954c87bcd7f60671029680d2a19ef8bcd3ad470ea48d57d18080808080808080f901f180a07c21ca39872e6b8f611bc6b1b295c24f988b5cf944625eabf5236b37ea3b9f01a0edb9e63fdc31ba41f11a8b2fb8000ad1357b3c0b27a8483968d75e93e7b488a1a02231847aa3c5dde2f2a1851a66aabec65e5eaae8c28110756f122c72be1fba05a08fa87809e5b7f989e78ccbe1a6bc4924115d5747529af879f2fe196f959b64fca091f1bf748061eba21a413b72d70afccb8daebb5906d5cd9dda06d5f877065d5ba0d7e6c82dd1c25eb2f90b02f038beaff98c260d46992d0b3c1eac7d51552c7417a01d5c43deb2e3794292cdffb04f82ab25bc4e75f5e0cab928b66582e08026f5b1a0d7323a87dc8fbc66c7b34810d2cad92fc0da168d962b4556e825a3266a148b74a0af31f0b7cdcd6a855ac7678ef2b8fcb1afeda918b0c8e4696a4013f2b75ca402a0f9d63f2db8ab6d3c3e12073ac2910ee575832bde3e4586f18e59dd26a16adb7ca0f0c91e059c43780617d304fe8992511f096ccc35232da1f25127db53ba4fb05aa052030932d0a9026efd2a3ada67f33d401cd9a97ddb24c606af3a0a0c24e432aba0142af9b4686c6ca30b0ac39133fa76d8682b7bbbec488e62e652d3f25419777da0940f31617e91cfbabaa9d0d1638949f8125f80a43027122778522675194a4e65a0edc4c7d2cf30150fdf7e502d0ef06c80c85fc37260134a112493c6183f62f4b580f902e720b902e3f902e00183192ee2b9010000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000200000000000000008000000000000000000000100200000000000000000010000000000000200000000000000000000000000000000000010000000000000000000000000000004000000000000000000000000400004001000000000020000000000000000000000000080000000000000408000000040000000000000000002000000000000000000000000000000000000000000000000000000000010000000000000000010000000000000000000000000000000000000000000f901d5f89b94f2bb7bfa19e7c4b6bb333ee1afdf8e5e8f9b3561f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000b0ea8c9ee8aa87efd28a12de8c034f947c144053a00000000000000000000000000765efb302d504751c652c5b1d65e8e9edf2e70fa000000000000000000000000000000000000000000000000000000002540be400f89b94f2bb7bfa19e7c4b6bb333ee1afdf8e5e8f9b3561f863a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a0000000000000000000000000b0ea8c9ee8aa87efd28a12de8c034f947c144053a00000000000000000000000000765efb302d504751c652c5b1d65e8e9edf2e70fa00000000000000000000000000000000000000000000000000000000000000000f899940765efb302d504751c652c5b1d65e8e9edf2e70fe1a09c6dea23fe3b510bb5d170df49dc74e387692eaa3258c691918cd3aa94f5fb74b860000000000000000000000000b0ea8c9ee8aa87efd28a12de8c034f947c14405300000000000000000000000000000000000000000000000000000002540be4000000000000000000000000000000000000000000000000000000080800000002', 'hex')
  }
  // asset and address being minted to from Eth to Sys
  const mintAddress = 'tsys1qdflre2yd37qtpqe2ykuhwandlhq04r2td2t9ae'
  const assetGuid = '2615707979'
  // mint 100 COINS
  const amountToMint = new sjs.utils.BN(10000000000)
  // if assets need change sent, set this address. null to let HDSigner find a new address for you
  const assetChangeAddress = null
  const assetMap = new Map([
    [assetGuid, { changeAddress: assetChangeAddress, outputs: [{ value: amountToMint, address: mintAddress }] }]
  ])
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationMint(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}

// pass just Eth txid and let syscoinjslib get proof to create transaction
async function assetMintToSys2 () {
  const feeRate = new sjs.utils.BN(10)
  const txOpts = { rbf: true }
  // web3 URL + ID and ethereum burn txid
  const assetOpts = {
    web3url: 'http://localhost:8545',
    ethtxid: '0x3c3bfe141fcbe313f2afd31be1b63dd3a0147235161e637407fbb8605d3d294f'
  }
  // will be auto filled based on ethtxid eth-proof
  const assetMap = null
  // if SYS need change sent, set this address. null to let HDSigner find a new address for you
  const sysChangeAddress = null
  const psbt = await syscoinjs.assetAllocationMint(assetOpts, txOpts, assetMap, sysChangeAddress, feeRate)
  if (!psbt) {
    console.log('Could not create transaction, not enough funds?')
  }
}
console.log('Account XPUB: ' + HDSigner.getAccountXpub())
sendAssetFundedByMultisig()
