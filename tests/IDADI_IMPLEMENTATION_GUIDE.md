# IDADI Implementation Guide

## Overview

This guide provides detailed implementation instructions for the IDADI (Inventário Dimensional de Avaliação do Desenvolvimento Infantil) developmental assessment system.

## Test Versions

### IDADI 4-35 MONTHS
- **Age Range**: 4-35 months (0.33-2.9 years)
- **Age Groups**: 11 sheets (3-month intervals)
- **File**: `IDADI 4 A35 MESES.xlsx`

### IDADI 36-72 MONTHS
- **Age Range**: 36-72 months (3-6 years)
- **Age Groups**: 6 sheets (6-month intervals)
- **File**: `IDADI 36 A72 MESES.xlsx`

## Age Range Sheet Selection

### Age Calculation
```sql
-- Calculate age in months
age_in_months = DATEDIF(birth_date, test_date, "M")

-- Calculate years and remaining months for display
age_years = FLOOR(age_in_months / 12)
age_months_remainder = age_in_months % 12
```

### Sheet Selection Logic

#### For IDADI 4-35 MONTHS:
```python
def select_sheet_4_35(age_in_months):
    if 4 <= age_in_months <= 5:
        return "4-5 MESES"
    elif 6 <= age_in_months <= 8:
        return "6-8 MESES"
    elif 9 <= age_in_months <= 11:
        return "9-11 MESES"
    elif 12 <= age_in_months <= 14:
        return "12-14 MESES"
    elif 15 <= age_in_months <= 17:
        return "15-17 MESES"
    elif 18 <= age_in_months <= 20:
        return "18-20 MESES"
    elif 21 <= age_in_months <= 23:
        return "21-23 MESES"
    elif 24 <= age_in_months <= 26:
        return "24-26 MESES"
    elif 27 <= age_in_months <= 29:
        return "27-29 MESES"
    elif 30 <= age_in_months <= 32:
        return "30-32 MESES"
    elif 33 <= age_in_months <= 35:
        return "33-35 MESES"
    else:
        raise ValueError(f"Age {age_in_months} months out of range for IDADI 4-35")
```

#### For IDADI 36-72 MONTHS:
```python
def select_sheet_36_72(age_in_months):
    if 36 <= age_in_months <= 41:
        return "36-41 MESES"
    elif 42 <= age_in_months <= 47:
        return "42-47 MESES"
    elif 48 <= age_in_months <= 53:
        return "48-53 MESES"
    elif 54 <= age_in_months <= 59:
        return "54-59 MESES"
    elif 60 <= age_in_months <= 65:
        return "60-65 MESES"
    elif 66 <= age_in_months <= 72:
        return "66-72 MESES"
    else:
        raise ValueError(f"Age {age_in_months} months out of range for IDADI 36-72")
```

## The 7 Developmental Domains

### 1. COGNITIVE DOMAIN (COGNITVO)
**Assesses**: Problem-solving, reasoning, learning, memory, concept formation

**Normative Table Location**: C29:H119 (91 rows for 36-72 months)

**Raw Score Range**: 0-90

**What it measures**:
- Cognitive development
- Problem-solving abilities
- Learning capacity
- Conceptual understanding

---

### 2. SOCIOEMOCIONAL DOMAIN (SOCIOEMOCIONAL)
**Assesses**: Emotional regulation, social awareness, relationships, self-awareness

**Normative Table Location**: K29:P133 (105 rows)

**Raw Score Range**: 0-104

**What it measures**:
- Emotional development
- Social skills
- Relationship formation
- Emotional regulation
- Self-awareness

---

### 3. RECEPTIVE COMMUNICATION & LANGUAGE (COMUNICAÇÃO E LINGUAGEM RECEPTIVA)
**Assesses**: Understanding of spoken language, following instructions, comprehension

**Normative Table Location**: R28:W93 (66 rows)

**Raw Score Range**: 0-65

**What it measures**:
- Language comprehension
- Following verbal instructions
- Understanding vocabulary
- Auditory processing

---

### 4. EXPRESSIVE COMMUNICATION & LANGUAGE (COMUNICAÇÃO E LINGUAGEM EXPRESSIVA)
**Assesses**: Spoken language production, vocabulary use, sentence formation

