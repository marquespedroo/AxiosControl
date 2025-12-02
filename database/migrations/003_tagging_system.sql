-- ===================================
-- MIGRATION 003: Tagging System
-- NeuroTest Platform Database
-- ===================================

-- ===================================
-- TAGS TABLE
-- ===================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL, -- 'populacao', 'dominio_clinico', 'faixa_etaria', 'instrumento'
  cor VARCHAR(7) DEFAULT '#6366f1', -- Hex color for UI display
  icone VARCHAR(50), -- Icon name for UI (e.g., 'users', 'brain', 'heart')
  ordem INTEGER DEFAULT 0, -- For sorting within category
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT tags_nome_min_length CHECK (LENGTH(nome) >= 2),
  CONSTRAINT tags_slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT tags_categoria_valida CHECK (categoria IN ('populacao', 'dominio_clinico', 'faixa_etaria', 'instrumento')),
  CONSTRAINT tags_cor_format CHECK (cor ~* '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_categoria ON tags(categoria);
CREATE INDEX idx_tags_ativo ON tags(ativo) WHERE ativo = true;

COMMENT ON TABLE tags IS 'Sistema de tags para categorização de testes psicológicos';
COMMENT ON COLUMN tags.categoria IS 'Categoria da tag: populacao (adultos, criancas), dominio_clinico (depressao, ansiedade), faixa_etaria, instrumento';
COMMENT ON COLUMN tags.slug IS 'Identificador único amigável para URLs (ex: depressao-infantil)';
COMMENT ON COLUMN tags.cor IS 'Cor hexadecimal para exibição na UI';

-- ===================================
-- JUNCTION TABLE: TESTES_TEMPLATES <-> TAGS
-- ===================================

CREATE TABLE testes_templates_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teste_template_id UUID NOT NULL REFERENCES testes_templates(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT testes_templates_tags_unique UNIQUE (teste_template_id, tag_id)
);

CREATE INDEX idx_testes_tags_teste ON testes_templates_tags(teste_template_id);
CREATE INDEX idx_testes_tags_tag ON testes_templates_tags(tag_id);

COMMENT ON TABLE testes_templates_tags IS 'Relação N:N entre testes e tags';

-- ===================================
-- UPDATED_AT TRIGGER
-- ===================================

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- HELPFUL FUNCTIONS
-- ===================================

-- Function to get all tags for a test
CREATE OR REPLACE FUNCTION get_teste_tags(p_teste_template_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'nome', t.nome,
        'slug', t.slug,
        'categoria', t.categoria,
        'cor', t.cor,
        'icone', t.icone
      ) ORDER BY t.categoria, t.ordem, t.nome
    ), '[]'::jsonb)
    FROM tags t
    INNER JOIN testes_templates_tags ttt ON t.id = ttt.tag_id
    WHERE ttt.teste_template_id = p_teste_template_id
    AND t.ativo = true
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_teste_tags IS 'Retorna todas as tags de um teste em formato JSONB';

-- Function to search tests by tags
CREATE OR REPLACE FUNCTION search_testes_by_tags(p_tag_slugs TEXT[])
RETURNS TABLE (teste_template_id UUID, match_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ttt.teste_template_id,
    COUNT(DISTINCT t.id)::INTEGER as match_count
  FROM testes_templates_tags ttt
  INNER JOIN tags t ON t.id = ttt.tag_id
  WHERE t.slug = ANY(p_tag_slugs)
  AND t.ativo = true
  GROUP BY ttt.teste_template_id
  ORDER BY match_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_testes_by_tags IS 'Busca testes que possuem as tags especificadas';

-- ===================================
-- SEED COMMON TAGS
-- ===================================

-- Population tags (quem o teste é aplicado)
INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('Adultos', 'adultos', 'Testes validados para população adulta (18+ anos)', 'populacao', '#3b82f6', 'users', 1),
('Crianças', 'criancas', 'Testes validados para crianças (até 12 anos)', 'populacao', '#22c55e', 'baby', 2),
('Adolescentes', 'adolescentes', 'Testes validados para adolescentes (12-17 anos)', 'populacao', '#f59e0b', 'graduation-cap', 3),
('Idosos', 'idosos', 'Testes validados para população idosa (60+ anos)', 'populacao', '#8b5cf6', 'heart-pulse', 4);

-- Clinical domain tags (o que o teste avalia)
INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('Depressão', 'depressao', 'Avaliação de sintomas depressivos', 'dominio_clinico', '#6366f1', 'cloud-rain', 1),
('Ansiedade', 'ansiedade', 'Avaliação de sintomas ansiosos', 'dominio_clinico', '#ec4899', 'activity', 2),
('TDAH', 'tdah', 'Transtorno de Déficit de Atenção e Hiperatividade', 'dominio_clinico', '#f97316', 'zap', 3),
('Cognição', 'cognicao', 'Avaliação de funções cognitivas', 'dominio_clinico', '#14b8a6', 'brain', 4),
('Personalidade', 'personalidade', 'Avaliação de traços de personalidade', 'dominio_clinico', '#a855f7', 'user-circle', 5),
('Comportamento', 'comportamento', 'Avaliação comportamental', 'dominio_clinico', '#ef4444', 'activity', 6),
('Estresse', 'estresse', 'Avaliação de níveis de estresse', 'dominio_clinico', '#f59e0b', 'flame', 7),
('Autoestima', 'autoestima', 'Avaliação de autoestima e autoconceito', 'dominio_clinico', '#10b981', 'heart', 8),
('Fobia Social', 'fobia-social', 'Avaliação de ansiedade social', 'dominio_clinico', '#6366f1', 'users', 9),
('Humor', 'humor', 'Avaliação de transtornos de humor', 'dominio_clinico', '#8b5cf6', 'sun', 10);

-- Instrument type tags (tipo de instrumento)
INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('Escala de Autorelato', 'escala-autorelato', 'Instrumentos de autorrelato/autoaplicação', 'instrumento', '#64748b', 'clipboard-list', 1),
('Inventário', 'inventario', 'Inventários padronizados', 'instrumento', '#64748b', 'list-checks', 2),
('Questionário', 'questionario', 'Questionários estruturados', 'instrumento', '#64748b', 'file-question', 3),
('Screening', 'screening', 'Instrumentos de rastreamento/triagem', 'instrumento', '#64748b', 'search', 4);

-- Age range specific tags
INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('8-18 anos', '8-18-anos', 'Validado para faixa etária de 8 a 18 anos', 'faixa_etaria', '#94a3b8', 'calendar', 1),
('7-17 anos', '7-17-anos', 'Validado para faixa etária de 7 a 17 anos', 'faixa_etaria', '#94a3b8', 'calendar', 2),
('6-12 anos', '6-12-anos', 'Validado para faixa etária de 6 a 12 anos', 'faixa_etaria', '#94a3b8', 'calendar', 3);
