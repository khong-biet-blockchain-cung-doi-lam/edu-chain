import os
import json
from web3 import Web3

RPC_URL = os.environ.get("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
_ABI_DIR = os.path.join(_PROJECT_ROOT, "blockchain", "artifacts", "contracts")

_w3 = None

def get_w3() -> Web3:
    global _w3
    if _w3 is None:
        _w3 = Web3(Web3.HTTPProvider(RPC_URL))
    return _w3

def _load_abi(contract_name: str) -> list:
    path = os.path.join(_ABI_DIR, f"{contract_name}.sol", f"{contract_name}.json")
    with open(path) as f:
        return json.load(f)["abi"]

def get_contract(contract_name: str, address: str):
    w3 = get_w3()
    abi = _load_abi(contract_name)
    return w3.eth.contract(
        address=Web3.to_checksum_address(address),
        abi=abi,
    )

def send_transaction(contract_function, private_key: str):
    """Sign and broadcast a transaction, return the receipt."""
    w3 = get_w3()
    account = w3.eth.account.from_key(private_key)

    try:
        estimated = contract_function.estimate_gas({"from": account.address})
        gas_limit = int(estimated * 1.3)
    except Exception:
        gas_limit = 3_000_000

    tx = contract_function.build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": gas_limit,
        "gasPrice": w3.eth.gas_price,
    })
    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    return w3.eth.wait_for_transaction_receipt(tx_hash)