**Normative Table Location**: Z29:AE117 (89 rows)

**Raw Score Range**: 0-88

**What it measures**:
- Vocabulary production
- Sentence formation
- Verbal expression
- Communication skills

---

### 5. GROSS MOTOR DOMAIN (MOTRICIDADE AMPLA)
**Assesses**: Large muscle movements, coordination, balance, physical skills

**Normative Table Location**: AI30:AN92 (63 rows)

**Raw Score Range**: 0-62

**What it measures**:
- Walking, running, jumping
- Balance and coordination
- Large muscle control
- Physical activity skills

---

### 6. FINE MOTOR DOMAIN (MOTRICIDADE FINA)
**Assesses**: Small muscle movements, hand-eye coordination, manual dexterity

**Normative Table Location**: AS29:AX71 (43 rows)

**Raw Score Range**: 0-42

**What it measures**:
- Hand-eye coordination
- Grasping and manipulation
- Drawing and writing skills
- Small object handling

---

### 7. ADAPTIVE BEHAVIOR DOMAIN (COMPORTAMENTO ADAPTATIVO)
**Assesses**: Daily living skills, self-care, independence, practical skills

**Normative Table Location**: BA29:BF149 (121 rows for 36-72 months)

**Raw Score Range**: 0-120

**What it measures**:
- Self-care abilities (eating, dressing)
- Daily living skills
- Independence
- Practical life skills
- Safety awareness

---

## Normative Table Structure

Each domain has a normative table with 6 columns:

| Column | Name | Description |
|--------|------|-------------|
| 1 | ESCORE BRUTO | Raw Score (0 to max for domain) |
| 2 | ESCORE DESENVOL | Developmental Score |
| 3 | INFERIOR | Lower Confidence Interval (90% CI) |
| 4 | SUPERIOR | Upper Confidence Interval (90% CI) |
| 5 | ESCORE Z | Z-Score |
| 6 | PADRONIZADO | Standardized Score (Mean=100, SD=15) |

## Complete Scoring Algorithm

### Step-by-Step Process

```python
def calculate_domain_scores(raw_score, normative_table):
    """
    Calculate all scores for a single domain

    Args:
        raw_score: Integer raw score for the domain
        normative_table: DataFrame with columns [raw, dev_score, lower_ci, upper_ci, z_score, std_score]

    Returns:
        dict with all calculated scores and classifications
    """

    # Step 1: Lookup developmental score
    row = normative_table[normative_table['raw'] == raw_score]

    if row.empty:
        raise ValueError(f"Raw score {raw_score} not found in normative table")

    developmental_score = row['dev_score'].values[0]
    lower_ci = row['lower_ci'].values[0]
    upper_ci = row['upper_ci'].values[0]
    z_score = row['z_score'].values[0]
    standardized_score = row['std_score'].values[0]

    # Step 2: Classify Z-score
    z_classification = classify_z_score(z_score)

    # Step 3: Classify Standardized score
    std_classification = classify_standardized_score(standardized_score)

    return {
        'raw_score': raw_score,
        'developmental_score': developmental_score,
        'confidence_interval': {
            'lower': lower_ci,
            'upper': upper_ci
        },
        'z_score': z_score,
        'z_classification': {
            'value': z_classification,
            'clinical_interpretation': get_z_clinical_interpretation(z_score)
        },
        'standardized_score': standardized_score,
        'std_classification': {
            'value': std_classification,
            'percentile_range': get_percentile_range(standardized_score)
        }
    }
```

### Classification Functions

