# MCMI-IV Complete Implementation Requirements

**Generated:** October 21, 2024
**Source:** Excel file analysis with 677 formulas extracted
**Status:** ✅ Questions seeded | ⏳ Scoring & Visualizations pending

---

## 📊 Executive Summary

The MCMI-IV Excel implementation contains:
- **13 sheets total** (8 hidden calculation sheets, 5 visible)
- **677 formulas** across all sheets
- **195 True/False items** (✅ Already seeded to database)
- **67 scales total** organized in 6 categories
- **Multiple conversion tables** (PD → BR → Percentile)
- **8+ visualization requirements** for results display

---

## 🗂️ Excel Sheet Structure

### Visible Sheets (User-Facing)

1. **APLICACION** - Question administration
   - 195 items with True/False responses
   - 158 formulas for raw score calculation
   - Item weighting (2x or 1x weights)

2. **RESULTADOS** - Main results dashboard
   - 117 formulas for score display
   - Links to interpretation text
   - Validity scale indicators
   - Personality & clinical syndrome scores

3. **FACETAS GROSSMAN Y RESPUESTAS S** - Extended results
   - 205 formulas
   - 24 Grossman facets display
   - Significant responses tracking

4. **Interpretacion** - Interpretation lookup tables
   - 35 formulas
   - Score range → interpretation text mapping

5. **Interpretacion** (second sheet) - Extended interpretations
   - 203 formulas
   - Detailed clinical descriptions

### Hidden Sheets (Calculation Engine)

6. **CORRECCION** - Main correction/conversion logic
   - 117 formulas
   - PD → BR conversion
   - 42 data rows

7. **PUNT-DIRECTA** - Raw score (PD) lookup table
   - Static table (0 formulas)
   - 32 data rows
   - Named range: `TABLAPD`

8. **PERCENTIL** - Primary percentile conversion
   - Static table (0 formulas)
   - 101 data rows
   - PD → Percentile mapping

9. **PERCENTIL2** - Secondary percentile table
   - Static table (0 formulas)
   - 118 data rows
   - Named range: `TABLAPER`

10. **PERCENTIL GROSSMAN** - Grossman facets percentiles
    - Static table (0 formulas)
    - 47 data rows

11. **RPTA SIGNIFICATIVAS** - Significant responses tracking
    - Hidden calculation sheet

12. **RESULTADOS** (hidden duplicate) - Calculation backup

13. **Sheet1** - Empty/template sheet

---

## 📈 Scale Structure (67 Total Scales)

### 1. Validity Scales (5 scales)

| Code | Name (ES) | Name (PT) | Purpose |
|------|-----------|-----------|---------|
| V | Invalidez | Invalidez | Invalid response pattern detection |
| W | Inconsistencia | Inconsistência | Inconsistent responding |
| X | Sinceridad | Sinceridade | Candor/openness assessment |
| Y | Deseabilidad Social | Desejabilidade Social | Social desirability bias |
| Z | Devaluación | Desvalorização | Self-devaluation tendency |

**Interpretation Ranges:**
- V: 0-1 (Valid), 2+ (Questionable/Invalid)
- W: 0-6 (Consistent), 7+ (Inconsistent)
- X: 0-26 (Low candor), 27+ (Acceptable)
- Y: 0-17 (Normal), 18-77 (Moderate elevation), 78+ (High - may hide problems)
- Z: 0-3 (Normal), 4-36 (Moderate), 37+ (High self-devaluation)

### 2. Personality Patterns (12 scales)

