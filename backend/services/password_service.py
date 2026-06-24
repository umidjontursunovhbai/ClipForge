import hashlib
import hmac
import secrets


def create_password_hash(password: str, salt: str | None = None) -> tuple[str, str]:
    password_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), password_salt.encode(), 240_000)
    return digest.hex(), password_salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    candidate_hash, _ = create_password_hash(password, salt)
    return hmac.compare_digest(candidate_hash, password_hash)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
