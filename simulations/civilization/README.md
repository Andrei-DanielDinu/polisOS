# Flourishing-first civilization simulator

## Purpose

This is a terminal-first management game about building a society that can meet people's needs, learn quickly, and remain healthy over the long term. The opening scenario is a small Stone Age community. The simulator gives that community access to a library of future scientific knowledge, then makes it solve the hard parts of development: teaching people, producing food and materials, building infrastructure, coordinating institutions, distributing benefits fairly, and maintaining ecological and social resilience.

The game rewards reaching a human-centered Industry 5.0 era quickly **and** sustaining good life conditions. A technology era alone is never a win.

## Run from the repository root

Requires Python 3.10 or newer. No package installation or network access is needed.

```powershell
python simulations/civilization/civilization.py
```

Run the built-in strategy for a fixed number of years/cycles before opening the prompt:

```powershell
python simulations/civilization/civilization.py --auto 20 --seed 17
```

`--seed` makes the sequence of drought, illness and storm events reproducible. `--load path.json` resumes a saved state. Within the game, `save` and `load` use `civilization-save.json` by default.

### Reproducible auto-strategy example

With the current balancing rules, `--auto 100 --seed 17` reaches Human-centered Industry 5.0 at cycle 60 and satisfies the five-cycle sustainability condition at cycle 64. The resulting report shows a flourishing floor of 73.2/100, population 144, and all ten essential conditions at or above 65. This is a calibration example for the toy equations, not a forecast or evidence that the same policy would work in a real society.

## Play through the CLI

At the `polis-sim>` prompt, use:

| Command | Use |
|---|---|
| `status` | Inspect population, life conditions, stores, era, and current effort plan. |
| `strategy` | See the decision rules, next technology gate, and current advisory. |
| `map` | Inspect the eight essential systems and their minimum effort shares. |
| `allocate food=32 care=13 build=10 learn=12 make=7 safety=7 nature=8 civic=11` | Replace the plan; all shares must total 100 and respect protected floors. |
| `policy restoration` | Queue a common-store investment for the next cycle. Use `help` for the full list. |
| `advance` | Run one cycle using the current plan. |
| `auto 10` | Run ten cycles using the built-in strategy. |
| `history` | Review recent outcomes and shocks. |
| `save [path]` / `load [path]` | Save or resume a JSON game state. |
| `reset` | Restart after typing `yes`. |
| `quit` | Exit. |

One cycle is one abstract year. Era names describe a progression of capabilities rather than a historical simulation at real-world scale. The simulator does not model the dates, cultures, migrations, wars, or unequal histories of actual peoples.

## Society model

The starting community has 80 people, common food and material stores, and these tracked conditions from 0 to 100:

| Condition | Why it matters |
|---|---|
| Food security | Enough food now and reserves against a poor season. |
| Health | Preventive care and the population's ability to recover from illness. |
| Safe shelter | Protection, housing quality and capacity. |
| Learning | Teaching, practical skill, literacy and ability to absorb new knowledge. |
| Livelihood security | The community's ability to produce useful goods and support stable lives. |
| Public safety | Preparedness and ability to respond to hazards. |
| Public trust | Confidence that decisions and shared stores are handled fairly. |
| Equality and rights | Fair access to services, voice and opportunity. |
| Ecological health | Soil, water, habitat and the productive base future generations need. |
| Resilience | Ability to withstand shocks and restore essential services. |
| Infrastructure | Shared buildings, paths, water works, tools and later power systems. |
| Reliable energy access | Appears as a meaningful capability as electrical eras become available. |

The headline **flourishing floor** is the lowest of the ten essential human and ecological conditions. The report also shows their average, but a high average cannot conceal a failing condition. Infrastructure and energy are visible supporting capacities; they are not substitutes for people's health, rights or a living environment.

