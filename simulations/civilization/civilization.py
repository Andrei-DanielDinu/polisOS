#!/usr/bin/env python3
"""A terminal-first civilization flourishing simulator. Python standard library only."""

from __future__ import annotations

import argparse
import json
import math
import random
import shlex
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

DEFAULT_SAVE = Path(__file__).resolve().parent / "civilization-save.json"

METRIC_LABELS = {
    "food_security": "Food security",
    "health": "Health",
    "shelter": "Safe shelter",
    "education": "Learning",
    "livelihood": "Livelihood security",
    "safety": "Public safety",
    "trust": "Public trust",
    "equality": "Equality and rights",
    "ecology": "Ecological health",
    "resilience": "Resilience",
    "infrastructure": "Infrastructure",
    "energy": "Reliable energy access",
}

CRITICAL_METRICS = (
    "food_security", "health", "shelter", "education", "livelihood",
    "safety", "trust", "equality", "ecology", "resilience",
)

SECTORS = {
    "food": "Food, water and land care",
    "care": "Health and shared care",
    "build": "Shelter and infrastructure",
    "learn": "Learning and research",
    "make": "Tools, craft and production",
    "safety": "Emergency readiness and protection",
    "nature": "Ecosystem restoration",
    "civic": "Inclusive governance and mediation",
}

BASE_ALLOCATION = {
    "food": 32,
    "care": 13,
    "build": 10,
    "learn": 12,
    "make": 7,
    "safety": 7,
    "nature": 8,
    "civic": 11,
}

MIN_ALLOCATION = {
    "food": 22,
    "care": 10,
    "build": 6,
    "learn": 8,
    "make": 4,
    "safety": 5,
    "nature": 7,
    "civic": 8,
}


@dataclass(frozen=True)
class Era:
    name: str
    knowledge: float
    gates: dict[str, float]
    note: str


ERAS = (
    Era("Stone Age", 0, {}, "Fire, stone tools, foraging, shared care"),
    Era("Neolithic", 20, {"food_security": 55, "shelter": 45, "trust": 48, "ecology": 55}, "Food cultivation, storage, settlement"),
    Era("Copper and Bronze", 65, {"food_security": 58, "education": 38, "infrastructure": 32, "equality": 48}, "Metallurgy, specialized craft, exchange"),
    Era("Iron and Connected Settlements", 125, {"food_security": 60, "health": 52, "safety": 50, "education": 45}, "Durable tools, roads, larger civic systems"),
    Era("Medieval Knowledge Networks", 205, {"education": 50, "trust": 52, "equality": 52, "resilience": 48}, "Institutions, public records, engineering craft"),
    Era("Scientific and Civic Revolution", 300, {"education": 58, "health": 55, "trust": 56, "ecology": 50}, "Scientific method, public education, experimentation"),
    Era("Mechanized Industry", 410, {"livelihood": 58, "infrastructure": 55, "health": 58, "safety": 55, "ecology": 48}, "Mechanization with worker safety and pollution limits"),
    Era("Electricity and Mass Education", 535, {"education": 65, "infrastructure": 62, "health": 62, "equality": 58, "ecology": 50}, "Reliable power, public health, broad education"),
    Era("Digital and Networked Systems", 680, {"education": 70, "infrastructure": 68, "trust": 62, "equality": 62, "ecology": 54, "resilience": 60}, "Digital networks, automation, accountable data"),
    Era("Human-centered Industry 5.0", 850, {"food_security": 70, "health": 70, "shelter": 68, "education": 75, "livelihood": 68, "safety": 65, "trust": 70, "equality": 70, "ecology": 65, "resilience": 70, "infrastructure": 70, "energy": 65}, "Human agency, resilient industry, ecological renewal"),
)