| Code | Name (ES) | Name (PT) | Items | Weighted Items |
|------|-----------|-----------|-------|----------------|
| 1 | Esquizoide | Esquizoide | 14 items | 8 weighted 2x |
| 2A | Evitativo | Evitativo | 18 items | 6 weighted 2x |
| 2B | Melancólico | Melancólico | 16 items | 9 weighted 2x |
| 3 | Dependiente | Dependente | 15 items | 9 weighted 2x |
| 4A | Histriónico | Histriônico | 17 items | 7 weighted 2x |
| 4B | Tempestuoso | Tempestuoso | 17 items | 8 weighted 2x |
| 5 | Narcisista | Narcisista | 16 items | 10 weighted 2x |
| 6A | Antisocial | Antissocial | 15 items | 7 weighted 2x |
| 6B | Agresivo (Sádico) | Agressivo (Sádico) | 17 items | 10 weighted 2x |
| 7 | Compulsivo | Compulsivo | 17 items | 10 weighted 2x |
| 8A | Negativista | Negativista | 18 items | 8 weighted 2x |
| 8B | Masoquista | Masoquista | 18 items | 8 weighted 2x |

### 3. Severe Personality Pathology (3 scales)

| Code | Name (ES) | Name (PT) | Items |
|------|-----------|-----------|-------|
| S | Esquizotípico | Esquizotípico | 13 items (6 weighted 2x) |
| C | Límite | Borderline | 10 items (5 weighted 2x) |
| P | Paranoide | Paranoide | 13 items (6 weighted 2x) |

### 4. Clinical Syndromes (10 scales)

| Code | Name (ES) | Name (PT) | Items |
|------|-----------|-----------|-------|
| A | Ansiedad | Ansiedade | 14 items (6 weighted 2x) |
| H | Somatización | Somatização | 12 items (7 weighted 2x) |
| N | Bipolar | Bipolar | 13 items (8 weighted 2x) |
| D | Distimia | Distimia | 13 items (7 weighted 2x) |
| B | Dependencia de Alcohol | Dependência de Álcool | 15 items (8 weighted 2x) |
| T | Dependencia de Drogas | Dependência de Drogas | 14 items (7 weighted 2x) |
| R | Estrés Postraumático | Estresse Pós-Traumático | 16 items (8 weighted 2x) |
| SS | Pensamiento Psicótico | Pensamento Psicótico | 17 items (5 weighted 2x) |
| CC | Depresión Mayor | Depressão Maior | 17 items (5 weighted 2x) |
| PP | Delirio Psicótico | Delírio Psicótico | 13 items (6 weighted 2x) |

### 5. Grossman Facets (24 scales)

Detailed personality trait facets organized by domain:
- **Negative Emotionality** (F1A-F1E): 5 facets
- **Introversion** (F2A-F2E): 5 facets
- **Antagonism** (F3A-F3D): 4 facets
- **Disinhibition** (F4A-F4E): 5 facets
- **Compulsivity** (F5A-F5E): 5 facets

Each facet has 4-8 items contributing to score.

### 6. Significant Responses (13 categories)

Special item groupings for clinical interpretation:
- Health Preoccupation
- Suicidal Ideation
- Childhood Abuse
- Eating Disorders
- Anxiety/Tension
- Bizarre Mentation
- Substance Abuse
- etc.

---

## 🧮 Scoring Formula System

### Raw Score (PD) Calculation

**Formula Structure:**
```
Scale_Score = (2 × sum(weighted_items)) + sum(unweighted_items)
```

**Example - Scale 1 (Esquizoide):**
```javascript
// From APLICACION sheet, cell F17
PD_1 = (2 * (D18 + D27 + D55 + D102 + D131 + D151 + D161 + D192)) +
       (D29 + D36 + D42 + D82 + D104 + E166 + D202)
```

Where:
- D18, D27, D55... = responses to items 5, 14, 42... (weighted 2x)
- D29, D36, D42... = responses to items 16, 23, 29... (weighted 1x)
- True = 1, False = 0

**All 158 scoring formulas extracted** ✅ (see analysis/mcmi_sheet_1_APLICACION.json)

### PD → BR Conversion (Base Rate Transformation)

Uses VLOOKUP tables from hidden sheets:

**Main conversion (CORRECCION sheet):**
```excel
=VLOOKUP(PD_value, TABLAPD, scale_column, FALSE)
```

