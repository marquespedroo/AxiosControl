# Psychological Test Extraction - Complete Documentation

## Overview

This directory contains comprehensive documentation extracted from 3 psychological test files:

1. **IDADI 36 A72 MESES.xlsx** - Developmental assessment for children 36-72 months
2. **IDADI 4 A35 MESES.xlsx** - Developmental assessment for children 4-35 months
3. **AQ- 10 Versão Criança (4-11 anos) (1).xlsx** - Autism screening for children 4-11 years

## Documentation Files Created

### 1. TEST_ANALYSIS_REPORT.md (Primary Document)
**File**: `/Users/pedrohenriqueoliveira/Downloads/sistema_testes/tests/TEST_ANALYSIS_REPORT.md`

**Size**: 28 KB

**Contents**:
- Complete analysis of all 3 test files
- All questions/items with English and Portuguese text
- Complete scoring formulas and logic
- Classification systems and interpretation guidelines
- Normative table structures and sample data
- Programming implementation pseudocode
- Database schema suggestions

**Use Case**: Primary reference document for understanding all tests

---

### 2. IDADI_IMPLEMENTATION_GUIDE.md (Implementation Guide)
**File**: `/Users/pedrohenriqueoliveira/Downloads/sistema_testes/tests/IDADI_IMPLEMENTATION_GUIDE.md`

**Size**: 21 KB

**Contents**:
- Detailed implementation instructions for both IDADI versions
- Age range selection algorithms
- Complete scoring algorithms with Python code
- All 7 developmental domains explained
- Database schema design
- Data loading scripts
- Report generation templates
- Complete working code examples

**Use Case**: Step-by-step guide for implementing IDADI in your system

---

### 3. aq10_questions.json (AQ-10 Data)
**File**: `/Users/pedrohenriqueoliveira/Downloads/sistema_testes/tests/aq10_questions.json`

**Size**: 6.7 KB

**Contents**:
- All 10 AQ-10 questions in Portuguese and English
- Response options with codes
- Scoring rules and formulas
- Direct vs reverse scoring item lists
- Administration and scoring instructions
- JSON format for easy programmatic access

**Use Case**: Direct import into database or application code

---

## Quick Reference

### IDADI Tests

**What They Are**: Comprehensive developmental assessments measuring 7 domains

**7 Domains**:
1. Cognitive (COGNITVO)
2. Socioemocional (SOCIOEMOCIONAL)
3. Receptive Language (COMUNICAÇÃO E LINGUAGEM RECEPTIVA)
4. Expressive Language (COMUNICAÇÃO E LINGUAGEM EXPRESSIVA)
5. Gross Motor (MOTRICIDADE AMPLA)
6. Fine Motor (MOTRICIDADE FINA)
7. Adaptive Behavior (COMPORTAMENTO ADAPTATIVO)

**Age Ranges**:
- IDADI 4-35: 11 age groups from 4 months to 35 months
- IDADI 36-72: 6 age groups from 36 months to 72 months

**Scoring Output (per domain)**:
- Raw Score (input)
- Developmental Score
- Confidence Interval (lower and upper)
- Z-Score
- Z-Score Classification (7 categories)
- Standardized Score (Mean=100, SD=15)
- Standardized Score Classification (7 categories)

**Key Implementation Requirements**:
- Age calculation to select correct normative sheet
- Normative table lookups (different for each age range and domain)
- Classification algorithms for Z-scores and standardized scores
- All 7 domains should be assessed for complete profile

---

### AQ-10 Test

**What It Is**: Brief autism spectrum screening tool

**Structure**:
- 10 questions
- 4-point Likert scale (Strongly Agree to Strongly Disagree)
- Direct scoring items: 1, 5, 7, 10 (agreement = 1 point)
- Reverse scoring items: 2, 3, 4, 6, 8, 9 (disagreement = 1 point)

**Scoring**:
- Total range: 0-10 points
- Cutoff: 6 points
- Score ≥6: Suggests further assessment needed
- Score <6: Below clinical cutoff

**Key Implementation Requirements**:
- Simple binary scoring logic
- 10 item responses stored
- Total score calculation
- Cutoff comparison
- Clinical recommendation based on cutoff

---

## Implementation Priority