POLICIES = {
    "none": (0, "No common-store investment"),
    "nutrition": (3, "Add a seasonal food reserve and improve access"),
    "care": (4, "Strengthen preventive care and shared care capacity"),
    "learning": (4, "Fund teaching, apprenticeships and shared research"),
    "restoration": (3, "Restore habitat, soil and watershed health"),
    "infrastructure": (5, "Maintain shelter, paths, water and shared tools"),
    "preparedness": (3, "Practice emergency response and mutual aid"),
    "fairness": (3, "Fund mediation, access and rights protections"),
}

POLICY_EFFECTS = {
    "nutrition": {"food_security": 1.5},
    "care": {"health": 1.7, "resilience": 0.3},
    "learning": {"education": 1.5},
    "restoration": {"ecology": 1.7, "resilience": 0.4},
    "infrastructure": {"shelter": 0.8, "infrastructure": 1.6},
    "preparedness": {"safety": 1.3, "resilience": 0.8},
    "fairness": {"trust": 1.0, "equality": 1.0},
}

SECTOR_METRICS = {
    "food": ("food_security",),
    "care": ("health", "equality"),
    "build": ("shelter", "infrastructure", "energy"),
    "learn": ("education", "energy"),
    "make": ("livelihood", "energy"),
    "safety": ("safety", "resilience"),
    "nature": ("ecology",),
    "civic": ("trust", "equality"),
}


@dataclass
class World:
    year: int = 0
    population: int = 80
    era_index: int = 0
    knowledge: float = 0.0
    food_store: float = 58.0
    material_store: float = 75.0
    common_reserve: float = 16.0
    metrics: dict[str, float] = field(default_factory=lambda: {
        "food_security": 58, "health": 58, "shelter": 48, "education": 28,
        "livelihood": 42, "safety": 52, "trust": 66, "equality": 64,
        "ecology": 78, "resilience": 46, "infrastructure": 24, "energy": 0,
    })
    allocation: dict[str, int] = field(default_factory=lambda: dict(BASE_ALLOCATION))
    pending_policy: str = "none"
    seed: int = 17
    stable_years: int = 0
    history: list[str] = field(default_factory=list)
    collapsed: bool = False

    @property
    def era(self) -> Era:
        return ERAS[self.era_index]

    @property
    def flourishing(self) -> float:
        # The weakest essential condition is the headline score; averages are also shown.
        return min(self.metrics[key] for key in CRITICAL_METRICS)

    @property
    def average_wellbeing(self) -> float:
        return sum(self.metrics[key] for key in CRITICAL_METRICS) / len(CRITICAL_METRICS)


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def format_number(value: float, decimals: int = 0) -> str:
    return f"{value:,.{decimals}f}"


def metric_bar(value: float, width: int = 14) -> str:
    filled = round(width * clamp(value) / 100)
    return "[" + "#" * filled + "." * (width - filled) + "]"


def metric_report(world: World) -> str:
    lines = []
    for key, label in METRIC_LABELS.items():
        value = world.metrics[key]
        marker = " !!" if key in CRITICAL_METRICS and value < 45 else ""
        lines.append(f"  {label:<25} {metric_bar(value)} {value:5.1f}{marker}")
    return "\n".join(lines)


