# ADR 009 Obsidian and Documentation

## Status

Accepted: Obsidian may be used locally as the authoring interface; portable Markdown in Git is the source of truth. No Obsidian paid service or community plugin is required.

## Decision

Organize the repository as a plain Markdown vault with README chapter files, relative links, Mermaid diagrams, and optional JSON Canvas. GitHub can render Mermaid in Markdown ([GitHub diagram support](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)). Canvas follows the [JSON Canvas specification](https://jsoncanvas.org/spec/1.0/) and remains supplemental.

## License

Obsidian is free to use but proprietary under its current license overview ([Obsidian license](https://obsidian.md/es/license)). Its use is optional; all content remains editable without it. This project’s documentation content can have a separate repository license once selected.

## Hosting and operations cost

Local authoring has no required subscription. Git hosting, backups, review, maintenance and archival still have costs. Paid Sync and Publish are not assumptions.

## Security

Vault settings avoid storing credentials. Plugins are not required; any future plugin needs separate review for source, license, permissions, update channel, and data access. Sensitive source material should not be committed without classification review.

## Interoperability

Use CommonMark-compatible Markdown, relative paths, Mermaid source, standard JSON Canvas, and ordinary image formats only when source assets are retained. Avoid proprietary databases and plugin-only syntax in canonical content.

## Migration

Open the vault in any Markdown editor; retain Git history, links and diagram source. If wiki links are unsupported elsewhere, filenames and relative paths remain available. Export Canvas text into Markdown when it becomes important.

## Open questions

Repository content license; whether the root repo is the Obsidian vault or docs subfolder; future diagram rendering checks; plugin review process.

