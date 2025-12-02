'use client'

import { RotateCcw, Eye, CheckCircle, Clock } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { VersionHistoryProps, TestVersion } from '@/types/biblioteca'

export function VersionHistory({
  versions,
  currentVersionId,
  onRestore,
  onViewVersion,
  disabled = false
}: VersionHistoryProps) {
  const [restoring, setRestoring] = React.useState<string | null>(null)

  const handleRestore = async (versionId: string) => {
    if (disabled || versionId === currentVersionId) return
    setRestoring(versionId)
    try {
      await onRestore(versionId)
    } finally {
      setRestoring(null)
    }
  }

  const getVersionLabel = (version: TestVersion) => {
    if (version.versao) {
      return `v${version.versao} (${version.versao_numero})`
    }
    return `Versão ${version.versao_numero}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Versões ({versions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma versão anterior encontrada.</p>
            <p className="text-sm mt-1">Ao editar o teste, novas versões serão criadas automaticamente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => {
              const isCurrent = version.id === currentVersionId
              const isActive = version.ativo

              return (
                <div
                  key={version.id}
                  className={cn(
                    'flex items-start justify-between p-4 rounded-lg border',
                    isCurrent && 'border-primary bg-primary/5',
                    !isActive && !isCurrent && 'opacity-60'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getVersionLabel(version)}</span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Atual
                        </span>
                      )}
                      {!isActive && !isCurrent && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Inativa
                        </span>
                      )}
                    </div>

                    {version.motivo_alteracao && (
                      <p className="text-sm text-muted-foreground mb-1 truncate">
                        {version.motivo_alteracao}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {version.alterado_em && (
                        <span>{formatDateTime(version.alterado_em)}</span>
                      )}
                      {!version.alterado_em && version.created_at && (
                        <span>{formatDateTime(version.created_at)}</span>
                      )}
                      {version.alterado_por_nome && (
                        <span>por {version.alterado_por_nome}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {onViewVersion && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewVersion(version.id)}
                        disabled={disabled}
                        title="Visualizar versão"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {!isCurrent && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                        disabled={disabled || restoring === version.id}
                        title="Restaurar esta versão"
                      >
                        {restoring === version.id ? (
                          <span className="flex items-center gap-1">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          </span>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restaurar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