def status_report(world: World) -> str:
    next_era = ERAS[world.era_index + 1] if world.era_index < len(ERAS) - 1 else None
    era_progress = 100.0 if next_era is None else min(100.0, world.knowledge / max(1, next_era.knowledge) * 100)
    next_gates_met, next_gate_gaps = gate_status(world, next_era) if next_era else (True, [])
    people_turn_need = max(1.0, world.population * 0.32)
    food_cover = world.food_store / people_turn_need
    goal = "ACHIEVED" if world.stable_years >= 5 and world.era_index == len(ERAS) - 1 else f"{world.stable_years}/5 stable years at Industry 5.0"
    lines = [
        "",
        "CIVILIZATION STATUS",
        f"  Cycle/year: {world.year}   Population: {world.population:,}   Era: {world.era.name}",
        f"  Flourishing floor: {world.flourishing:5.1f}/100   Average: {world.average_wellbeing:5.1f}/100",
        f"  Long-term goal: Reach Industry 5.0 and sustain all essential conditions >=65 for five years ({goal})",
        f"  Knowledge: {world.knowledge:,.1f}" + (f"   Next era: {next_era.name} (threshold {next_era.knowledge:.0f}; knowledge {'met' if world.knowledge >= next_era.knowledge else 'in progress'}; life gates {'ready' if next_gates_met else 'blocked'})" if next_era else "   Technology ladder complete"),
        ("  Gate gaps: " + "; ".join(next_gate_gaps)) if next_gate_gaps else f"  Next-era gate readiness: {era_progress:4.1f}% knowledge; human and ecological conditions ready",
        "",
        "PEOPLE AND LIFE CONDITIONS (0-100)",
        metric_report(world),
        "",
        "COMMON STORES",
        f"  Food reserve: {world.food_store:,.1f} units ({food_cover:,.2f} population-turns at current need)",
        f"  Building/material stock: {world.material_store:,.1f} units   Common reserve: {world.common_reserve:,.1f} units",
        f"  Next policy: {world.pending_policy} - {POLICIES[world.pending_policy][1]}",
        "",
        "VOLUNTARY COMMUNITY EFFORT (shares of a small opt-in civic contribution budget)",
    ]
    for key, label in SECTORS.items():
        lines.append(f"  {key:<10} {world.allocation[key]:>3}%  {label}")
    lines.extend([
        "  Guardrail: max 4 voluntary civic hours/week per participating adult; no child labor or compulsory assignments.",
        "",
    ])
    if world.collapsed:
        lines.append("  CRISIS: essential conditions have collapsed. Recovery is still possible with manual planning.")
    return "\n".join(lines)


def gate_status(world: World, era: Era) -> tuple[bool, list[str]]:
    missing = [f"{METRIC_LABELS[key]} {world.metrics[key]:.0f}/{required:.0f}" for key, required in era.gates.items() if world.metrics[key] < required]
    return not missing, missing


def strategy_report(world: World) -> str:
    next_era = ERAS[world.era_index + 1] if world.era_index + 1 < len(ERAS) else None
    lines = [
        "",
        "FLOURISH-FIRST STRATEGY",
        "  1. Keep food, care, shelter, learning, safety, ecology and civic participation above maintenance floors.",
        "  2. Let the weakest essential life condition drive discretionary effort; protect the other floors.",
        "  3. Invest in shared knowledge whenever people have stable food, health, rights and ecological reserves.",
        "  4. Advance an era only when its knowledge and human/ecological gates are met.",
        "  5. Treat future knowledge as blueprints, not magic: materials, training, energy, institutions and consent still take time.",
        "  6. Measure success by the weakest essential condition and five stable years, not output or technology alone.",
        "",
    ]
    if next_era:
        ready, missing = gate_status(world, next_era)
        lines.append(f"  Next era: {next_era.name} | knowledge {world.knowledge:.1f}/{next_era.knowledge:.0f} | human/ecological gates {'ready' if ready else 'not ready'}")
        if missing:
            lines.append("  Gate gaps: " + "; ".join(missing))
    else:
        lines.append("  The Industry 5.0 era is unlocked. Keep every essential condition >=65 for five consecutive years.")
    lines.append("  Current advisory: " + advice(world))
    lines.append("")
    return "\n".join(lines)


