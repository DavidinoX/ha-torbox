"""TorBox integration: account stats, live downloads and a bundled Lovelace card."""
from __future__ import annotations

import asyncio
from datetime import timedelta
from functools import partial
import logging
from pathlib import Path
from typing import Any

import aiohttp

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_SCAN_INTERVAL, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

DOMAIN = "torbox"
VERSION = "1.2.0"  # keep in sync with manifest.json, busts the card's browser cache
API = "https://api.torbox.app/v1/api/"
CARD_URL = f"/{DOMAIN}/torbox-card.js"
# item type -> API path prefix of its "mylist" endpoint
LISTS = {"torrent": "torrents", "usenet": "usenet", "webdl": "webdl"}
DEFAULT_SCAN_INTERVAL = 15  # seconds, changeable in the integration options
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
_LOGGER = logging.getLogger(__name__)


class AuthError(Exception):
    """API key rejected."""


async def api_get(session: aiohttp.ClientSession, key: str, path: str, **params: str) -> Any:
    """GET a TorBox endpoint and return its `data` payload."""
    async with session.get(
        API + path,
        params=params,
        headers={"Authorization": f"Bearer {key}"},
        timeout=aiohttp.ClientTimeout(total=20),
    ) as resp:
        if resp.status in (401, 403):
            raise AuthError
        resp.raise_for_status()
        body = await resp.json(content_type=None)
    if not body.get("success"):
        raise aiohttp.ClientError(body.get("detail") or body.get("error"))
    return body["data"]


async def fetch_all(session: aiohttp.ClientSession, key: str) -> dict[str, Any]:
    """Account info plus every torrent/usenet/web download, tagged with its type."""
    try:
        user, *lists = await asyncio.gather(
            api_get(session, key, "user/me"),
            *(api_get(session, key, f"{p}/mylist", bypass_cache="true") for p in LISTS.values()),
        )
    except AuthError as err:
        raise UpdateFailed("TorBox rejected the API key") from err
    except (aiohttp.ClientError, TimeoutError, ValueError) as err:
        raise UpdateFailed(f"TorBox API error: {err}") from err
    items = [dict(i, type=t) for t, data in zip(LISTS, lists) for i in data or []]
    return {"user": user, "items": items}


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the Lovelace card and load it on every dashboard."""
    await hass.http.async_register_static_paths(
        # no long-lived cache: browsers revalidate, so a card-only update shows up after a reload
        [StaticPathConfig(CARD_URL, str(Path(__file__).parent / "torbox-card.js"), False)]
    )
    add_extra_js_url(hass, f"{CARD_URL}?v={VERSION}")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up a TorBox account."""
    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        config_entry=entry,
        name=DOMAIN,
        update_interval=timedelta(seconds=entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)),
        update_method=partial(fetch_all, async_get_clientsession(hass), entry.data[CONF_API_KEY]),
    )
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    entry.async_on_unload(entry.add_update_listener(_options_updated))
    await hass.config_entries.async_forward_entry_setups(entry, [Platform.SENSOR])
    return True


async def _options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Apply a new polling interval without reloading."""
    entry.runtime_data.update_interval = timedelta(seconds=entry.options[CONF_SCAN_INTERVAL])


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a TorBox account."""
    return await hass.config_entries.async_unload_platforms(entry, [Platform.SENSOR])
