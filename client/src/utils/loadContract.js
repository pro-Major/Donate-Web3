import contract from '@truffle/contract'

export const loadContract = async (name, provider) => {
  const result = await fetch(`/contracts/${name}.json`)
  const Artifact = await result.json()
  const _contract = contract(Artifact)
  _contract.setProvider(provider)

  // If we changed the network it should be an error
  let deployedContract = null
  try {
    deployedContract = await _contract.deployed()
  } catch (err) {
    console.error('You are connected to wrong network')
  }

  return deployedContract
}