def advice(world: World) -> str:
    weakest_key = min(CRITICAL_METRICS, key=lambda key: world.metrics[key])
    weakest_label = METRIC_LABELS[weakest_key]
    people_turn_need = max(1.0, world.population * 0.32)
    if world.food_store < people_turn_need * 0.45 or world.metrics["food_security"] < 48:
        return "increase food and water effort; rebuild the common food reserve before accelerating technology."
    if world.metrics["ecology"] < 50:
        return "pause material expansion and restore watersheds, soil and habitat."
    if world.metrics["trust"] < 45 or world.metrics["equality"] < 45:
        return "use the civic and care allocations to restore voice, fair access and independent review."
    if world.metrics["health"] < 45 or world.metrics["safety"] < 45:
        return "fund preventive care and emergency readiness before expanding production."
    if world.metrics["education"] < 48:
        return "protect learning time and train apprentices before introducing complex tools."
    if world.era_index < len(ERAS) - 1:
        next_era = ERAS[world.era_index + 1]
        gates_met, missing = gate_status(world, next_era)
        if world.knowledge >= next_era.knowledge and not gates_met:
            return "technology knowledge is ready; clear the human/ecological gate(s): " + "; ".join(missing) + "."
    if world.era_index < len(ERAS) - 1 and world.flourishing >= 55:
        return f"maintain essentials and route discretionary effort to learning; {weakest_label} is the current floor."
    return f"strengthen {weakest_label}; it is currently the lowest essential condition."


def score_sector(world: World, sector: str) -> float:
    metrics = tuple(key for key in SECTOR_METRICS[sector] if key != "energy" or world.era_index >= 6)
    values = [world.metrics[key] for key in metrics]
    target = 72 if sector != "learn" else 75
    urgency = sum(max(0.0, target - value) for value in values) / len(values)
    if sector == "food":
        need = max(1.0, world.population * 0.32)
        if world.allocation["food"] < auto_food_floor(world):
            urgency += 100
        if world.food_store < need * 1.5:
            urgency += max(0, 1.5 - world.food_store / need) * 35
    if sector == "learn" and world.flourishing >= 58 and world.era_index < len(ERAS) - 1:
        urgency += 10
    if world.era_index < len(ERAS) - 1:
        next_era = ERAS[world.era_index + 1]
        for key, required in next_era.gates.items():
            if key in metrics:
                urgency += min(100, max(0, required - world.metrics[key]) * 4)
    return urgency


def auto_allocation(world: World) -> dict[str, int]:
    allocation = dict(BASE_ALLOCATION)
    protected_floors = dict(MIN_ALLOCATION)
    protected_floors["food"] = max(protected_floors["food"], auto_food_floor(world))
    # Move a bounded discretionary share toward unmet outcomes, while keeping each sector's floor.
    for _ in range(18):
        receiver = max(SECTORS, key=lambda key: (score_sector(world, key) - allocation[key] * 0.35, key == "learn"))
        donors = [key for key in SECTORS if key != receiver and allocation[key] > protected_floors[key]]
        if not donors:
            break
        donor = max(donors, key=lambda key: (allocation[key] - protected_floors[key], -score_sector(world, key)))
        allocation[donor] -= 1
        allocation[receiver] += 1
    return allocation


def auto_food_floor(world: World) -> int:
    """Protect enough food effort to cover need, with a larger buffer when stores run low."""
    productivity = 0.93 + world.era_index * 0.105 + world.metrics["education"] / 600
    need = max(1.0, world.population * 0.32)
    reserve_turns = world.food_store / need
    target_coverage = 1.05 if reserve_turns >= 1.5 else 1.15 if reserve_turns >= 0.8 else 1.30
    return min(72, max(MIN_ALLOCATION["food"], math.ceil(100 * 0.32 * target_coverage / productivity)))


def auto_policy(world: World) -> str:
    policy_for_metric = {
        "food_security": "nutrition", "health": "care", "shelter": "infrastructure",
        "education": "learning", "livelihood": "none", "safety": "preparedness",
        "trust": "fairness", "equality": "fairness", "ecology": "restoration", "resilience": "preparedness",
    }
    food_need = max(1.0, world.population * 0.32)
    if world.food_store < food_need * 1.5 and world.common_reserve >= POLICIES["nutrition"][0]:
        return "nutrition"
    weakest = min(CRITICAL_METRICS, key=lambda key: world.metrics[key])
    selected = policy_for_metric[weakest]
    cost = POLICIES[selected][0]
    if selected != "none" and world.common_reserve >= cost:
        return selected
    if world.knowledge < (ERAS[world.era_index + 1].knowledge if world.era_index + 1 < len(ERAS) else world.knowledge) and world.common_reserve >= POLICIES["learning"][0]:
        return "learning"
    return "none"