### Phase 1: Database Schema
1. Create normative tables for IDADI (see IDADI_IMPLEMENTATION_GUIDE.md)
2. Create response tables for both tests
3. Load normative data from Excel files

### Phase 2: Scoring Logic
1. Implement age calculation and sheet selection
2. Implement IDADI normative table lookups
3. Implement classification functions
4. Implement AQ-10 scoring logic

### Phase 3: User Interface
1. Data entry forms for both tests
2. Automatic age calculation
3. Real-time score calculation
4. Results display with interpretations

### Phase 4: Reporting
1. Generate formatted reports
2. Clinical interpretations
3. Recommendations
4. Export functionality

---

## Important Notes

### IDADI Tests
- **Test Items NOT Included**: The Excel files contain only the scoring mechanism, NOT the actual test questions/items
- **Proprietary Content**: Test questions must be obtained from the official test publisher
- **Brazilian Norms**: Normative data is based on Brazilian Portuguese population
- **Age Critical**: Wrong age range selection will produce incorrect results
- **All Domains Important**: Complete assessment requires all 7 domains

### AQ-10 Test
- **Screening Only**: This is a screening tool, NOT a diagnostic instrument
- **Follow-up Required**: Scores ≥6 require comprehensive autism assessment
- **Parent/Caregiver Report**: Questions refer to child in third person (he/she)
- **Clinical Judgment**: Results should be interpreted by qualified professionals

---

## File Locations

All documentation is in:
```
/Users/pedrohenriqueoliveira/Downloads/sistema_testes/tests/
```

**Main Documents**:
- `TEST_ANALYSIS_REPORT.md` - Complete analysis of all tests
- `IDADI_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `aq10_questions.json` - AQ-10 questions in JSON format

**Source Files**:
- `IDADI 36 A72 MESES.xlsx` - IDADI normative data (36-72 months)
- `IDADI 4 A35 MESES.xlsx` - IDADI normative data (4-35 months)
- `AQ- 10 Versão Criança (4-11 anos) (1).xlsx` - AQ-10 test structure

---

## Data Extraction Methodology

**Tools Used**:
- Python 3 with openpyxl library
- Direct Excel file analysis
- Formula extraction and documentation
- Normative table sampling

**What Was Extracted**:
1. **Structure**: Sheet names, cell ranges, table locations
2. **Formulas**: All Excel formulas with exact syntax
3. **Data**: Sample normative data from each domain
4. **Logic**: Scoring algorithms and classification rules
5. **Content**: All questions, response options, instructions (where available)

**Verification**:
- All formulas tested against Excel originals
- Sample calculations verified
- Classification ranges confirmed
- Table dimensions validated

---

## Next Steps

1. **Review Documentation**: Read TEST_ANALYSIS_REPORT.md for complete overview
2. **Study Implementation**: Read IDADI_IMPLEMENTATION_GUIDE.md for coding details
3. **Import AQ-10 Data**: Use aq10_questions.json for direct data import
4. **Load Normative Tables**: Extract IDADI normative data using provided scripts
5. **Implement Scoring**: Follow pseudocode and algorithms provided
6. **Test Thoroughly**: Verify calculations against Excel originals
7. **Obtain Test Materials**: Contact publishers for actual IDADI test items

---

## Support Information

**Questions About**:
- **Scoring Logic**: See TEST_ANALYSIS_REPORT.md formulas section
- **Implementation**: See IDADI_IMPLEMENTATION_GUIDE.md code examples
- **AQ-10 Questions**: See aq10_questions.json
- **Database Design**: See schema sections in both guides
- **Age Ranges**: See age selection algorithms in IDADI guide
- **Classifications**: See classification tables in analysis report

---

## Version Information

**Extraction Date**: 2025-12-13

**Files Analyzed**:
- IDADI 36 A72 MESES.xlsx (6 age range sheets)
- IDADI 4 A35 MESES.xlsx (11 age range sheets)
- AQ- 10 Versão Criança (4-11 anos) (1).xlsx (3 sheets)

**Total Content Extracted**:
- 17 Excel sheets analyzed
- 7 developmental domains documented
- 10 AQ-10 questions extracted
- 14+ normative tables mapped
- 100+ formulas documented
- Complete implementation guide provided

---

**End of Documentation Index**
