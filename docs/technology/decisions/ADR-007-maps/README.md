# ADR 007 Maps and Tile Delivery

## Status

Open candidate: MapLibre for rendering with OpenStreetMap-derived data. Production tile provider or self-hosted tile infrastructure is not selected.

## License

MapLibre and mapping/data products have separate licenses. OpenStreetMap data is available under ODbL with attribution requirements ([copyright and license](https://www.openstreetmap.org/copyright)). Review the exact renderer, style, geocoder, fonts, and data licenses before deployment.

## Hosting and operations cost

Budget geocoding, tile generation or provider service, bandwidth, caching, storage, updates, attribution, and map operations. OpenStreetMap community tile servers are not a free production map API and have a usage policy ([tile usage policy](https://operations.osmfoundation.org/policies/tiles/)).

## Security

Location reports can expose homes, vulnerable sites, or sensitive infrastructure. Collect location only when needed, let contributors choose precision, strip image metadata, restrict sensitive layers, and review geocoding providers’ retention and logging.

## Interoperability

Use standard geospatial formats such as GeoJSON and documented coordinate reference systems. Keep features and domain records separate from rendered map tiles; preserve source attribution and timestamp.

## Migration

Abstract tile sources and geocoding providers. Preserve source data and style definitions in portable formats; support a list or table alternative for accessibility. Plan for provider change, offline maps, and tile-cache replacement.

## Open questions

MapLibre web package selection; tile provider or self-hosted option; geocoding; Romanian address sources; sensitive location rules; accessibility and offline support.