def allocate(world: World, assignments: dict[str, int]) -> None:
    unknown = set(assignments) - set(SECTORS)
    missing = set(SECTORS) - set(assignments)
    if unknown or missing:
        raise ValueError("Provide all eight sectors exactly once: " + ", ".join(SECTORS))
    if any(value < 0 or value > 100 for value in assignments.values()):
        raise ValueError("Each share must be between 0 and 100.")
    total = sum(assignments.values())
    if total != 100:
        raise ValueError(f"Shares must total 100; received {total}.")
    for key, floor in MIN_ALLOCATION.items():
        if assignments[key] < floor:
            raise ValueError(f"{key} is below its protected maintenance floor of {floor}%.")
    world.allocation = dict(assignments)


def apply_policy(world: World, policy: str) -> str:
    if policy == "none":
        return "No common-store investment this year."
    cost, description = POLICIES[policy]
    if world.common_reserve < cost:
        world.pending_policy = "none"
        return f"Policy skipped: {description} needs {cost:g} common units; only {world.common_reserve:.1f} available."
    world.common_reserve -= cost
    for key, change in POLICY_EFFECTS.get(policy, {}).items():
        world.metrics[key] = clamp(world.metrics[key] + change)
    if policy == "nutrition":
        world.food_store += world.population * 0.14
    if policy == "learning":
        world.knowledge += 10
    return f"Common investment: {description} (-{cost:g} units)."


def trigger_event(world: World) -> str | None:
    rng = random.Random(world.seed + world.year * 7919)
    risk = 0.035 + max(0.0, 60 - world.metrics["ecology"]) * 0.001 + max(0.0, 55 - world.metrics["resilience"]) * 0.001
    risk *= max(0.35, 1 - world.metrics["safety"] / 160)
    if rng.random() >= risk:
        return None
    events = ["dry season", "local illness wave", "storm damage"]
    event = rng.choice(events)
    if event == "dry season":
        loss = world.population * 0.07
        world.food_store = max(0.0, world.food_store - loss)
        world.metrics["food_security"] = clamp(world.metrics["food_security"] - 2.8)
        world.metrics["ecology"] = clamp(world.metrics["ecology"] - 0.4)
        return f"A dry season reduced stored food by {loss:.1f} units."
    if event == "local illness wave":
        impact = max(0.8, 3.2 - world.allocation["care"] * 0.08)
        world.metrics["health"] = clamp(world.metrics["health"] - impact)
        world.common_reserve = max(0.0, world.common_reserve - 1)
        return f"A local illness wave strained care services (health -{impact:.1f})."
    impact = max(0.5, 2.4 - world.allocation["safety"] * 0.1)
    world.metrics["infrastructure"] = clamp(world.metrics["infrastructure"] - impact)
    world.metrics["safety"] = clamp(world.metrics["safety"] - impact * 0.65)
    return f"A storm damaged shared infrastructure (-{impact:.1f})."