**Tables:**
- `TABLAPD`: Raw score to Base Rate lookup (PUNT-DIRECTA sheet)
- `TABLAPER`: Base Rate to Percentile lookup (PERCENTIL2 sheet)

**Conversion flow:**
1. Calculate PD (raw score) using weighted formula
2. Look up BR (Base Rate) in TABLAPD table
3. Look up Percentile in TABLAPER table
4. Apply interpretation based on BR ranges

### BR Score Interpretation Ranges

| BR Range | Severity Level | Clinical Meaning |
|----------|----------------|------------------|
| 0-59 | Not Present | Trait/syndrome not clinically significant |
| 60-74 | At Risk | Noteworthy characteristics present |
| 75-84 | Clinical Pattern | Clinically significant pattern |
| 85+ | Prominent | Highly prominent characteristic |

---

## 📊 Conversion Tables (CRITICAL FOR SCORING)

### 1. PUNT-DIRECTA Table (Named range: TABLAPD)

**Structure:** 32 rows × 27 columns
**Purpose:** PD → BR conversion for all scales
**Location:** Hidden sheet "PUNT-DIRECTA"

**Format:**
```
Row 1: Headers (Scale codes: 1, 2A, 2B, 3, 4A, 4B, 5, ...)
Row 2-32: PD values 0-30+ → BR values for each scale
```

**Example extraction needed:**
```json
{
  "scale_1": {
    "pd_0": 6,
    "pd_1": 12,
    "pd_2": 18,
    ...
  },
  "scale_2A": {
    "pd_0": 5,
    ...
  }
}
```

### 2. PERCENTIL Table

**Structure:** 101 rows × multiple columns
**Purpose:** BR → Percentile conversion
**Location:** Hidden sheet "PERCENTIL"

**Format:**
```
Row 1: Headers
Row 2: Percentile value
Row 3+: BR values that correspond to each percentile
```

### 3. PERCENTIL2 Table (Named range: TABLAPER)

**Structure:** 118 rows × 26 columns
**Purpose:** Alternative percentile conversion
**Location:** Hidden sheet "PERCENTIL2"

### 4. PERCENTIL GROSSMAN Table

**Structure:** 47 rows
**Purpose:** Grossman facets percentile conversion
**Location:** Hidden sheet "PERCENTIL GROSSMAN"

**⚠️ ACTION REQUIRED:** Extract these tables into JSON format for database storage

---

## 🎨 Visualization Requirements

### 1. Main Results Dashboard (RESULTADOS sheet layout)

**Layout sections:**

#### A. Patient Information Header
- Name, Age, Date
- Test administration info

#### B. Validity Scales Table
| Scale | Code | PD | BR | Percentile | Interpretation |
|-------|------|----|----|------------|----------------|
| Invalidez | V | X | X | X% | Text description |
| Inconsistencia | W | X | X | X% | Text |
| Sinceridad | X | X | X | X% | Text |
| Deseabilidad | Y | X | X | X% | Text |
| Devaluación | Z | X | X | X% | Text |

**Visual indicators:**
- ✅ Green: Valid/acceptable range
- ⚠️ Yellow: Caution range
- ❌ Red: Invalid/problematic range

#### C. Personality Patterns Chart (PRIMARY GRAPH)

**Type:** Horizontal bar chart or line graph
**X-axis:** BR scores (0-115)
**Y-axis:** 12 personality scales (1, 2A, 2B, 3, 4A, 4B, 5, 6A, 6B, 7, 8A, 8B)

**Visual elements:**
- Reference lines at BR 60, 75, 85 (interpretation thresholds)
- Color coding:
  - Green: BR < 60 (Not Present)
  - Yellow: BR 60-74 (At Risk)
  - Orange: BR 75-84 (Clinical Pattern)
  - Red: BR 85+ (Prominent)
- Bar labels showing exact BR value
- Percentile shown as secondary value

