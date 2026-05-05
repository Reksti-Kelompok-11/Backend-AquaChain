// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * AquaChainLog — Smart contract untuk menyimpan bukti data sensor kolam di blockchain.
 *
 * Cara deploy:
 * 1. Buka https://remix.ethereum.org
 * 2. Paste kode ini
 * 3. Compile dengan versi ^0.8.0
 * 4. Deploy ke Injected Provider (MetaMask) dengan network Mumbai Testnet
 * 5. Copy contract address ke .env sebagai CONTRACT_ADDRESS
 */
contract AquaChainLog {

    event DataAnchored(
        string  telemetry_id,
        string  pond_id,
        bytes32 dataHash,
        uint256 timestamp
    );

    /**
     * Anchor data telemetri ke blockchain.
     * @param telemetry_id  UUID dari data telemetri
     * @param pond_id       ID kolam
     * @param dataHash      SHA-256 hash dari data sensor (di-hash di backend)
     */
    function anchorData(
        string memory telemetry_id,
        string memory pond_id,
        bytes32       dataHash
    ) public {
        emit DataAnchored(telemetry_id, pond_id, dataHash, block.timestamp);
    }
}