def advance_year(world: World, use_auto: bool = False) -> list[str]:
    if world.collapsed:
        return ["The community is in crisis. Adjust the plan and try recovery."]
    if use_auto:
        world.allocation = auto_allocation(world)
        world.pending_policy = auto_policy(world)
    policy_name = world.pending_policy
    policy_result = apply_policy(world, policy_name)
    world.pending_policy = "none"

    a = world.allocation
    old_population = world.population
    era_productivity = 0.93 + world.era_index * 0.105 + world.metrics["education"] / 600
    food_need = max(1.0, world.population * 0.32)
    food_output = world.population * (a["food"] / 100) * era_productivity
    food_balance = food_output - food_need
    world.food_store = clamp(world.food_store + food_balance, 0, world.population * 1.8)
    coverage = food_output / food_need
    if coverage >= 1 and world.food_store >= food_need * 0.3:
        world.metrics["food_security"] += min(1.9, 0.45 + (coverage - 1) * 4)
    else:
        shortage = max(0, 1 - coverage)
        reserve_danger = 1.0 if world.food_store < food_need * 0.1 else 0.0
        world.metrics["food_security"] -= min(5.0, 0.5 + shortage * 7 + reserve_danger * 1.5)

    world.metrics["health"] += (a["care"] - 12) * 0.095 + (world.metrics["food_security"] - 55) * 0.012
    world.metrics["shelter"] += (a["build"] - 8) * 0.085 + (world.metrics["infrastructure"] - 40) * 0.004
    world.metrics["education"] += (a["learn"] - 7) * 0.11 + max(0, world.metrics["health"] - 50) * 0.002
    world.metrics["livelihood"] += (a["make"] - 5) * 0.12 + world.era_index * 0.06 + (world.metrics["food_security"] - 55) * 0.006
    world.metrics["safety"] += (a["safety"] - 6) * 0.105 + (world.metrics["resilience"] - 50) * 0.004
    world.metrics["trust"] += (a["civic"] - 8) * 0.11 + 0.15
    world.metrics["equality"] += (a["care"] - 12) * 0.035 + (a["civic"] - 8) * 0.045
    ecological_pressure = max(0, a["build"] + a["make"] - 22) * 0.035
    modern_pressure = max(0, world.era_index - 5) * max(0, a["make"] - 6) * 0.018
    world.metrics["ecology"] += (a["nature"] - 5) * 0.115 - ecological_pressure - modern_pressure
    world.metrics["resilience"] += (a["safety"] + a["nature"] - 12) * 0.055 + (world.metrics["infrastructure"] - 40) * 0.003

    material_output = (a["build"] * 0.13 + a["make"] * 0.20) * (1 + world.era_index * 0.11)
    material_maintenance = 1.0 + world.population * 0.003
    world.material_store = clamp(world.material_store + material_output - material_maintenance, 0, world.population * 2.8)
    build_factor = 0.35 if world.material_store < 3 else 1.0
    infrastructure_gain = (max(0, a["build"] - 6) * 0.17 + max(0, a["make"] - 4) * 0.08) * (1 + world.era_index * 0.03) - 0.25
    world.metrics["infrastructure"] += infrastructure_gain * build_factor

    learning_multiplier = 1 + world.metrics["education"] / 100
    foresight_multiplier = 2.3  # Future scientific principles are known; implementation capacity is not.
    world.knowledge += (a["learn"] * 0.60 + 1.2) * learning_multiplier * foresight_multiplier

    industrial_surplus = max(0, a["make"] - 4) * 0.17 + world.era_index * 0.28
    world.common_reserve = min(9999, world.common_reserve + industrial_surplus)

    if world.era_index >= 6:
        world.metrics["energy"] += max(0.1, (a["build"] + a["make"] + a["learn"] - 16) * 0.08)
    for key in world.metrics:
        world.metrics[key] = clamp(world.metrics[key])

    event = trigger_event(world)
    if event:
        world.history.append(f"Year {world.year + 1}: {event}")

    world.year += 1
    new_era = None
    if world.era_index + 1 < len(ERAS):
        candidate = ERAS[world.era_index + 1]
        gates_met, _ = gate_status(world, candidate)
        if world.knowledge >= candidate.knowledge and gates_met:
            world.era_index += 1
            new_era = world.era.name

    if world.metrics["food_security"] >= 55 and world.metrics["health"] >= 50 and world.metrics["shelter"] >= 42:
        world.population += max(1, math.floor(world.population * 0.008))
    elif world.metrics["food_security"] < 25 or world.metrics["health"] < 25:
        world.population = max(1, world.population - max(1, math.ceil(world.population * 0.018)))

    if all(world.metrics[key] >= 65 for key in CRITICAL_METRICS) and world.era_index == len(ERAS) - 1:
        world.stable_years += 1
    else:
        world.stable_years = 0
    world.collapsed = world.population < 10 or any(world.metrics[key] < 8 for key in ("food_security", "health", "trust", "ecology"))

    record = f"Year {world.year}: population {old_population:,}->{world.population:,}; flourishing floor {world.flourishing:.1f}; {world.era.name}."
    if new_era:
        record += f" Era advanced to {new_era}."
    if policy_result:
        record += " " + policy_result
    world.history.append(record)
    return [record, *([event] if event else [])]


