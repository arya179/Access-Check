import socket
import ipaddress
import urllib.parse
from typing import Tuple, Optional

class SecurityValidationError(ValueError):
    """Raised when a URL violates SSRF, private network, or protocol policies."""
    pass

def is_ip_private_or_restricted(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """
    Checks if an IP address belongs to private, loopback, link-local, multicast,
    reserved, or carrier-grade NAT ranges.
    """
    return (
        ip.is_private or
        ip.is_loopback or
        ip.is_link_local or
        ip.is_multicast or
        ip.is_reserved or
        ip.is_unspecified
    )

def validate_and_resolve_url(raw_url: str) -> Tuple[str, str]:
    """
    Validates target URL:
    1. Checks HTTP/HTTPS protocol scheme.
    2. Parses host and validates against SSRF / localhost.
    3. Resolves DNS hostname to IP address.
    4. Enforces that resolved IP is public and not an internal network destination.
    Returns: (cleaned_url, resolved_ip)
    Raises: SecurityValidationError if URL is unsafe.
    """
    if not raw_url:
        raise SecurityValidationError("URL cannot be empty")

    parsed = urllib.parse.urlparse(raw_url.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        raise SecurityValidationError(f"Invalid URL scheme '{parsed.scheme}'. Only http:// and https:// are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise SecurityValidationError("Target URL must have a valid hostname.")

    hostname_lower = hostname.lower()

    # Block obvious local names
    blocked_hosts = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "local", "internal", "intranet", "metadata.google.internal"}
    if hostname_lower in blocked_hosts or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        raise SecurityValidationError(f"Access to host '{hostname}' is restricted (internal/private network policy).")

    # Resolve IP addresses (handles IPv4 and IPv6)
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
        if not addr_info:
            raise SecurityValidationError(f"Could not resolve hostname '{hostname}'.")

        resolved_ips = []
        for entry in addr_info:
            sockaddr = entry[4]
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            if is_ip_private_or_restricted(ip_obj):
                raise SecurityValidationError(
                    f"Destination IP '{ip_str}' resolved for '{hostname}' is a private or internal network address. Audits on internal addresses are forbidden."
                )
            resolved_ips.append(ip_str)

        primary_ip = resolved_ips[0]
    except socket.gaierror as e:
        raise SecurityValidationError(f"Failed to resolve hostname '{hostname}': {str(e)}")

    return parsed.geturl(), primary_ip

