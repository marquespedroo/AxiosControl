# COMPREHENSIVE TEST ANALYSIS REPORT

## Table of Contents
1. [IDADI 36-72 MONTHS](#idadi-36-72-months)
2. [IDADI 4-35 MONTHS](#idadi-4-35-months)
3. [AQ-10 Children Version (4-11 years)](#aq-10-children-version-4-11-years)

---

## IDADI 36-72 MONTHS

### File Information
- **Filename**: `IDADI 36 A72 MESES.xlsx`
- **Test Type**: Developmental assessment for children aged 36-72 months
- **Assessment**: IDADI (Inventário Dimensional de Avaliação do Desenvolvimento Infantil)

### Sheet Structure

The file contains **6 age-based sheets**, each with identical structure but different normative data:

1. **66-72 MESES** (66-72 months / 5.5-6 years)
2. **60-65 MESES** (60-65 months / 5-5.4 years)
3. **54-59 MESES** (54-59 months / 4.5-4.9 years)
4. **48-53 MESES** (48-53 months / 4-4.4 years)
5. **42-47 MESES** (42-47 months / 3.5-3.9 years)
6. **36-41 MESES** (36-41 months / 3-3.4 years)

### Test Input Section (Rows 1-6)

Each sheet contains:
- **Row 2**: Name field (C2: "Nome :")
- **Row 3**: Test date (C3: "Data do teste", D3: date input)
- **Row 4**: Birth date (C4: "Data de nascimento", D4: date input)
- **Row 5**: Age labels (C5: "IDADE CRONOLÓGICA DA CRIANÇA:", D5: "Ano", E5: "Meses")
- **Row 6**: Age calculation formulas
  - D6: `=DATEDIF(D4,D3,"Y")` (calculates years)
  - E6: `=DATEDIF(D4,D3,"M")-DATEDIF(D4,D3,"Y")*12` (calculates remaining months)

### Domains and Scoring Structure

The test evaluates **7 developmental domains** (rows 13-19):

| Row | Domain | Portuguese Name | Raw Score Cell |
|-----|--------|-----------------|----------------|
| 13 | Cognitive | COGNITVO | G13 |
| 14 | Socioemocional | SOCIOEMOCIONAL | G14 |
| 15 | Receptive Communication & Language | COMUNICAÇÃO E LINGUAGEM RECEPTIVA | G15 |
| 16 | Expressive Communication & Language | COMUNICAÇÃO E LINGUAGEM EXPRESSIVA | G16 |
| 17 | Gross Motor | MOTRICIDADE AMPLA | G17 |
| 18 | Fine Motor | MOTRICIDADE FINA | G18 |
| 19 | Adaptive Behavior | COMPORTAMENTO ADAPTATIVO | G19 |

### Column Headers (Row 12)

| Column | Header | Description |
|--------|--------|-------------|
| F | DOMINIOS | Domain names |
| G | PONTUAÇÃO BRUTA | Raw Score (input) |
| H | ESCORE DESENVOLVIMENTAL | Developmental Score |
| I | INFERIOR | Lower Confidence Interval |
| J | SUPERIOR | Upper Confidence Interval |
| K | ESCORE Z | Z-Score |
| L | CLASSIFICAÇÃO | Z-Score Classification |
| M | ESCORE PADRONIZADO | Standardized Score |
| N | CLASSIFICAÇÃO | Standardized Score Classification |

### Scoring Formulas

#### For Each Domain (Rows 13-19):

**1. Developmental Score (Column H)**
```excel
=VLOOKUP(raw_score, normative_table, 2, 0)
```
- Looks up raw score in domain-specific normative table
- Returns developmental score from column 2 of the table

**2. Confidence Interval - Lower (Column I)**
```excel
=VLOOKUP(developmental_score, normative_table_shifted, 2, 0)
```
- Looks up developmental score in shifted table range
- Returns lower confidence interval

**3. Confidence Interval - Upper (Column J)**
```excel
=VLOOKUP(lower_ci, normative_table_shifted_again, 2, 0)
```
- Looks up lower CI in further shifted table range
- Returns upper confidence interval

**4. Z-Score (Column K)**
```excel
=VLOOKUP(upper_ci, normative_table_final_shift, 2, 0)
```
- Looks up upper CI in final shifted table range
- Returns Z-score

**5. Z-Score Classification (Column L)**
```excel
=IF(K>2,"Muito acima do esperado",
  IF(AND(K>=1.51,K<=2),"Acima do esperado",
    IF(AND(K>=1.01,K<=1.5),"Típico",
      IF(AND(K>=-1,K<=1),"Típico",
        IF(AND(K>=-1.5,K<=-1.01),"Alerta para atraso",
          IF(AND(K>=-2,K<=-1.51),"Atraso",
            IF(K<=-2,"Atraso signifiticativo","0")))))))
```

**Z-Score Classification Ranges:**
- **Z > 2.0**: "Muito acima do esperado" (Well above expected)
- **1.51 ≤ Z ≤ 2.0**: "Acima do esperado" (Above expected)
- **1.01 ≤ Z ≤ 1.5**: "Típico" (Typical)
- **-1.0 ≤ Z ≤ 1.0**: "Típico" (Typical)
- **-1.5 ≤ Z ≤ -1.01**: "Alerta para atraso" (Alert for delay)
- **-2.0 ≤ Z ≤ -1.51**: "Atraso" (Delay)
- **Z ≤ -2.0**: "Atraso signifiticativo" (Significant delay)

**6. Standardized Score (Column M)**
```excel
=VLOOKUP(raw_score, normative_table, 6, 0)
```
- Looks up raw score in normative table
- Returns standardized score from column 6

**7. Standardized Score Classification (Column N)**
```excel
=IF(M>130,"Muito Superior",
  IF(AND(M>=123,M<=130),"Superior",
    IF(AND(M>=116,M<=122),"Acima da Média",
      IF(AND(M>=85,M<=115),"Médio",
        IF(AND(M>=78,M<=84),"Abaixo da Média",
          IF(AND(M>=70,M<=77),"Inferior",
            IF(M<=70,"Muito Inferior","0")))))))
```

**Standardized Score Classification Ranges:**
- **M > 130**: "Muito Superior" (Very Superior)
- **123 ≤ M ≤ 130**: "Superior" (Superior)
- **116 ≤ M ≤ 122**: "Acima da Média" (Above Average)
- **85 ≤ M ≤ 115**: "Médio" (Average)
- **78 ≤ M ≤ 84**: "Abaixo da Média" (Below Average)
- **70 ≤ M ≤ 77**: "Inferior" (Lower)
- **M ≤ 70**: "Muito Inferior" (Very Inferior)

### Normative Tables

Each domain has its own normative table with the following structure:

**Table Columns:**
1. Raw Score (ESCORE BRUTO)
2. Developmental Score (ESCORE DESENVOL)
3. Lower CI (INFERIOR)
4. Upper CI (SUPERIOR)
5. Z-Score (ESCORE Z)
6. Standardized Score (PADRONIZADO)

#### Domain-Specific Table Locations:

| Domain | Table Range | Rows | Max Raw Score |
|--------|-------------|------|---------------|
| Cognitive | C29:H119 | 91 rows | 90 |
| Socioemocional | K29:P133 | 105 rows | 104 |
| Receptive Language | R28:W93 | 66 rows | 65 |
| Expressive Language | Z29:AE117 | 89 rows | 88 |
| Gross Motor | AI30:AN92 | 63 rows | 62 |
| Fine Motor | AS29:AX71 | 43 rows | 42 |
| Adaptive Behavior | BA29:BF149 | 121 rows | 120 |

#### Sample Normative Data (Cognitive Domain - 66-72 months):

| Raw | Dev Score | Lower CI | Upper CI | Z-Score | Standardized |
|-----|-----------|----------|----------|---------|--------------|
| 0 | 108.2 | 106.0 | 110.5 | -4.88 | 37 |
| 1 | 109.0 | 107.6 | 110.3 | -4.76 | 29 |
| 2 | 109.5 | 108.4 | 110.6 | -4.68 | 30 |
| 10 | 112.2 | 111.2 | 113.2 | -4.27 | 36 |
| 20 | 118.6 | 117.3 | 120.0 | -3.28 | 51 |
| 30 | 124.0 | 122.7 | 125.3 | -2.45 | 63 |
| 40 | 129.3 | 128.1 | 130.5 | -1.63 | 76 |
| 50 | 134.5 | 133.4 | 135.7 | -0.81 | 88 |

### Questions/Items

**NOTE**: The Excel files do NOT contain the actual test questions/items. These are proprietary test materials that must be obtained separately from the test publisher. The Excel sheets only contain the scoring mechanism and normative tables.

### Implementation Notes

To implement this test in a digital system:

1. **Age Calculation**: Calculate child's age in months at time of testing
2. **Sheet Selection**: Select appropriate age range sheet based on child's age
3. **Score Input**: Collect raw scores for each of the 7 domains
4. **Lookup Process**: For each domain:
   - Lookup developmental score using raw score
   - Chain lookups through CI and Z-score tables
   - Apply classification formulas
5. **Results Display**: Show all calculated scores and classifications

**Programming Logic (Pseudocode):**

```python
def calculate_idadi_scores(birth_date, test_date, raw_scores, age_range_sheet):
    # Calculate age
    age_years = DATEDIF(birth_date, test_date, "Y")
    age_months = DATEDIF(birth_date, test_date, "M") - (age_years * 12)

    results = {}

    for domain in domains:
        raw_score = raw_scores[domain]
        norm_table = get_normative_table(age_range_sheet, domain)

        # Step 1: Developmental score
        dev_score = VLOOKUP(raw_score, norm_table, column=2)

        # Step 2-4: Confidence intervals and Z-score (chained lookups)
        lower_ci = VLOOKUP(dev_score, norm_table_offset_1, column=2)
        upper_ci = VLOOKUP(lower_ci, norm_table_offset_2, column=2)
        z_score = VLOOKUP(upper_ci, norm_table_offset_3, column=2)

        # Step 5: Z-score classification
        z_classification = classify_z_score(z_score)

        # Step 6: Standardized score
        std_score = VLOOKUP(raw_score, norm_table, column=6)

        # Step 7: Standardized classification
        std_classification = classify_standardized_score(std_score)

        results[domain] = {
            'raw_score': raw_score,
            'developmental_score': dev_score,
            'lower_ci': lower_ci,
            'upper_ci': upper_ci,
            'z_score': z_score,
            'z_classification': z_classification,
            'standardized_score': std_score,
            'std_classification': std_classification
        }

    return results

def classify_z_score(z):
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
    elif z <= -2.0:
        return "Atraso signifiticativo"
    else:
        return "Error"

def classify_standardized_score(m):
    if m > 130:
        return "Muito Superior"
    elif 123 <= m <= 130:
        return "Superior"
    elif 116 <= m <= 122:
        return "Acima da Média"
    elif 85 <= m <= 115:
        return "Médio"
    elif 78 <= m <= 84:
        return "Abaixo da Média"
    elif 70 <= m <= 77:
        return "Inferior"
    elif m <= 70:
        return "Muito Inferior"
    else:
        return "Error"
```

---

## IDADI 4-35 MONTHS

### File Information
- **Filename**: `IDADI 4 A35 MESES.xlsx`
- **Test Type**: Developmental assessment for children aged 4-35 months
- **Assessment**: IDADI (Inventário Dimensional de Avaliação do Desenvolvimento Infantil)

### Sheet Structure

The file contains **11 age-based sheets**, each with identical structure but different normative data:

1. **33-35 MESES** (33-35 months / 2.75-2.9 years)
2. **30-32 MESES** (30-32 months / 2.5-2.67 years)
3. **27-29 MESES** (27-29 months / 2.25-2.4 years)
4. **24-26 MESES** (24-26 months / 2-2.17 years)
5. **21-23 MESES** (21-23 months / 1.75-1.9 years)
6. **18-20 MESES** (18-20 months / 1.5-1.67 years)
7. **15-17 MESES** (15-17 months / 1.25-1.4 years)
8. **12-14 MESES** (12-14 months / 1-1.17 years)
9. **9-11 MESES** (9-11 months / 0.75-0.9 years)
10. **6-8 MESES** (6-8 months / 0.5-0.67 years)
11. **4-5 MESES** (4-5 months / 0.33-0.42 years)

### Domains and Structure

**The 7 domains are IDENTICAL to the 36-72 months version:**
1. Cognitive (COGNITVO)
2. Socioemocional (SOCIOEMOCIONAL)
3. Receptive Communication & Language (COMUNICAÇÃO E LINGUAGEM RECEPTIVA)
4. Expressive Communication & Language (COMUNICAÇÃO E LINGUAGEM EXPRESSIVA)
5. Gross Motor (MOTRICIDADE AMPLA)
6. Fine Motor (MOTRICIDADE FINA)
7. Adaptive Behavior (COMPORTAMENTO ADAPTATIVO)

### Scoring Formulas

**ALL FORMULAS ARE IDENTICAL to the 36-72 months version**, including:
- Age calculation formulas
- Developmental score lookups
- Confidence interval calculations
- Z-score calculations and classifications
- Standardized score calculations and classifications

### Normative Tables

**Table structure is identical, but with different normative values appropriate for younger ages.**

#### Domain-Specific Table Locations:

| Domain | Table Range | Notes |
|--------|-------------|-------|
| Cognitive | C29:H113 | Slightly smaller range than 36-72 months |
| Socioemocional | K29:P133 | Same size as 36-72 months |
| Receptive Language | R28:W93 | Same size as 36-72 months |
| Expressive Language | Z29:AE117 | Same size as 36-72 months |
| Gross Motor | AI30:AN92 | Same size as 36-72 months |
| Fine Motor | AS29:AX71 | Same size as 36-72 months |
| Adaptive Behavior | BA29:BF103 | Smaller range than 36-72 months |

#### Sample Normative Data (Cognitive Domain - 33-35 months):

| Raw | Dev Score | Lower CI | Upper CI | Z-Score | Standardized |
|-----|-----------|----------|----------|---------|--------------|
| 0 | 82.7 | 79.1 | 86.3 | -5.87 | 12 |
| 1 | 85.2 | 82.6 | 87.7 | -5.42 | 19 |
| 2 | 86.4 | 85.0 | 87.8 | -5.19 | 22 |
| 5 | 88.2 | 87.1 | 89.3 | -4.87 | 27 |

**Note**: Younger children show lower baseline developmental scores and more negative Z-scores for the same raw scores, which is developmentally appropriate.

### Implementation Notes

**The implementation is IDENTICAL to the 36-72 months version**, with the only differences being:
1. Different age range sheets (11 instead of 6)
2. Different normative table values
3. Appropriate for younger children (4-35 months vs 36-72 months)

---

## AQ-10 Children Version (4-11 years)

### File Information
- **Filename**: `AQ- 10 Versão Criança (4-11 anos) (1).xlsx`
- **Test Type**: Autism Spectrum Quotient - Children's Version (Short Form)
- **Assessment**: AQ-10 (Quociente de Espectro do Autismo)
- **Age Range**: 4-11 years
- **Full Name**: Autism Spectrum Quotient - 10 Item Screening Tool

### Sheet Structure

The file contains **3 sheets**:

1. **Instruções** (Instructions)
2. **Aplicação** (Application/Administration)
3. **Correção** (Scoring)

### Sheet 1: Instruções (Instructions)

**Content:**
```
INSTRUÇÕES PARA APLICAÇÃO
Aplicação Individual

1. Leia cada uma das questões
2. Preencha a escola, marcando um X na resposta do paciente
3. Ao finalizar a aplica, a planilha do Exel ira realizas os cálculos automaticamente
```

**Translation:**
```
INSTRUCTIONS FOR APPLICATION
Individual Administration

1. Read each of the questions
2. Fill in the choice, marking an X in the patient's response
3. Upon finishing application, the Excel spreadsheet will perform calculations automatically
```

### Sheet 2: Aplicação (Application)

**Header Information:**
- Row 1: "AQ- 10 Versão Criança (4-11 anos)"
- Row 2: "Quociente de Espectro do Autismo" (Autism Spectrum Quotient)

**Instructions Row (Row 4):**
"Por favor, responda a cada afirmação assinalando, com um X, apenas uma opção que melhor descreve o quanto concorda ou discorda com ela."

**Translation:**
"Please respond to each statement by marking with an X only one option that best describes how much you agree or disagree with it."

### Response Options (Row 6)

| Column | Option | Translation |
|--------|--------|-------------|
| C | Concordo Totalmente | Strongly Agree |
| D | Concordo em parte | Somewhat Agree |
| E | Discordo em parte | Somewhat Disagree |
| F | Discordo Totalmente | Strongly Disagree |
| G | PONTUAÇÃO | SCORE |

### Test Questions

#### Question 1 (Row 7)
**Portuguese:** "Ele/a nota muitas vezes pequenos ruídos que passam despercebidos às outras pessoas."

**English:** "He/she often notices small sounds that others do not."

**Scoring Formula:** `=IF(E7="X",0,IF(F7="X",0,IF(C7="X",1,IF(D7="X",1,0))))`

**Scoring Logic:**
- "Discordo em parte" (E) = 0
- "Discordo Totalmente" (F) = 0
- "Concordo Totalmente" (C) = 1
- "Concordo em parte" (D) = 1

**Item Type:** Direct scoring (agreement scores 1 point)

---

#### Question 2 (Row 8)
**Portuguese:** "Habitualmente, ele/a concentra-se mais na imagem ou situação no seu todo, do que nos pequenos detalhes."

**English:** "Usually, he/she concentrates more on the whole picture or situation rather than the small details."

**Scoring Formula:** `=IF(C8="X",0,IF(D8="X",0,IF(E8="X",1,IF(F8="X",1,0))))`

**Scoring Logic:**
- "Concordo Totalmente" (C) = 0
- "Concordo em parte" (D) = 0
- "Discordo em parte" (E) = 1
- "Discordo Totalmente" (F) = 1

**Item Type:** Reverse scoring (disagreement scores 1 point)

---

#### Question 3 (Row 9)
**Portuguese:** "Quando está num grupo social, ele/a consegue facilmente seguir conversas de várias pessoas diferentes."

**English:** "When in a social group, he/she can easily follow conversations between different people."

**Scoring Formula:** `=IF(C9="X",0,IF(D9="X",0,IF(E9="X",1,IF(F9="X",1,0))))`

**Scoring Logic:**
- "Concordo Totalmente" (C) = 0
- "Concordo em parte" (D) = 0
- "Discordo em parte" (E) = 1
- "Discordo Totalmente" (F) = 1

**Item Type:** Reverse scoring (disagreement scores 1 point)

---

#### Question 4 (Row 10)
**Portuguese:** "Ele/a consegue facilmente fazer mais do que uma coisa ao mesmo tempo."

**English:** "He/she can easily do more than one thing at the same time."

**Scoring Formula:** `=IF(C10="X",0,IF(D10="X",0,IF(E10="X",1,IF(F10="X",1,0))))`

**Scoring Logic:**
- "Concordo Totalmente" (C) = 0
- "Concordo em parte" (D) = 0
- "Discordo em parte" (E) = 1
- "Discordo Totalmente" (F) = 1

**Item Type:** Reverse scoring (disagreement scores 1 point)

---

#### Question 5 (Row 11)
**Portuguese:** "Ele/a não sabe como manter uma conversa com os seus pares."

**English:** "He/she doesn't know how to keep a conversation going with peers."

**Scoring Formula:** `=IF(E11="X",0,IF(F11="X",0,IF(C11="X",1,IF(D11="X",1,0))))`

**Scoring Logic:**
- "Discordo em parte" (E) = 0
- "Discordo Totalmente" (F) = 0
- "Concordo Totalmente" (C) = 1
- "Concordo em parte" (D) = 1

**Item Type:** Direct scoring (agreement scores 1 point)

---

#### Question 6 (Row 12)
**Portuguese:** "Socialmente, ele/a é bom/boa conversador/a."

**English:** "Socially, he/she is a good conversationalist."

**Scoring Formula:** `=IF(C12="X",0,IF(D12="X",0,IF(E12="X",1,IF(F12="X",1,0))))`

**Scoring Logic:**
- "Concordo Totalmente" (C) = 0
- "Concordo em parte" (D) = 0
- "Discordo em parte" (E) = 1
- "Discordo Totalmente" (F) = 1

**Item Type:** Reverse scoring (disagreement scores 1 point)

---

#### Question 7 (Row 13)
**Portuguese:** "Durante a leitura de uma história, ele/a tem dificuldades em perceber as intenções das personagens."

**English:** "When reading a story, he/she has difficulty understanding the characters' intentions."

**Scoring Formula:** `=IF(E13="X",0,IF(F13="X",0,IF(C13="X",1,IF(D13="X",1,0))))`

**Scoring Logic:**
- "Discordo em parte" (E) = 0
- "Discordo Totalmente" (F) = 0
- "Concordo Totalmente" (C) = 1
- "Concordo em parte" (D) = 1

**Item Type:** Direct scoring (agreement scores 1 point)

---

#### Question 8 (Row 14)
**Portuguese:** "No pré-escolar, ele/a gostava de brincar a jogos de faz-de-conta com as outras crianças."

**English:** "In preschool, he/she enjoyed playing pretend games with other children."

**Scoring Formula:** `=IF(C14="X",0,IF(D14="X",0,IF(E14="X",1,IF(F14="X",1,0))))`

**Scoring Logic:**
- "Concordo Totalmente" (C) = 0
- "Concordo em parte" (D) = 0
- "Discordo em parte" (E) = 1
- "Discordo Totalmente" (F) = 1

**Item Type:** Reverse scoring (disagreement scores 1 point)

---

#### Question 9 (Row 15)
**Portuguese:** "Ele/a percebe facilmente o que alguém está a pensar ou a sentir, apenas olhando para o rosto dessa pessoa."

**English:** "He/she easily perceives what someone is thinking or feeling just by looking at that person's face."

**Scoring Formula:** `=IF(C15="X",0,IF(D15="X",0,IF(E15="X",1,IF(F15="X",1,0))))`

**Scoring Logic:**
- "Concordo Totalmente" (C) = 0
- "Concordo em parte" (D) = 0
- "Discordo em parte" (E) = 1
- "Discordo Totalmente" (F) = 1

**Item Type:** Reverse scoring (disagreement scores 1 point)

---

#### Question 10 (Row 16)
**Portuguese:** "Ele/a tem dificuldades em fazer novos amigos"

**English:** "He/she has difficulty making new friends"

**Scoring Formula:** `=IF(E16="X",0,IF(F16="X",0,IF(C16="X",1,IF(D16="X",1,0))))`

**Scoring Logic:**
- "Discordo em parte" (E) = 0
- "Discordo Totalmente" (F) = 0
- "Concordo Totalmente" (C) = 1
- "Concordo em parte" (D) = 1

**Item Type:** Direct scoring (agreement scores 1 point)

---

### Total Score Calculation (Row 17)

**Formula:** `=SUM(G7:G16)`

**Location:** Cell G17

**Range:** Sum of all 10 item scores (G7 through G16)

### Sheet 3: Correção (Scoring)

**Patient Score Display:**
- Cell B4: `='Aplicação'!G17` (pulls total from Application sheet)

**Cut-off Score:**
- Cell D4: "6 PONTOS" (6 POINTS)

**Scoring Instructions (Row 7):**
"COTAÇÃO: Cote 1 ponto por cada resposta 'Concordo totalmente' ou 'Concordo em parte' dada nas questões: 1, 5, 7 e 10 e 1 ponto por cada resposta 'Discordo em parte' ou 'Discordo totalmente' dada nas questões: 2, 3, 4, 6, 8 e 9."

**Translation:**
"SCORING: Score 1 point for each 'Strongly agree' or 'Somewhat agree' response given in questions: 1, 5, 7, and 10, and 1 point for each 'Somewhat disagree' or 'Strongly disagree' response given in questions: 2, 3, 4, 6, 8, and 9."

### Scoring Summary

#### Direct Scoring Items (Agreement = 1 point):
- **Question 1**: Notices small sounds
- **Question 5**: Difficulty maintaining conversations
- **Question 7**: Difficulty understanding characters' intentions
- **Question 10**: Difficulty making new friends

#### Reverse Scoring Items (Disagreement = 1 point):
- **Question 2**: Focuses on details vs. whole picture
- **Question 3**: Following multiple conversations
- **Question 4**: Multitasking ability
- **Question 6**: Being a good conversationalist
- **Question 8**: Enjoyed pretend play
- **Question 9**: Reading facial expressions

### Interpretation

**Total Score Range:** 0-10 points

**Cut-off Score:** 6 points

**Clinical Interpretation:**
- **Score ≥ 6**: Suggests potential autism spectrum traits warranting further comprehensive assessment
- **Score < 6**: Below clinical cut-off

**Important Notes:**
- This is a SCREENING tool, not a diagnostic instrument
- Scores ≥ 6 indicate need for comprehensive autism spectrum evaluation
- Should be administered by trained professionals
- Part of broader assessment battery

### Implementation Notes

**Programming Logic (Pseudocode):**

```python
def calculate_aq10_score(responses):
    """
    Calculate AQ-10 total score

    responses: dict with keys 1-10, values in ['C', 'D', 'E', 'F']
    where C = Strongly Agree, D = Somewhat Agree,
          E = Somewhat Disagree, F = Strongly Disagree
    """

    # Direct scoring items (agreement scores)
    direct_items = [1, 5, 7, 10]

    # Reverse scoring items (disagreement scores)
    reverse_items = [2, 3, 4, 6, 8, 9]

    total_score = 0

    for item_num, response in responses.items():
        if item_num in direct_items:
            # Agreement scores 1 point
            if response in ['C', 'D']:  # Concordo Totalmente or em parte
                total_score += 1

        elif item_num in reverse_items:
            # Disagreement scores 1 point
            if response in ['E', 'F']:  # Discordo em parte or Totalmente
                total_score += 1

    return total_score

def interpret_aq10_score(score):
    """
    Interpret AQ-10 score

    score: integer 0-10
    """
    cutoff = 6

    if score >= cutoff:
        return {
            'score': score,
            'interpretation': 'Above cutoff',
            'recommendation': 'Further comprehensive autism spectrum assessment recommended',
            'clinical_significance': 'Potential autism spectrum traits present'
        }
    else:
        return {
            'score': score,
            'interpretation': 'Below cutoff',
            'recommendation': 'No immediate concern for autism spectrum traits',
            'clinical_significance': 'Score within typical range'
        }

# Example usage
responses = {
    1: 'F',  # Question 1: Discordo Totalmente = 0
    2: 'C',  # Question 2: Concordo Totalmente = 0
    3: 'D',  # Question 3: Concordo em parte = 0
    4: 'C',  # Question 4: Concordo Totalmente = 0
    5: 'D',  # Question 5: Concordo em parte = 1
    6: 'D',  # Question 6: Concordo em parte = 0
    7: 'D',  # Question 7: Concordo em parte = 1
    8: 'E',  # Question 8: Discordo em parte = 1
    9: 'C',  # Question 9: Concordo Totalmente = 0
    10: 'F'  # Question 10: Discordo Totalmente = 0
}

score = calculate_aq10_score(responses)  # Returns 3
result = interpret_aq10_score(score)
```

### Database Schema Suggestions

**For storing AQ-10 responses:**

```sql
CREATE TABLE aq10_responses (
    response_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    test_date DATE NOT NULL,

    -- Individual item responses
    q1_response CHAR(1) CHECK (q1_response IN ('C', 'D', 'E', 'F')),
    q2_response CHAR(1) CHECK (q2_response IN ('C', 'D', 'E', 'F')),
    q3_response CHAR(1) CHECK (q3_response IN ('C', 'D', 'E', 'F')),
    q4_response CHAR(1) CHECK (q4_response IN ('C', 'D', 'E', 'F')),
    q5_response CHAR(1) CHECK (q5_response IN ('C', 'D', 'E', 'F')),
    q6_response CHAR(1) CHECK (q6_response IN ('C', 'D', 'E', 'F')),
    q7_response CHAR(1) CHECK (q7_response IN ('C', 'D', 'E', 'F')),
    q8_response CHAR(1) CHECK (q8_response IN ('C', 'D', 'E', 'F')),
    q9_response CHAR(1) CHECK (q9_response IN ('C', 'D', 'E', 'F')),
    q10_response CHAR(1) CHECK (q10_response IN ('C', 'D', 'E', 'F')),

    -- Calculated scores
    total_score INTEGER CHECK (total_score BETWEEN 0 AND 10),
    above_cutoff BOOLEAN,

    -- Metadata
    administered_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to calculate score automatically
CREATE OR REPLACE FUNCTION calculate_aq10_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_score := (
        -- Direct items (1, 5, 7, 10)
        CASE WHEN NEW.q1_response IN ('C', 'D') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q5_response IN ('C', 'D') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q7_response IN ('C', 'D') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q10_response IN ('C', 'D') THEN 1 ELSE 0 END +
        -- Reverse items (2, 3, 4, 6, 8, 9)
        CASE WHEN NEW.q2_response IN ('E', 'F') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q3_response IN ('E', 'F') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q4_response IN ('E', 'F') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q6_response IN ('E', 'F') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q8_response IN ('E', 'F') THEN 1 ELSE 0 END +
        CASE WHEN NEW.q9_response IN ('E', 'F') THEN 1 ELSE 0 END
    );

    NEW.above_cutoff := (NEW.total_score >= 6);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aq10_score_calculation
BEFORE INSERT OR UPDATE ON aq10_responses
FOR EACH ROW
EXECUTE FUNCTION calculate_aq10_score();
```

---

## Summary Comparison

| Test | Age Range | Domains | Items | Scoring Method | Output |
|------|-----------|---------|-------|----------------|--------|
| IDADI 36-72 | 36-72 months | 7 domains | Variable | Normative tables, VLOOKUP chains | Dev scores, Z-scores, Std scores, Classifications |
| IDADI 4-35 | 4-35 months | 7 domains | Variable | Normative tables, VLOOKUP chains | Dev scores, Z-scores, Std scores, Classifications |
| AQ-10 | 4-11 years | Single score | 10 items | Binary scoring with reversal | Total score (0-10), Cutoff interpretation |

## Key Implementation Considerations

1. **IDADI Tests:**
   - Require large normative table storage (6-11 sheets × 7 domains each)
   - Complex chained VLOOKUP logic
   - Age-specific sheet selection
   - Multiple score outputs per domain

2. **AQ-10:**
   - Simple binary scoring logic
   - Direct item-level storage
   - Single cutoff interpretation
   - Fast calculation

3. **Common Requirements:**
   - Age calculation from birth date and test date
   - Response validation
   - Automated score calculation
   - Clinical interpretation generation
   - Report generation capabilities

---

## Appendix: Response Option Codes

### AQ-10 Response Codes

| Code | Portuguese | English |
|------|-----------|---------|
| C | Concordo Totalmente | Strongly Agree |
| D | Concordo em parte | Somewhat Agree |
| E | Discordo em parte | Somewhat Disagree |
| F | Discordo Totalmente | Strongly Disagree |

### IDADI Classifications

#### Z-Score Classifications (Portuguese → English)

| Z-Score Range | Portuguese | English |
|---------------|-----------|---------|
| > 2.0 | Muito acima do esperado | Well above expected |
| 1.51 to 2.0 | Acima do esperado | Above expected |
| 1.01 to 1.5 | Típico | Typical |
| -1.0 to 1.0 | Típico | Typical |
| -1.01 to -1.5 | Alerta para atraso | Alert for delay |
| -1.51 to -2.0 | Atraso | Delay |
| ≤ -2.0 | Atraso signifiticativo | Significant delay |

#### Standardized Score Classifications (Portuguese → English)

| Score Range | Portuguese | English |
|-------------|-----------|---------|
| > 130 | Muito Superior | Very Superior |
| 123-130 | Superior | Superior |
| 116-122 | Acima da Média | Above Average |
| 85-115 | Médio | Average |
| 78-84 | Abaixo da Média | Below Average |
| 70-77 | Inferior | Lower |
| ≤ 70 | Muito Inferior | Very Inferior |

---

**End of Report**

*Generated: 2025-12-13*
*Files Analyzed: 3 psychological test files*
*Total Pages: Comprehensive extraction of all scoring mechanisms, formulas, and normative data*