def command_help() -> str:
    return """
Commands
  status                     Show people, essential conditions, common stores and current plan.
  strategy                   Show the guardrailed flourishing-first algorithm and next-era gates.
  map                        Show the eight essential work systems and their protected floors.
  allocate food=32 care=13 build=10 learn=12 make=7 safety=7 nature=8 civic=11
                             Replace the plan. Shares must total 100 and respect every floor.
  policy nutrition|care|learning|restoration|infrastructure|preparedness|fairness|none
                             Queue one shared-store investment for the next year.
  advance                    Run one year using your current plan.
  auto [years]               Run the transparent auto-strategy for N years (default 1).
  history                    Show the latest events and year-end reports.
  save [path]                Save a JSON game state (default: civilization-save.json).
  load [path]                Load a JSON game state (default: civilization-save.json).
  reset                      Start over (asks you to type yes).
  help                       Show this guide.
  quit                       Exit.
""".strip()


def map_report() -> str:
    lines = ["", "CIVILIZATION SYSTEMS - PROTECTED MAINTENANCE FLOORS"]
    for key, label in SECTORS.items():
        lines.append(f"  {key:<10} {label:<40} min {MIN_ALLOCATION[key]:>2}%")
    lines.extend([
        "",
        "Essential outcomes: food security, health, shelter, learning, livelihood, safety, trust, equality, ecology and resilience.",
        "System rule: tech, trade, output and population growth cannot compensate for a broken essential outcome.",
        "",
    ])
    return "\n".join(lines)


def save_world(world: World, path: Path) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(asdict(world), indent=2), encoding="utf-8")
    return f"Saved year {world.year} to {path.resolve()}"


def load_world(path: Path) -> World:
    raw: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    return World(
        year=int(raw.get("year", 0)), population=int(raw.get("population", 80)),
        era_index=max(0, min(len(ERAS) - 1, int(raw.get("era_index", 0)))),
        knowledge=float(raw.get("knowledge", 0)), food_store=float(raw.get("food_store", 58)),
        material_store=float(raw.get("material_store", 75)), common_reserve=float(raw.get("common_reserve", 16)),
        metrics={key: clamp(float(raw.get("metrics", {}).get(key, 50))) for key in METRIC_LABELS},
        allocation={key: int(raw.get("allocation", {}).get(key, BASE_ALLOCATION[key])) for key in SECTORS},
        pending_policy=raw.get("pending_policy", "none") if raw.get("pending_policy", "none") in POLICIES else "none",
        seed=int(raw.get("seed", 17)), stable_years=int(raw.get("stable_years", 0)),
        history=list(raw.get("history", [])), collapsed=bool(raw.get("collapsed", False)),
    )


def parse_allocation(arguments: list[str]) -> dict[str, int]:
    result: dict[str, int] = {}
    for item in arguments:
        if "=" not in item:
            raise ValueError(f"Expected sector=share, got {item!r}.")
        key, value = item.split("=", 1)
        if key not in SECTORS:
            raise ValueError(f"Unknown sector {key!r}.")
        if key in result:
            raise ValueError(f"Repeated sector {key!r}.")
        result[key] = int(value)
    return result


