import { ethers } from 'ethers'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'

assertEnvironment(Environment.HasBrowserAPI)

// These are non-functional client for constructing & deconstructing transactions in the content and options page.
export const nonFunctionalProvider = new ethers.providers.JsonRpcProvider()
export const nonFunctionalSigner = nonFunctionalProvider.getSigner()