The game aggregates effort by work system, not by named person. Its eight allocation shares represent a small voluntary civic contribution budget, capped at four hours per week for an adult who chooses to participate. Refusal, personal care, rest and ordinary life remain outside the allocation model. The simulator does not assign individual people, create a worker ranking, or include compulsory labor, child labor, repression, conquest or extractive growth as playable strategies.

## Control algorithm

Every cycle follows:

```text
observe conditions and reserves
  → identify the weakest essential outcome and risks
  → set sector effort within protected floors
  → invest common stores in a public priority
  → produce food, materials, learning and services
  → resolve a seeded environmental/health shock
  → check the next era's knowledge and human/ecological gates
  → report the outcome and adjust next cycle
```

The autonomous policy is deliberately legible:

1. Start with a balanced baseline for food, care, shelter, learning, craft, safety, nature and civic work.
2. Keep a minimum share for every system. A manual allocation below any floor is rejected.
3. Move at most 18 percentage points of effort from sectors above their floor toward outcomes furthest below target. Food reserves receive added urgency when they are low.
4. Add a learning priority when the community's flourishing floor is stable, because the future-knowledge library makes teaching and safe implementation the main bottleneck.
5. Spend common-store units on the current weakest condition when affordable.
6. Permit only one era transition per cycle, and only when its knowledge threshold and all listed life-condition gates are met.
7. Declare success only after reaching Human-centered Industry 5.0 and keeping every essential condition at or above 65 for five consecutive cycles.

The formulas are simple game rules rather than empirical claims about real populations. They are exposed in `civilization.py` so later tuning can be reviewed rather than hidden inside an opaque optimizer.

## Era ladder

1. Stone Age: fire, stone tools, foraging and shared care.
2. Neolithic: cultivation, food storage and settlements.
3. Copper and Bronze: metallurgy, specialized craft and exchange.
4. Iron and Connected Settlements: durable tools, roads and larger civic systems.
5. Medieval Knowledge Networks: institutions, public records and engineering craft.
6. Scientific and Civic Revolution: scientific method, public education and experimentation.
7. Mechanized Industry: mechanization gated by health, safety, livelihood and ecological conditions.
8. Electricity and Mass Education: reliable power, public health and broad education.
9. Digital and Networked Systems: accountable data, automation, trust and resilience.
10. Human-centered Industry 5.0: human agency, resilient industry and ecological renewal.

Future knowledge is a head start in principles and blueprints. It does not instantly supply trained practitioners, energy, materials, public trust, safe institutions or repair capacity. Those grow through play. Era gates prevent the simulator from calling a society advanced when people or ecosystems are bearing the hidden cost.

The Industry 5.0 label follows the European Commission's three-part framing of human-centricity, sustainability and resilience. This game extends those industrial principles into its whole-society win condition; the game's era ladder and numerical thresholds are its own simulation rules, not an official Commission standard. See the [European Commission's Industry 5.0 overview](https://research-and-innovation.ec.europa.eu/research-area/industrial-research-and-innovation/industry-50_en).

## Important limits and next design work

- This is an educational toy model, not a forecast, economic model or recommended national policy.
- The population and all initial indicators are invented. Hazard probabilities and production equations are tunable placeholders.
- Defense is represented as public safety, civil preparedness and resilience. The prototype has no combat, weapons, intelligence or geopolitical adversary model.
- It does not yet model region, climate zones, migration, culture, disability, consent processes in detail, institutions, tax, trade, public finance, supply chains, or specialist labor markets.
- Industry 5.0 is a game-era label with explicit human-centered requirements, not a claim that a single score captures that concept.
- Next steps should validate the status ontology, add transparent budgets and trade, introduce multiple regions and public-service coverage, and play-test whether the automatic strategy can progress without exhausting stores or eroding rights/ecology.

## File map

- `civilization.py` — state model, transparent strategy, deterministic hazards, command interpreter and reports.
- This README — mechanics, assumptions, safeguards, and open design work.