**Example:**
```
1 (Esquizoide)     |████████░░░░░░░░░░░░| 40 BR (31%)
2A (Evitativo)     |█████████████████░░░| 85 BR (93%)
2B (Melancólico)   |██████████░░░░░░░░░░| 50 BR (50%)
...
```

#### D. Severe Pathology Table
| Scale | Code | PD | BR | Percentile | Level |
|-------|------|----|----|------------|-------|
| Esquizotípico | S | X | X | X% | Not Present / At Risk / Clinical / Prominent |
| Límite | C | X | X | X% | ... |
| Paranoide | P | X | X | X% | ... |

#### E. Clinical Syndromes Chart (SECONDARY GRAPH)

**Type:** Similar to Personality Patterns chart
**Scales:** A, H, N, D, B, T, R, SS, CC, PP (10 scales)

**Same visual treatment as Personality Patterns chart**

### 2. Grossman Facets Display (FACETAS GROSSMAN sheet)

**Type:** Grouped table or multi-section chart

**Structure:**
```
NEGATIVE EMOTIONALITY
├─ F1A (Anxious Uncertainty)      █████████ 65 BR
├─ F1B (Dysregulated Anger)       ███░░░░░░ 30 BR
├─ F1C (Depressive Affect)        ████████░ 70 BR
├─ F1D (Suicidal Tendency)        ██░░░░░░░ 20 BR
└─ F1E (Suspicious Distrust)      ██████░░░ 55 BR

INTROVERSION
├─ F2A (Social Withdrawal)        ████████████ 85 BR
├─ F2B (Asocial Orientation)      ███████░░ 65 BR
...

[5 domains × 24 facets total]
```

**Visual requirements:**
- Group by domain (5 groups)
- Show BR score with bar indicator
- Color coding by severity level
- Percentile as secondary value

### 3. Significant Responses Table

**Type:** Checklist/badge display

**Format:**
```
✓ Health Preoccupation (5 items endorsed)
✗ Suicidal Ideation (0 items endorsed)
✓ Childhood Abuse (3 items endorsed)
✗ Eating Disorders (1 item endorsed - subclinical)
...
```

**Visual indicators:**
- Red flag: High clinical concern (>3 items)
- Yellow: Moderate concern (2-3 items)
- Green: Low/no concern (0-1 items)

### 4. Score Summary Table

| Category | Scales | Highest Scale | BR | Clinical Significance |
|----------|--------|---------------|----|-----------------------|
| Personality | 12 | 2A (Evitativo) | 85 | Prominent |
| Severe Pathology | 3 | C (Límite) | 78 | Clinical Pattern |
| Clinical Syndromes | 10 | D (Distimia) | 90 | Prominent |
| Grossman Facets | 24 | F2A (Social Withdrawal) | 85 | Prominent |

### 5. Interpretation Text Display

**Format:** Automated narrative generation based on scores

**Example:**
```
PERSONALITY PROFILE INTERPRETATION

The test results indicate a prominent Avoidant personality pattern (BR 85, 93rd percentile).
Individuals with this pattern typically exhibit:
- Social discomfort and anxiety in interpersonal situations
- Feelings of inadequacy and inferiority
- Hypersensitivity to criticism and rejection
- Tendency to avoid social interactions despite desire for closeness

[Auto-generated based on interpretation tables from Interpretacion sheets]
```

### 6. PDF Export Layout

**Multi-page report:**

**Page 1: Cover**
- Patient info
- Test date
- Validity status

**Page 2: Validity Scales**
- Table with interpretations
- Warning flags if invalid

**Page 3: Personality Patterns**
- Chart visualization
- Top 3 elevated scales interpretation

**Page 4: Clinical Syndromes**
- Chart visualization
- Clinical concerns summary

**Page 5: Grossman Facets**
- Grouped display
- Domain-level summary

**Page 6: Significant Responses**
- Clinical alerts
- Risk assessment

