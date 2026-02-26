# Lineup-Berlin

Minimales Python-Projekt mit **Python 3.12** und lokaler Virtual Environment (`.venv`).
Diese Anleitung gilt nur fuer **Windows**.

## Voraussetzungen

- Installiertes Python **3.12**
- Python Launcher `py`

## Projekt starten

### 1. Venv erstellen (PowerShell)

```powershell
py -3.12 -m venv .venv
```

### 2. Venv aktivieren

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Optional: Tools aus `pyproject.toml` installieren

```powershell
python -m pip install --upgrade pip
pip install -e .[dev]
```

### 4. App starten

```powershell
python main.py
```

Erwartete Ausgabe:

```text
Hello World
```

## Venv verlassen

```powershell
deactivate
```

## Naechster Start (ab dann immer)

Wenn die Umgebung bereits einmal erstellt wurde:

1. Ins Projektverzeichnis wechseln
2. Venv aktivieren
3. App starten

```powershell
.\.venv\Scripts\Activate.ps1
python main.py
```
