# TorBox per Home Assistant

Integrazione custom che mostra statistiche e download in tempo reale del tuo account [TorBox](https://torbox.app), con una card Lovelace inclusa.

## Installazione

- **HACS**: HACS → menu ⋮ → *Custom repositories* → `https://github.com/DavidinoX/ha-torbox`, tipo *Integration* → installa **TorBox**.
- **Manuale**: copia `custom_components/torbox` in `<config>/custom_components/torbox`.

Riavvia Home Assistant, poi **Impostazioni → Dispositivi e servizi → Aggiungi integrazione → TorBox** e incolla la API key (torbox.app → Settings → API).
Puoi aggiungere più account.

## Sensori

Aggiornati ogni 15 s; l'intervallo (5–3600 s) si cambia da **Impostazioni → Dispositivi e servizi → TorBox → Configura**, senza riavvio.

| Sensore | Descrizione |
|---|---|
| Piano | Free / Essential / Pro / Standard |
| Scadenza premium | data di scadenza dell'abbonamento |
| Cooldown fino a | fine del cooldown (piano free) |
| Download totali | numero di download effettuati |
| Download attivi | download in corso; l'attributo `downloads` contiene nome, tipo, stato, avanzamento, velocità, ETA, dimensione, seed e peer (solo torrent) |
| Elementi in cloud | torrent + usenet + web download presenti nell'account |
| Velocità download / upload | somma su tutti gli elementi attivi |

## Card

Stile ispirato a torbox.app (accento #04BF8A, cifre a matrice di punti, logo a cubo), tema scuro e chiaro.
La card si registra da sola: **Modifica dashboard → Aggiungi card → TorBox**. Tutto è configurabile dall'editor visuale:

| Chiave | Valori | Default |
|---|---|---|
| `device_id` | account TorBox | (obbligatorio) |
| `theme` | `auto` (segue HA), `dark`, `light` | `auto` |
| `size` | `small`, `medium`, `large`, `xlarge` (scala tutta la card) | `medium` |
| `title` | sottotitolo accanto al logo | — |
| `plain_numbers` | numeri normali invece della matrice di punti | `false` |
| `hide_header`, `hide_plan`, `hide_speed`, `hide_upload`, `hide_chart` | nascondono le singole parti | `false` |
| `chart_hours` | ampiezza del grafico, 1–24 ore | `1` |
| `hide_stats` | nasconde la riga statistiche | `false` |
| `stats` | lista ordinata fra `active_downloads`, `total_downloaded`, `cloud_items`, `premium_expires`, `plan`, `cooldown_until`, `download_speed`, `upload_speed` | i primi 4 |
| `hide_downloads`, `hide_empty` | nasconde la lista / solo quando è vuota | `false` |
| `max_downloads` | 1–50 | `10` |
| `sort` | `default`, `progress`, `speed`, `name`, `eta` | `default` |
| `hide_types` | `torrent`, `usenet`, `webdl` | nessuno |
| `hide_details` | `progress`, `type`, `state`, `seeds`, `peers`, `size`, `speed`, `eta` | nessuno |

```yaml
type: custom:torbox-card
device_id: <scelto dall'editor>
theme: dark
size: small
stats: [download_speed, active_downloads, premium_expires]
hide_chart: true
sort: progress
hide_details: [seeds, peers]
```

Nella vista a sezioni la card si adatta alle colonne scelte; con righe fisse la lista dei download scorre all'interno.
Clic su una statistica o su un download apre il dettaglio dell'entità.

## Sviluppo

- `dev/card-test.html`: galleria con 21 configurazioni, larghezze e scenari di dati (servi la cartella del repo, es. `python -m http.server`, e apri `/dev/card-test.html`). Ogni configurazione è validata contro lo schema reale dell'editor della card.
- `tests/`: test su un core Home Assistant reale con API TorBox simulata: `pip install pytest-homeassistant-custom-component home-assistant-frontend`, poi `pytest`.
