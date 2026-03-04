import io
import json
import os
import requests

_GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/{cid}",
    "https://ipfs.io/ipfs/{cid}",
    "https://cloudflare-ipfs.com/ipfs/{cid}",
]

def _auth_headers() -> dict:
    """
    Build Pinata auth headers.
    Prefers JWT (PINATA_JWT), falls back to API key + secret.
    Raises EnvironmentError if no credentials are configured.
    """
    jwt = os.environ.get("PINATA_JWT", "").strip()
    if jwt:
        return {"Authorization": f"Bearer {jwt}"}

    api_key    = os.environ.get("PINATA_API_KEY", "").strip()
    api_secret = os.environ.get("PINATA_API_SECRET", "").strip()
    if api_key and api_secret:
        return {
            "pinata_api_key":        api_key,
            "pinata_secret_api_key": api_secret,
        }

    raise EnvironmentError(
        "Pinata credentials not found. "
        "Set PINATA_JWT (or PINATA_API_KEY + PINATA_API_SECRET) in your .env file."
    )

def upload_data_to_ipfs(encrypted_bytes: bytes, filename: str = "data.enc") -> str:
    """
    Upload encrypted bytes to IPFS via Pinata.
    Returns the IPFS CID string (e.g. 'QmXyz...').
    """
    url     = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = _auth_headers()

    metadata = json.dumps({"name": filename})

    files = {
        "file":            (filename, io.BytesIO(encrypted_bytes), "application/octet-stream"),
        "pinataMetadata":  (None, metadata, "application/json"),
    }

    try:
        resp = requests.post(url, files=files, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json()["IpfsHash"]

    except requests.exceptions.HTTPError as e:
        try:
            detail = e.response.json()
        except Exception:
            detail = e.response.text
        raise Exception(
            f"Pinata upload failed (HTTP {e.response.status_code}): {detail}"
        ) from e

    except requests.exceptions.RequestException as e:
        raise Exception(f"IPFS upload network error: {e}") from e

def fetch_data_from_ipfs(ipfs_hash: str) -> bytes:
    """
    Fetch raw bytes from IPFS.
    Tries Pinata gateway first, then falls back to public gateways.
    """
    last_error = None
    for gateway_tpl in _GATEWAYS:
        url = gateway_tpl.format(cid=ipfs_hash)
        try:
            resp = requests.get(url, timeout=20)
            resp.raise_for_status()
            return resp.content
        except requests.exceptions.RequestException as e:
            last_error = e
            continue

    raise Exception(
        f"Could not fetch '{ipfs_hash}' from any IPFS gateway. "
        f"Last error: {last_error}"
    )