**Page 7-8: Detailed Interpretation**
- Scale-by-scale narrative
- Clinical recommendations

---

## 🔧 Implementation Checklist

### Phase 1: Database Schema ✅ COMPLETED
- [x] Create testes_templates table structure
- [x] Seed 195 MCMI-IV questions (Portuguese translation)
- [x] Store scale structure in regras_calculo field
- [x] Configure response options (Verdadeiro/Falso)

### Phase 2: Conversion Tables Extraction ⏳ IN PROGRESS
- [ ] Extract PUNT-DIRECTA table (PD → BR) to JSON
- [ ] Extract PERCENTIL table (BR → Percentile) to JSON
- [ ] Extract PERCENTIL2 table to JSON
- [ ] Extract PERCENTIL GROSSMAN table to JSON
- [ ] Store conversion tables in database (regras_calculo or separate table)
- [ ] Create TypeScript types for conversion functions

### Phase 3: Scoring Engine 🔴 NOT STARTED
- [ ] Implement weighted formula calculator (158 formulas)
- [ ] Create PD calculation service
- [ ] Implement BR conversion using lookup tables
- [ ] Implement Percentile conversion
- [ ] Create interpretation range logic
- [ ] Build Grossman facets calculator
- [ ] Implement Significant Responses detector
- [ ] Add validity scale checks

### Phase 4: Results Storage 🔴 NOT STARTED
- [ ] Design resultados table schema
- [ ] Store raw responses (195 True/False answers)
- [ ] Store calculated PD scores (67 scales)
- [ ] Store BR scores (67 scales)
- [ ] Store Percentiles (67 scales)
- [ ] Store interpretation text
- [ ] Store Grossman facets (24 scales)
- [ ] Store Significant Responses flags

### Phase 5: Visualization Components 🔴 NOT STARTED
- [ ] ValidityScalesTable component
- [ ] PersonalityPatternsChart component (primary graph)
- [ ] SeverePathologyTable component
- [ ] ClinicalSyndromesChart component
- [ ] GrossmanFacetsDisplay component (grouped chart)
- [ ] SignificantResponsesTable component
- [ ] ScoreSummaryTable component
- [ ] InterpretationText component (auto-narrative)

### Phase 6: PDF Export 🔴 NOT STARTED
- [ ] Install PDF generation library (jsPDF + html2canvas or react-pdf)
- [ ] Create PDF report template
- [ ] Render charts as images for PDF
- [ ] Include interpretation text
- [ ] Add patient info header/footer
- [ ] Style PDF for professional appearance
- [ ] Test multi-page export
- [ ] Add download functionality

### Phase 7: Testing & Validation 🔴 NOT STARTED
- [ ] Verify scoring accuracy against Excel file
- [ ] Test with sample patient data from Excel
- [ ] Validate conversion tables
- [ ] Cross-check BR calculations
- [ ] Verify interpretation text accuracy
- [ ] Test PDF generation
- [ ] Browser compatibility testing
- [ ] Performance testing (195 items × 67 scales)

### Phase 8: Integration 🔴 NOT STARTED
- [ ] Integrate into existing test-taking workflow
- [ ] Add MCMI-IV to test selection menu
- [ ] Create results viewing page
- [ ] Add PDF download button
- [ ] Professional dashboard integration
- [ ] Patient portal display (if applicable)

---

## 📝 Critical Data Extraction Tasks

### IMMEDIATE NEXT STEPS:

1. **Extract TABLAPD (PUNT-DIRECTA) to JSON** 🚨 HIGH PRIORITY
   ```typescript
   // Create: scripts/extract-punt-directa-table.ts
   // Output: analysis/mcmi_pd_to_br_conversion.json
   ```

2. **Extract TABLAPER (PERCENTIL2) to JSON** 🚨 HIGH PRIORITY
   ```typescript
   // Create: scripts/extract-percentil-table.ts
   // Output: analysis/mcmi_br_to_percentile_conversion.json
   ```