def run_auto(world: World, years: int, print_each: bool = True) -> None:
    for _ in range(max(0, years)):
        if world.stable_years >= 5 and world.era_index == len(ERAS) - 1:
            print("Long-term flourishing goal achieved; auto-run stopped.")
            break
        result = advance_year(world, use_auto=True)
        if print_each:
            print("\n" + "\n".join(result))
            print(f"  Plan: " + " ".join(f"{key}={world.allocation[key]}" for key in SECTORS))
            print(f"  Recommendation: {advice(world)}")
        if world.collapsed:
            print("Auto-run stopped at societal crisis; human review and recovery planning required.")
            break
    print(status_report(world))


def interactive(seed: int, auto_years: int = 0, load_path: Path | None = None) -> int:
    world = load_world(load_path) if load_path else World(seed=seed)
    print("POLISOS - CIVILIZATION SIMULATOR")
    print("Stone Age start - future knowledge library enabled - human flourishing is the win condition")
    print("This is a model, not a forecast. Community effort is voluntary and bounded; the system never assigns individual people.")
    print("Type 'help' for commands.\n")
    print(status_report(world))
    if auto_years:
        run_auto(world, auto_years)
    while True:
        try:
            raw = input("\npolis-sim> ")
        except (EOFError, KeyboardInterrupt):
            print("\nSession ended.")
            return 0
        try:
            parts = shlex.split(raw)
            if not parts:
                continue
            command, *args = parts
            command = command.lower()
            if command in ("quit", "exit", "q"):
                print("Session ended.")
                return 0
            if command == "help":
                print(command_help())
            elif command == "status":
                print(status_report(world))
            elif command in ("strategy", "advice"):
                print(strategy_report(world))
            elif command == "map":
                print(map_report())
            elif command == "allocate":
                allocate(world, parse_allocation(args))
                print("Plan accepted. Shares sum to 100% and all maintenance floors are protected.")
            elif command == "policy":
                if len(args) != 1 or args[0] not in POLICIES:
                    raise ValueError("Choose one of: " + ", ".join(POLICIES))
                world.pending_policy = args[0]
                cost = POLICIES[args[0]][0]
                print(f"Queued {args[0]} (cost {cost:g}; common reserve {world.common_reserve:.1f}).")
            elif command == "advance":
                print("\n".join(advance_year(world)))
                print("Recommendation: " + advice(world))
                print(status_report(world))
            elif command == "auto":
                years = int(args[0]) if args else 1
                run_auto(world, years)
            elif command == "history":
                print("\n".join(world.history[-12:]) if world.history else "No years completed.")
            elif command == "save":
                path = Path(args[0]) if args else DEFAULT_SAVE
                print(save_world(world, path))
            elif command == "load":
                path = Path(args[0]) if args else DEFAULT_SAVE
                world = load_world(path)
                print(status_report(world))
            elif command == "reset":
                confirmation = input("Reset all in-memory progress? Type yes: ").strip().lower()
                if confirmation == "yes":
                    world = World(seed=seed)
                    print(status_report(world))
                else:
                    print("Kept current civilization.")
            else:
                print("Unknown command. Type 'help'.")
        except (ValueError, OSError, json.JSONDecodeError) as error:
            print(f"Command error: {error}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a flourishing-first civilization simulation in the terminal.")
    parser.add_argument("--seed", type=int, default=17, help="Deterministic hazard seed (default: 17).")
    parser.add_argument("--auto", type=int, default=0, metavar="YEARS", help="Run the autonomous flourishing-first strategy for N years before opening the prompt.")
    parser.add_argument("--load", type=Path, help="Load a saved JSON civilization before starting.")
    args = parser.parse_args()
    if args.auto < 0:
        parser.error("--auto must be zero or greater")
    return interactive(args.seed, args.auto, args.load)


if __name__ == "__main__":
    sys.exit(main())
