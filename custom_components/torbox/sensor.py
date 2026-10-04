"""TorBox sensors."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfDataRate
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from . import DOMAIN

PLANS = ["free", "essential", "pro", "standard"]  # index == TorBox plan id
UNKNOWN_ETA = 8640000


def _ts(value: str | None):
    return dt_util.parse_datetime(value) if value else None


def _active(data: dict) -> list[dict]:
    """Items TorBox is still downloading."""
    return [i for i in data["items"] if i.get("active") and not i.get("download_finished")]


def _speed(field: str) -> Callable[[dict], float]:
    return lambda d: sum(i.get(field) or 0 for i in d["items"] if i.get("active"))


@dataclass(frozen=True, kw_only=True)
class TorBoxSensorDescription(SensorEntityDescription):
    value_fn: Callable[[dict], Any]


SPEED = {
    "device_class": SensorDeviceClass.DATA_RATE,
    "state_class": SensorStateClass.MEASUREMENT,
    "native_unit_of_measurement": UnitOfDataRate.BYTES_PER_SECOND,
    "suggested_unit_of_measurement": UnitOfDataRate.MEGABYTES_PER_SECOND,
    "suggested_display_precision": 2,
}

SENSORS = (
    TorBoxSensorDescription(
        key="plan",
        icon="mdi:crown-outline",
        device_class=SensorDeviceClass.ENUM,
        options=PLANS,
        value_fn=lambda d: dict(enumerate(PLANS)).get(d["user"].get("plan")),
    ),
    TorBoxSensorDescription(
        key="premium_expires",
        icon="mdi:calendar-clock",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda d: _ts(d["user"].get("premium_expires_at")),
    ),
    TorBoxSensorDescription(
        key="cooldown_until",
        icon="mdi:timer-sand",
        device_class=SensorDeviceClass.TIMESTAMP,
        # only the Free plan has a cooldown; paid accounts still carry a stale timestamp
        value_fn=lambda d: _ts(d["user"].get("cooldown_until")) if d["user"].get("plan") == 0 else None,
    ),
    TorBoxSensorDescription(
        key="total_downloaded",
        icon="mdi:counter",
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda d: d["user"].get("total_downloaded"),
    ),
    TorBoxSensorDescription(
        key="active_downloads",
        icon="mdi:progress-download",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: len(_active(d)),
    ),
    TorBoxSensorDescription(
        key="cloud_items",
        icon="mdi:cloud-outline",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: len(d["items"]),
    ),
    TorBoxSensorDescription(
        key="download_speed", icon="mdi:download", value_fn=_speed("download_speed"), **SPEED
    ),
    TorBoxSensorDescription(
        key="upload_speed", icon="mdi:upload", value_fn=_speed("upload_speed"), **SPEED
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities(TorBoxSensor(entry, d) for d in SENSORS)


class TorBoxSensor(CoordinatorEntity, SensorEntity):
    _attr_has_entity_name = True
    _unrecorded_attributes = frozenset({"downloads"})  # list changes every poll, keep it out of the DB

    def __init__(self, entry: ConfigEntry, description: TorBoxSensorDescription) -> None:
        super().__init__(entry.runtime_data)
        self.entity_description = description
        self._attr_translation_key = description.key
        self._attr_unique_id = f"{entry.unique_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.unique_id)},
            name="TorBox",
            model=entry.title,
            manufacturer="TorBox",
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://torbox.app/dashboard",
        )

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        if self.entity_description.key != "active_downloads":
            return None
        return {
            "downloads": [
                {
                    "name": i.get("name"),
                    "type": i["type"],
                    "state": i.get("download_state"),
                    "progress": round((i.get("progress") or 0) * 100, 1),
                    "speed": i.get("download_speed") or 0,
                    # TorBox sends eta 8640000 (100 days) for "unknown" and size -1 while checking
                    "eta": eta if 0 < (eta := i.get("eta") or 0) < UNKNOWN_ETA else 0,
                    "size": max(i.get("size") or 0, 0),
                    "seeds": i.get("seeds"),  # torrents only, None otherwise
                    "peers": i.get("peers"),
                }
                for i in _active(self.coordinator.data)
            ]
        }