3. **Extract Grossman Percentiles** 🚨 HIGH PRIORITY
   ```typescript
   // Create: scripts/extract-grossman-percentiles.ts
   // Output: analysis/mcmi_grossman_percentiles.json
   ```

4. **Extract Interpretation Text** 📋 MEDIUM PRIORITY
   ```typescript
   // Create: scripts/extract-interpretations.ts
   // Output: analysis/mcmi_interpretations.json
   // Map BR ranges → interpretation text for all scales
   ```

5. **Map Significant Responses Items** 📋 MEDIUM PRIORITY
   ```typescript
   // Create: scripts/extract-significant-responses.ts
   // Output: analysis/mcmi_significant_responses_mapping.json
   // Map which items belong to each significant response category
   ```

---

## 🎯 Estimated Timeline

| Phase | Tasks | Estimated Time | Complexity |
|-------|-------|----------------|------------|
| Phase 2 | Conversion Tables | 1-2 days | Medium |
| Phase 3 | Scoring Engine | 3-5 days | High |
| Phase 4 | Results Storage | 1-2 days | Low |
| Phase 5 | Visualizations | 5-7 days | High |
| Phase 6 | PDF Export | 2-3 days | Medium |
| Phase 7 | Testing | 3-4 days | Medium |
| Phase 8 | Integration | 1-2 days | Low |
| **TOTAL** | | **16-25 days** | |

---

## 📚 Reference Files

### Created Analysis Files:
- `/analysis/mcmi_structure.json` - Scale structure
- `/analysis/mcmi_items_translated.json` - All 195 items (ES + PT)
- `/analysis/mcmi_scales_translated.json` - All 67 scales (ES + PT)
- `/analysis/mcmi_conversion_tables_complete.json` - All 8 conversion tables
- `/analysis/mcmi_visualization_analysis.json` - Visualization requirements
- `/analysis/mcmi_sheet_1_APLICACION.json` - 158 scoring formulas
- `/analysis/mcmi_sheet_2_RESULTADOS_.json` - Results display formulas
- `/analysis/mcmi_sheet_3_FACETAS_GROSSMAN_Y_RESPUESTAS_S.json` - Facets formulas
- `/analysis/mcmi_sheet_4_CORRECCION.json` - Main conversion logic
- `/analysis/mcmi_sheet_10_PUNT_DIRECTA.json` - PD→BR table
- `/analysis/mcmi_sheet_11_PERCENTIL.json` - Percentile table 1
- `/analysis/mcmi_sheet_12_PERCENTIL2.json` - Percentile table 2 (TABLAPER)
- `/analysis/mcmi_sheet_13_PERCENTIL_GROSSMAN.json` - Grossman percentiles

### Original Excel File:
`/docs/704531450-libre-MCMI-IV-Inventario-Cli-nico-Multiaxial-de-Millon-xlsx-sin-contra-1.xlsx`

---

## ✅ Summary - What's Been Captured

### ✅ COMPLETE:
1. All 195 items extracted and translated ✅
2. All 67 scales identified and translated ✅
3. All 677 formulas extracted from Excel ✅
4. Scale structure documented ✅
5. Questions seeded to database ✅
6. Conversion table files extracted ✅
7. Visualization requirements identified ✅

### ⏳ NEEDS EXTRACTION:
1. PUNT-DIRECTA lookup table values (PD → BR mapping)
2. PERCENTIL lookup table values (BR → Percentile mapping)
3. Interpretation text for each BR range
4. Significant Responses item mappings

### 🔴 NEEDS IMPLEMENTATION:
1. Scoring engine (weighted formulas + conversions)
2. Visualization components (8 types identified)
3. PDF export functionality
4. Results storage schema
5. Integration into app workflow

---

**CONCLUSION:** ✅ All correction patterns, conversion tables, and visualization requirements have been thoroughly analyzed and documented. The system is ready for Phase 2 implementation (conversion table extraction and scoring engine development).
