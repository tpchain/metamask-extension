import log from 'loglevel'
import { valuesFor } from '../app/helpers/utils/util'

export default function txHelper (
  unapprovedTxs,
  unapprovedMsgs,
  personalMsgs,
  decryptMsgs,
  encryptionPublicKeyMsgs,
  typedMessages,
  pendingApprovals,
  network,
) {
  log.debug('tx-helper called with params:')
  log.debug({ unapprovedTxs, unapprovedMsgs, personalMsgs, decryptMsgs, encryptionPublicKeyMsgs, typedMessages, pendingApprovals, network })

  const txValues = network ? valuesFor(unapprovedTxs).filter((txMeta) => txMeta.metamaskNetworkId === network) : valuesFor(unapprovedTxs)
  log.debug(`tx helper found ${txValues.length} unapproved txs`)

  const msgValues = valuesFor(unapprovedMsgs)
  log.debug(`tx helper found ${msgValues.length} unsigned messages`)
  let allValues = txValues.concat(msgValues)

  const personalValues = valuesFor(personalMsgs)
  log.debug(`tx helper found ${personalValues.length} unsigned personal messages`)
  allValues = allValues.concat(personalValues)

  const decryptValues = valuesFor(decryptMsgs)
  log.debug(`tx helper found ${decryptValues.length} decrypt requests`)
  allValues = allValues.concat(decryptValues)

  const encryptionPublicKeyValues = valuesFor(encryptionPublicKeyMsgs)
  log.debug(`tx helper found ${encryptionPublicKeyValues.length} encryptionPublicKey requests`)
  allValues = allValues.concat(encryptionPublicKeyValues)

  const typedValues = valuesFor(typedMessages)
  log.debug(`tx helper found ${typedValues.length} unsigned typed messages`)
  allValues = allValues.concat(typedValues)

  const pendingApprovalValues = valuesFor(pendingApprovals)
  log.debug(`tx helper found ${pendingApprovalValues.length} pending approval requests`)
  allValues = allValues.concat(pendingApprovalValues)

  allValues = allValues.sort((a, b) => {
    return a.time - b.time
  })

  return allValues
}