```python
def classify_z_score(z):
    """Classify Z-score into developmental categories"""
    if z > 2.0:
        return "Muito acima do esperado"
    elif 1.51 <= z <= 2.0:
        return "Acima do esperado"
    elif 1.01 <= z <= 1.5:
        return "Típico"
    elif -1.0 <= z <= 1.0:
        return "Típico"
    elif -1.5 <= z <= -1.01:
        return "Alerta para atraso"
    elif -2.0 <= z <= -1.51:
        return "Atraso"
    else:  # z <= -2.0
        return "Atraso signifiticativo"

def classify_standardized_score(std):
    """Classify standardized score (Mean=100, SD=15)"""
    if std > 130:
        return "Muito Superior"
    elif 123 <= std <= 130:
        return "Superior"
    elif 116 <= std <= 122:
        return "Acima da Média"
    elif 85 <= std <= 115:
        return "Médio"
    elif 78 <= std <= 84:
        return "Abaixo da Média"
    elif 70 <= std <= 77:
        return "Inferior"
    else:  # std <= 70
        return "Muito Inferior"

def get_z_clinical_interpretation(z):
    """Provide clinical interpretation of Z-score"""
    if z > 2.0:
        return "Performance significantly above age expectations. Consider enrichment."
    elif z > 1.5:
        return "Performance above age expectations. Strengths in this area."
    elif z >= -1.0:
        return "Performance within typical range for age."
    elif z >= -1.5:
        return "Performance slightly below expectations. Monitor development."
    elif z >= -2.0:
        return "Performance indicates developmental delay. Early intervention recommended."
    else:
        return "Performance indicates significant delay. Immediate intervention strongly recommended."

def get_percentile_range(std):
    """
    Convert standardized score to approximate percentile

    Standardized scores have Mean=100, SD=15
    """
    from scipy.stats import norm

    # Convert to z-score
    z = (std - 100) / 15

    # Get percentile
    percentile = norm.cdf(z) * 100

    if percentile >= 98:
        return "98th percentile or above"
    elif percentile >= 90:
        return "90th-97th percentile"
    elif percentile >= 75:
        return "75th-89th percentile"
    elif percentile >= 25:
        return "25th-74th percentile"
    elif percentile >= 10:
        return "10th-24th percentile"
    elif percentile >= 2:
        return "2nd-9th percentile"
    else:
        return "Below 2nd percentile"
```

## Complete Implementation Example

```python
class IDADIAssessment:
    """Complete IDADI assessment implementation"""

    def __init__(self, normative_tables):
        """
        Initialize with normative tables

        normative_tables: dict with structure:
            {
                'age_range': {
                    'domain_name': DataFrame with normative data
                }
            }
        """
        self.normative_tables = normative_tables

    def assess(self, birth_date, test_date, raw_scores):
        """
        Perform complete IDADI assessment

        Args:
            birth_date: date object
            test_date: date object
            raw_scores: dict with domain names as keys, raw scores as values
                {
                    'cognitive': 45,
                    'socioemocional': 58,
                    'receptive_language': 30,
                    'expressive_language': 35,
                    'gross_motor': 25,
                    'fine_motor': 20,
                    'adaptive_behavior': 75
                }

        Returns:
            Complete assessment results
        """

        # Calculate age
        age_months = self._calculate_age_months(birth_date, test_date)
        age_years = age_months // 12
        age_months_rem = age_months % 12

        # Select appropriate age range
        age_range = self._select_age_range(age_months)

        # Calculate scores for each domain
        domain_results = {}
        for domain_name, raw_score in raw_scores.items():
            norm_table = self.normative_tables[age_range][domain_name]
            domain_results[domain_name] = calculate_domain_scores(raw_score, norm_table)

        # Compile complete results
        return {
            'patient_info': {
                'birth_date': birth_date,
                'test_date': test_date,
                'age_years': age_years,
                'age_months': age_months_rem,
                'total_months': age_months,
                'age_range_used': age_range
            },
            'domain_results': domain_results,
            'summary': self._generate_summary(domain_results),
            'recommendations': self._generate_recommendations(domain_results)
        }

    def _calculate_age_months(self, birth_date, test_date):
        """Calculate age in months"""
        from dateutil.relativedelta import relativedelta

        delta = relativedelta(test_date, birth_date)
        return delta.years * 12 + delta.months

    def _select_age_range(self, age_months):
        """Select appropriate age range sheet"""
        if 4 <= age_months <= 5:
            return "4-5_MESES"
        elif 6 <= age_months <= 8:
            return "6-8_MESES"
        # ... (complete logic for all ranges)
        elif 66 <= age_months <= 72:
            return "66-72_MESES"
        else:
            raise ValueError(f"Age {age_months} months out of valid range")

    def _generate_summary(self, domain_results):
        """Generate summary of results"""
        summary = {
            'strengths': [],
            'concerns': [],
            'typical': []
        }

        for domain, results in domain_results.items():
            z = results['z_score']

            if z > 1.5:
                summary['strengths'].append(domain)
            elif z < -1.5:
                summary['concerns'].append(domain)
            else:
                summary['typical'].append(domain)

        return summary

    def _generate_recommendations(self, domain_results):
        """Generate clinical recommendations"""
        recommendations = []

        for domain, results in domain_results.items():
            z = results['z_score']

            if z < -2.0:
                recommendations.append({
                    'domain': domain,
                    'priority': 'HIGH',
                    'action': 'Immediate intervention recommended',
                    'referral': 'Consider referral to specialist'
                })
            elif z < -1.5:
                recommendations.append({
                    'domain': domain,
                    'priority': 'MEDIUM',
                    'action': 'Early intervention recommended',
                    'referral': 'Monitor closely, consider intervention'
                })

        return recommendations
```

