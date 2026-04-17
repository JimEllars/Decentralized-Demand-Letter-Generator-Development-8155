import { createThirdwebClient, getContract } from 'thirdweb';
import { useReadContract, useActiveAccount } from 'thirdweb/react';

const client = createThirdwebClient({ clientId: "dummy-client-id" });

console.log(client);
