"""TorBox integration tests on a real Home Assistant core (TorBox API mocked).

pip install pytest-homeassistant-custom-component home-assistant-frontend
pytest tests
"""
from datetime import timedelta

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from homeassistant import config_entries
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.const import CONF_API_KEY, CONF_SCAN_INTERVAL
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.util import dt as dt_util

from custom_components.torbox import API, CARD_URL, DOMAIN

USER = {"id": 7, "email": "me@example.com", "plan": 2, "premium_expires_at": "2026-12-01T00:00:00Z",
        "cooldown_until": None, "total_downloaded": 42}
TORRENTS = [
    {"name": "Ubuntu.iso", "active": True, "download_finished": False, "progress": 0.5, "download_speed": 5_000_000,
     "upload_speed": 250_000, "eta": 60, "size": 6_000_000_000, "download_state": "downloading", "seeds": 9, "peers": 3},
    {"name": "seeding", "active": True, "download_finished": True, "download_speed": 0, "upload_speed": 750_000},
]
WEBDL = [{"name": "idle", "active": False, "download_finished": False, "download_speed": 999}]


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def mock_api(aioclient_mock, status=200):
    aioclient_mock.clear_requests()
    ok = lambda data: {"success": True, "error": None, "detail": "", "data": data}  # noqa: E731
    bad = {"success": False, "error": "BAD_TOKEN", "detail": "Your token is invalid", "data": None}
    aioclient_mock.get(API + "user/me", status=status, json=ok(USER) if status == 200 else bad)
    for path, data in (("torrents", TORRENTS), ("usenet", None), ("webdl", WEBDL)):
        aioclient_mock.get(f"{API}{path}/mylist?bypass_cache=true", json=ok(data))


async def setup_entry(hass, aioclient_mock):
    mock_api(aioclient_mock)
    entry = MockConfigEntry(domain=DOMAIN, unique_id="7", title="me@example.com", data={CONF_API_KEY: "key"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_config_flow(hass, aioclient_mock):
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.FORM

    mock_api(aioclient_mock, status=403)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: "bad"})
    assert result["errors"] == {"base": "invalid_auth"}

    mock_api(aioclient_mock)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: " key "})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "me@example.com"
    assert result["data"] == {CONF_API_KEY: "key"}
    assert result["result"].unique_id == "7"
    await hass.async_block_till_done()

    # same account twice is refused
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: "key"})
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "already_configured"


async def test_sensors(hass, aioclient_mock):
    await setup_entry(hass, aioclient_mock)
    state = lambda e: hass.states.get(f"sensor.torbox_{e}")  # noqa: E731

    assert state("plan").state == "pro"
    assert state("premium_expires").state == "2026-12-01T00:00:00+00:00"
    assert state("cooldown_until").state == "unknown"
    assert state("total_downloads").state == "42"
    assert state("active_downloads").state == "1"
    assert state("cloud_items").state == "3"
    assert float(state("download_speed").state) == 5.0  # 5e6 B/s shown in MB/s, idle item ignored
    assert state("download_speed").attributes["unit_of_measurement"] == "MB/s"
    assert float(state("upload_speed").state) == 1.0
    assert state("active_downloads").attributes["downloads"] == [
        {"name": "Ubuntu.iso", "type": "torrent", "state": "downloading", "progress": 50.0, "speed": 5_000_000,
         "eta": 60, "size": 6_000_000_000, "seeds": 9, "peers": 3}
    ]


async def test_card_is_served_and_registered(hass, aioclient_mock, hass_client):
    await setup_entry(hass, aioclient_mock)
    assert any(u.startswith(CARD_URL) for u in hass.data[DATA_EXTRA_MODULE_URL].urls)
    resp = await (await hass_client()).get(CARD_URL)
    assert resp.status == 200
    assert 'customElements.define("torbox-card"' in await resp.text()


async def test_options_change_interval(hass, aioclient_mock):
    entry = await setup_entry(hass, aioclient_mock)
    assert entry.runtime_data.update_interval == timedelta(seconds=15)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(result["flow_id"], {CONF_SCAN_INTERVAL: 60})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.runtime_data.update_interval == timedelta(seconds=60)


async def test_revoked_key_makes_sensors_unavailable(hass, aioclient_mock):
    entry = await setup_entry(hass, aioclient_mock)
    mock_api(aioclient_mock, status=403)
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=20))
    await hass.async_block_till_done(wait_background_tasks=True)  # interval refreshes run as background tasks
    assert hass.states.get("sensor.torbox_plan").state == "unavailable"
    assert await hass.config_entries.async_unload(entry.entry_id)