## Database Schema

```sql
-- Main assessment table
CREATE TABLE idadi_assessments (
    assessment_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    birth_date DATE NOT NULL,
    test_date DATE NOT NULL,
    age_months INTEGER,
    age_range VARCHAR(20),
    administered_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domain scores table
CREATE TABLE idadi_domain_scores (
    score_id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES idadi_assessments(id),
    domain VARCHAR(50) NOT NULL,

    -- Input
    raw_score INTEGER NOT NULL,

    -- Calculated scores
    developmental_score DECIMAL(5,2),
    confidence_interval_lower DECIMAL(5,2),
    confidence_interval_upper DECIMAL(5,2),
    z_score DECIMAL(5,2),
    z_classification VARCHAR(50),
    standardized_score INTEGER,
    std_classification VARCHAR(50),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_domain CHECK (domain IN (
        'cognitive',
        'socioemocional',
        'receptive_language',
        'expressive_language',
        'gross_motor',
        'fine_motor',
        'adaptive_behavior'
    ))
);

-- Normative tables storage
CREATE TABLE idadi_normative_tables (
    table_id SERIAL PRIMARY KEY,
    age_range VARCHAR(20) NOT NULL,
    domain VARCHAR(50) NOT NULL,
    raw_score INTEGER NOT NULL,
    developmental_score DECIMAL(5,2),
    lower_ci DECIMAL(5,2),
    upper_ci DECIMAL(5,2),
    z_score DECIMAL(5,2),
    standardized_score INTEGER,

    UNIQUE(age_range, domain, raw_score)
);

-- Create index for fast lookups
CREATE INDEX idx_normative_lookup
ON idadi_normative_tables(age_range, domain, raw_score);
```

## Data Loading Script

```python
import openpyxl
import pandas as pd

def load_idadi_normative_tables(filepath):
    """
    Load all normative tables from IDADI Excel file

    Returns: dict structure suitable for database insertion
    """
    wb = openpyxl.load_workbook(filepath, data_only=True)

    normative_data = []

    # Domain definitions with their table locations
    domains = {
        'cognitive': {'start_col': 3, 'end_col': 8, 'start_row': 29, 'end_row': 119},
        'socioemocional': {'start_col': 11, 'end_col': 16, 'start_row': 29, 'end_row': 133},
        'receptive_language': {'start_col': 18, 'end_col': 23, 'start_row': 28, 'end_row': 93},
        'expressive_language': {'start_col': 26, 'end_col': 31, 'start_row': 29, 'end_row': 117},
        'gross_motor': {'start_col': 35, 'end_col': 40, 'start_row': 30, 'end_row': 92},
        'fine_motor': {'start_col': 45, 'end_col': 50, 'start_row': 29, 'end_row': 71},
        'adaptive_behavior': {'start_col': 53, 'end_col': 58, 'start_row': 29, 'end_row': 149}
    }

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        age_range = sheet_name.replace(' ', '_')

        for domain_name, location in domains.items():
            # Extract data from sheet
            for row_idx in range(location['start_row'], location['end_row'] + 1):
                raw_score = ws.cell(row_idx, location['start_col']).value
                dev_score = ws.cell(row_idx, location['start_col'] + 1).value
                lower_ci = ws.cell(row_idx, location['start_col'] + 2).value
                upper_ci = ws.cell(row_idx, location['start_col'] + 3).value
                z_score = ws.cell(row_idx, location['start_col'] + 4).value
                std_score = ws.cell(row_idx, location['start_col'] + 5).value

                # Only add if raw_score is not None
                if raw_score is not None:
                    normative_data.append({
                        'age_range': age_range,
                        'domain': domain_name,
                        'raw_score': int(raw_score),
                        'developmental_score': float(dev_score) if dev_score else None,
                        'lower_ci': float(lower_ci) if lower_ci else None,
                        'upper_ci': float(upper_ci) if upper_ci else None,
                        'z_score': float(z_score) if z_score else None,
                        'standardized_score': int(std_score) if std_score else None
                    })

    return normative_data

# Usage
normative_data_36_72 = load_idadi_normative_tables('IDADI 36 A72 MESES.xlsx')
normative_data_4_35 = load_idadi_normative_tables('IDADI 4 A35 MESES.xlsx')

# Insert into database
# ... (database insertion code)
```

