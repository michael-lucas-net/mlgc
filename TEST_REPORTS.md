# 📊 MLGC Test Reports

Dieses Projekt bietet umfassende HTML-Reports für Tests und Code-Coverage.

## 🎯 Verfügbare HTML-Reports

### 1. **Test-Ergebnisse Report**

```bash
npm run test:html
```

- **Datei**: `jest_html_reporters.html`
- **Inhalt**: Detaillierte Test-Ergebnisse mit Hierarchie
- **Features**:
  - ✅ Alle Test-Cases mit Status
  - 📊 Execution Time pro Test
  - 🔍 Fehlermeldungen und Stack Traces
  - 📝 Console Output

### 2. **Code Coverage Report**

```bash
npm run test:coverage:html
```

- **Ordner**: `coverage/`
- **Hauptdatei**: `coverage/index.html`
- **Features**:
  - 📈 Statement, Branch, Function, Line Coverage
  - 🔥 Heatmap der ungetesteten Bereiche
  - 📁 Datei-spezifische Coverage-Details
  - 🎨 Farbkodierte Coverage-Visualisierung

### 3. **Vollständiger Report** (Empfohlen)

```bash
npm run test:full-report
```

- **Kombiniert**: Test-Results + Coverage
- **Dateien**:
  - `jest_html_reporters.html` (Test Details)
  - `coverage/index.html` (Coverage Overview)

## 🚀 Report-Navigation

### Test Results (`jest_html_reporters.html`)

```
MLGC Test Report
├── Test Suites Overview
│   ├── ✅ Passed: 9 Suites
│   └── 📊 Total: 117 Tests
├── Detailed Results
│   ├── 📁 CLI Tests
│   │   ├── Entry Point Tests
│   │   ├── Path Helper Tests
│   │   └── Integration Tests
│   ├── 📁 Core Tests
│   │   ├── Git Operations
│   │   └── File Operations
│   └── 📁 Utils Tests
└── Performance Metrics
```

### Coverage Report (`coverage/index.html`)

```
Coverage Summary
├── 📊 Overall: 98.29%
├── 📁 File Browser
│   ├── src/cli/ (100%)
│   ├── src/commands/ (100%)
│   ├── src/core/ (95.23%)
│   ├── src/helpers/ (96.42%)
│   └── src/utils/ (100%)
└── 🔍 Detailed File Views
    ├── Line-by-line Coverage
    ├── Uncovered Code Highlighting
    └── Branch Coverage Details
```

## 📱 Report Features

### ✨ Test Results Features

- **Interactive Navigation**: Klickbare Test-Hierarchie
- **Time Analysis**: Performance pro Test und Suite
- **Error Details**: Vollständige Stack Traces bei Fehlern
- **Console Output**: Captured logs und outputs
- **Filtering**: Filter nach Status (Pass/Fail)

### 🎨 Coverage Features

- **Visual Heatmap**: Rot = ungetestedte Bereiche
- **Sortierbare Tabellen**: Nach Coverage-Prozent sortieren
- **Drill-Down**: Von Overview zu spezifischen Dateien
- **Code Highlighting**: Syntax-Highlighting mit Coverage-Overlay
- **Branch Analysis**: IF/ELSE Branch Coverage Details

## 🛠️ Anpassung der Reports

### Test Report Konfiguration

In `package.json` unter `jest-html-reporters`:

```json
{
  "publicPath": "./test-reports",
  "filename": "test-report.html",
  "pageTitle": "MLGC Test Report",
  "includeFailureMsg": true,
  "includeSuiteFailure": true,
  "includeConsoleLog": true
}
```

### Coverage Optionen

```json
{
  "coverageReporters": [
    "html", // HTML Report
    "text", // Terminal Output
    "lcov", // IDE Integration
    "json" // Programmatic Access
  ]
}
```

## 🔄 Automatisierung

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Generate Test Reports
  run: npm run test:full-report

- name: Upload Coverage Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: |
      jest_html_reporters.html
      coverage/
```

### Watch Mode für Development

```bash
npm run test:watch    # Live Updates während Development
```

## 📂 Report-Dateien

### Generierte Dateien:

```
mlgc/
├── jest_html_reporters.html     # Test Results
├── coverage/                    # Coverage Reports
│   ├── index.html              # Coverage Overview
│   ├── lcov-report/            # Alternative Format
│   ├── clover.xml              # XML Format
│   └── coverage-final.json     # JSON Format
└── test-reports/               # Custom Reports (optional)
```

### Dateigröße & Performance:

- **Test Report**: ~3KB (schnell ladend)
- **Coverage Report**: ~100KB+ (je nach Projektgröße)
- **Load Time**: < 1 Sekunde auf modernen Browsern

## 🎯 Tipps & Best Practices

### 📈 Coverage-Ziele

- **Minimum**: 80% Coverage für Production
- **Ideal**: 90%+ Coverage
- **Fokus**: Critical Paths (CLI, Git Operations)

### 🔍 Report-Analyse

1. **Öffne Coverage Report** → Identifiziere rote Bereiche
2. **Prüfe Test Report** → Verstehe welche Tests laufen
3. **Kombiniere beide** → Finde fehlende Test-Szenarien

### ⚡ Performance-Optimierung

```bash
npm run test:debug    # Analysiere langsame Tests
npm test -- --detectOpenHandles  # Finde Memory Leaks
```

## 🎨 Screenshots

### Test Results HTML

- Grüne ✅ Checkmarks für erfolgreiche Tests
- Rote ❌ X für fehlgeschlagene Tests
- Zeitmessungen für jeden Test
- Expandierbare Test-Hierarchie

### Coverage HTML

- Grün: Gut getestete Bereiche (80%+)
- Gelb: Moderate Coverage (50-80%)
- Rot: Ungetestete Bereiche (< 50%)
- Detaillierte Zeilen-Highlighting

---

**🚀 Starte mit**: `npm run test:full-report` und öffne die generierten HTML-Dateien in deinem
Browser!
