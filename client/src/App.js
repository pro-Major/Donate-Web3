import React, { useCallback, useEffect, useState } from 'react'
import { loadContract } from './utils/loadContract'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'

export default function App() {
  // Create the state variable for web3
  const [web3Api, setWeb3] = useState({
    provider: null,
    web3: null,
    is1Loaded: false,
    contract: null,
  })

  const [accounts, setAccounts] = useState(null)
  const [balance, setBalance] = useState(0)
  const [reload, setReload] = useState(false)

  // Contract and network should be same
  const contractConnect = accounts && web3Api.contract

  const reloadEffect = useCallback(() => {
    setReload(!reload)
  }, [reload])

  // Function call on account change
  const setAccountListener = (provider) => {
    // If we are logging out from the accounts then we should always reload
    provider.on('accountsChanged', (_) => window.location.reload())
    provider.on('chainChanged', (_) => window.location.reload())
  }

  // Render only once
  // Connect with the web3,etherum
  useEffect(() => {
    // Function
    const loadProvider = async () => {
      // with metamask we have access to etherreum and web3
      //metamask injects a global API into websites
      // console.log('WEB 3', window.web3)
      // console.log('ETEHERUM', window.ethereum)

      //let provider = null
      const provider = await detectEthereumProvider()

      if (provider) {
        const contract = await loadContract('Faucet', provider)
        setAccountListener(provider)
        //await provider.request({ method: 'eth_requestAccounts' })
        //Update the state

        setWeb3({
          provider,
          web3: new Web3(provider),
          isProviderLoaded: true,
          contract,
        })
      } else {
        // setWeb3({
        //   ...web3Api,
        //   isProviderLoaded: true,
        // })
        // setWeb3((api) => {
        //   return {
        //     ...api,
        //     isProviderLoaded: true,
        //   }
        // })

        setWeb3((api) => ({ ...api, isProviderLoaded: true }))
        alert('Please install the metamask')
      }

      // If window.ethereum is true
      // if (window.ethereum) {
      //   provider = window.ethereum
      //   try {
      //     await provider.request({ method: 'eth_requestAccounts' })
      //   } catch (err) {
      //     console.log('Something went wrong', err)
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider
      // } else {
      //   provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
      // }
    }

    // Calling the function
    loadProvider()
  }, [])

  // To get the balance
  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, 'ether'))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, reload])

  // Get the Accounts Details
  // run only when the web3Api.web3 changes
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccounts(accounts[0])
    }
    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api

    await contract.addFunds({
      from: accounts,
      value: web3.utils.toWei('1', 'ether'),
    })
    reloadEffect()
  }, [web3Api, accounts, reloadEffect])

  const withdraw = async () => {
    const { contract, web3 } = web3Api
    const withDrawAmount = web3.utils.toWei('0.1', 'ether')
    await contract.withdraw(withDrawAmount, {
      from: accounts,
    })
    reloadEffect()
  }

  return (
    <>
      <div>
        <div
          style={{
            dispaly: 'grid',
            placeContent: 'center',
            border: '5px solid red',
          }}
        >
          <Box maxWidth={{ minWidth: 500 }} color="primary">
            <Card variant="outlined" color="primary">
              <CardContent style={{ placeContent: 'center' }}>
                {web3Api.isProviderLoaded ? (
                  <div>
                    {accounts ? (
                      <Typography variant="subtitle1" color="initial">
                        Accounts : {accounts}
                      </Typography>
                    ) : !web3Api.provider ? (
                      <span>Wallet is not connected </span>
                    ) : (
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() =>
                          web3Api.provider.request({
                            method: 'eth_requestAccounts',
                          })
                        }
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                ) : (
                  <span>Looking for web 3</span>
                )}
                <Typography variant="h5" color="initial">
                  Current Etherum Balance is <b>{balance} ETH</b>
                </Typography>
                {!contractConnect && <h1>Connect to ganache</h1>}
                <div>
                  <Button
                    disabled={!contractConnect}
                    variant="contained"
                    color="secondary"
                    style={{ margin: 30 }}
                    onClick={addFunds}
                  >
                    Donate 1 Ether
                  </Button>

                  <Button
                    disabled={!contractConnect}
                    variant="contained"
                    color="primary"
                    style={{ margin: 30 }}
                    onClick={withdraw}
                  >
                    WithDraw 0.1 Ether
                  </Button>

                  <Button
                    disabled={!contractConnect}
                    variant="contained"
                    color="success"
                    style={{ margin: 30 }}
                    onClick={async () => {
                      const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts',
                      })
                      console.log('Accounts Info', accounts) // returns the array ["0xf467c0b902bb5ebb3efbf1b39735b93f4a3c8ec2"]
                    }}
                  >
                    Enable Ethereum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Box>
        </div>
      </div>
    </>
  )
}