## Report Generation

```python
def generate_idadi_report(assessment_results):
    """Generate formatted assessment report"""

    report = f"""
IDADI ASSESSMENT REPORT
=======================

PATIENT INFORMATION
-------------------
Test Date: {assessment_results['patient_info']['test_date']}
Birth Date: {assessment_results['patient_info']['birth_date']}
Age: {assessment_results['patient_info']['age_years']} years, {assessment_results['patient_info']['age_months']} months
Age Range Used: {assessment_results['patient_info']['age_range_used']}

DOMAIN SCORES
-------------
"""

    for domain, results in assessment_results['domain_results'].items():
        report += f"""
{domain.upper().replace('_', ' ')}
  Raw Score: {results['raw_score']}
  Developmental Score: {results['developmental_score']:.1f}
  Confidence Interval: [{results['confidence_interval']['lower']:.1f}, {results['confidence_interval']['upper']:.1f}]
  Z-Score: {results['z_score']:.2f}
  Classification: {results['z_classification']['value']}
  Standardized Score: {results['standardized_score']}
  Classification: {results['std_classification']['value']}
  Percentile: {results['std_classification']['percentile_range']}
  Interpretation: {results['z_classification']['clinical_interpretation']}
"""

    report += f"""
SUMMARY
-------
Strengths: {', '.join(assessment_results['summary']['strengths']) if assessment_results['summary']['strengths'] else 'None identified'}
Typical Development: {', '.join(assessment_results['summary']['typical']) if assessment_results['summary']['typical'] else 'None'}
Areas of Concern: {', '.join(assessment_results['summary']['concerns']) if assessment_results['summary']['concerns'] else 'None identified'}

RECOMMENDATIONS
---------------
"""

    if assessment_results['recommendations']:
        for rec in assessment_results['recommendations']:
            report += f"""
{rec['domain'].upper().replace('_', ' ')}
  Priority: {rec['priority']}
  Action: {rec['action']}
  Referral: {rec['referral']}
"""
    else:
        report += "No specific interventions recommended at this time. Continue monitoring development.\n"

    return report
```

## Key Implementation Notes

1. **Normative Tables Must Be Loaded**: All normative data from Excel sheets must be loaded into the database or cached in memory

2. **Age Calculation Is Critical**: Use precise month calculations, as the wrong age range will give incorrect normative comparisons

3. **Lookup Chain**: The Excel uses chained VLOOKUP formulas. In code, this can be simplified to direct lookups from the normative table

4. **Missing Data Handling**: Some normative tables have gaps - handle None values appropriately

5. **Cultural Considerations**: These are Brazilian Portuguese norms - may not be appropriate for other populations

6. **Test Questions Not Included**: The actual test items/questions are NOT in the Excel files - these must be obtained from the test publisher

7. **Clinical Interpretation**: Raw scores alone are not interpretable - must be converted using the normative tables

8. **Comprehensive Assessment**: All 7 domains should ideally be assessed for a complete developmental profile

---

**End of Implementation Guide**
