# polisOS

PolisOS explores how people can coordinate essential work and improve the conditions of life together.

## Civilization simulator

This branch begins a separate, terminal-first society simulator. It starts in a small Stone Age community and models a fast path through major technology eras. The win condition is sustained human flourishing: no technology milestone counts as success while essential life conditions are failing.

Read the [simulation design and mechanics](simulations/civilization/README.md), then run it with Python 3.10 or newer:

```powershell
python simulations/civilization/civilization.py
```

Try the autonomous strategy for 20 cycles:

```powershell
python simulations/civilization/civilization.py --auto 20 --seed 17
```

The simulator uses only the Python standard library. It does not connect to the PolisOS web prototype, collect personal data, or claim to forecast a real society.
