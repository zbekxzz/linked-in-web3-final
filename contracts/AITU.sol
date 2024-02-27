// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AITU_Shadyman is ERC20 {
    address private _owner = _msgSender();

    constructor() ERC20("AITU_Shadyman", "ATS") {
        _mint(_owner, 2000);
    }
}
