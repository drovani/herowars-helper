import { CheckCircle, ChevronDown, ChevronRight, ExternalLink, FileText, XCircle, Filter, Blocks, Navigation, Anchor, Wrench, TestTube, Cog } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useLoaderData } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { Progress } from '~/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import testCoverageData from '~/data/test-coverage.json'
import { createClient } from '~/lib/supabase/client'

interface CoverageFile {
  path: string
  statementMap: Record<string, any>
  fnMap: Record<string, any>
  branchMap: Record<string, any>
  s: Record<string, number>
  f: Record<string, number>
  b: Record<string, number[]>
}

interface CoverageSummary {
  lines: { total: number; covered: number; skipped: number; pct: number }
  functions: { total: number; covered: number; skipped: number; pct: number }
  statements: { total: number; covered: number; skipped: number; pct: number }
  branches: { total: number; covered: number; skipped: number; pct: number }
}

interface CoverageData {
  [filePath: string]: CoverageFile | CoverageSummary
}

export async function loader({ request }: { request: Request }) {
  const { supabase } = createClient(request)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const userRoles = user.app_metadata?.roles || ['user']
  if (!userRoles.includes('admin')) {
    throw new Response('Forbidden - Admin access required', { status: 403 })
  }

  // Get file stats for coverage data timestamp
  const fs = await import('fs')
  const path = await import('path')
  const coverageFilePath = path.resolve('app/data/test-coverage.json')

  let lastUpdated = new Date().toISOString()
  try {
    const stats = fs.statSync(coverageFilePath)
    lastUpdated = stats.mtime.toISOString()
  } catch (error) {
    // File doesn't exist or can't be read
  }

  return Response.json({
    coverage: testCoverageData as CoverageData,
    lastUpdated
  })
}

function formatPercentage(pct: number): string {
  return `${pct.toFixed(1)}%`
}

function getBadgeVariant(pct: number): "default" | "secondary" | "destructive" | "outline" {
  if (pct >= 80) return "default"
  if (pct >= 60) return "secondary"
  if (pct >= 40) return "outline"
  return "destructive"
}

type CoverageThreshold = 'all' | 'high' | 'medium' | 'low' | 'uncovered'
type FileType = 'all' | 'components' | 'routes' | 'hooks' | 'utils' | 'tests' | 'config'
type CoverageIssue = 'all' | 'uncovered-functions' | 'uncovered-branches' | 'uncovered-statements' | 'mixed-coverage'

function getCoverageThreshold(pct: number): CoverageThreshold {
  if (pct === 0) return 'uncovered'
  if (pct >= 80) return 'high'
  if (pct >= 40) return 'medium'
  return 'low'
}

function getFileType(filePath: string): FileType {
  const cleanPath = filePath.replace(/^\/.*\/inavord-react-router\//, '')
  if (cleanPath.startsWith('app/components/')) return 'components'
  if (cleanPath.startsWith('app/routes/')) return 'routes'
  if (cleanPath.startsWith('app/hooks/')) return 'hooks'
  if (cleanPath.startsWith('app/lib/') || cleanPath.startsWith('app/utils/')) return 'utils'
  if (cleanPath.startsWith('app/__tests__/') || cleanPath.includes('.test.')) return 'tests'
  return 'config'
}

function getFileTypeIcon(fileType: FileType) {
  switch (fileType) {
    case 'components': return Blocks
    case 'routes': return Navigation
    case 'hooks': return Anchor
    case 'utils': return Wrench
    case 'tests': return TestTube
    case 'config': return Cog
    default: return FileText
  }
}

function getCoverageIssues(fileData: CoverageFile): CoverageIssue[] {
  const issues: CoverageIssue[] = []
  
  const uncoveredFunctions = Object.values(fileData.f).filter(count => count === 0).length
  const uncoveredBranches = Object.values(fileData.b).reduce((sum, branches) => 
    sum + branches.filter(count => count === 0).length, 0)
  const uncoveredStatements = Object.values(fileData.s).filter(count => count === 0).length
  
  const totalFunctions = Object.keys(fileData.f).length
  const totalBranches = Object.values(fileData.b).reduce((sum, branches) => sum + branches.length, 0)
  const totalStatements = Object.keys(fileData.s).length
  
  if (uncoveredFunctions > 0) issues.push('uncovered-functions')
  if (uncoveredBranches > 0) issues.push('uncovered-branches')
  if (uncoveredStatements > 0) issues.push('uncovered-statements')
  
  // Mixed coverage: has some covered and some uncovered code
  const hasCoveredCode = (
    (totalFunctions > uncoveredFunctions) ||
    (totalBranches > uncoveredBranches) ||
    (totalStatements > uncoveredStatements)
  )
  const hasUncoveredCode = uncoveredFunctions > 0 || uncoveredBranches > 0 || uncoveredStatements > 0
  
  if (hasCoveredCode && hasUncoveredCode) {
    issues.push('mixed-coverage')
  }
  
  return issues
}

function FileDetails({ filePath, fileData }: { filePath: string; fileData: CoverageFile }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Get file type and icon
  const fileType = getFileType(filePath)
  const FileTypeIcon = getFileTypeIcon(fileType)

  // Calculate coverage percentages
  const totalStatements = Object.keys(fileData.s).length
  const coveredStatements = Object.values(fileData.s).filter(count => count > 0).length
  const statementPct = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0

  const totalFunctions = Object.keys(fileData.f).length
  const coveredFunctions = Object.values(fileData.f).filter(count => count > 0).length
  const functionPct = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0

  const totalBranches = Object.values(fileData.b).reduce((sum, branches) => sum + branches.length, 0)
  const coveredBranches = Object.values(fileData.b).reduce((sum, branches) =>
    sum + branches.filter(count => count > 0).length, 0)
  const branchPct = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0

  // Helper function to open file in VS Code
  const openInVSCode = (lineNumber?: number) => {
    const cleanPath = filePath.replace(/^\/.*\/inavord-react-router\//, '')
    // For local development, assume the project is in the current working directory
    const fullPath = `${window.location.origin.includes('localhost') ? '/home/drovani/inavord-react-router' : ''}/${cleanPath}`
    const uri = lineNumber
      ? `vscode://file${fullPath}:${lineNumber}`
      : `vscode://file${fullPath}`
    window.location.href = uri
  }

  // Helper function to open file on GitHub
  const openOnGitHub = (lineNumber?: number) => {
    const cleanPath = filePath.replace(/^\/.*\/inavord-react-router\//, '')
    // Update this with your actual GitHub repository URL
    const githubUrl = lineNumber
      ? `https://github.com/drovani/inavord-react-router/blob/main/${cleanPath}#L${lineNumber}`
      : `https://github.com/drovani/inavord-react-router/blob/main/${cleanPath}`
    window.open(githubUrl, '_blank')
  }

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isOpen ? <ChevronDown className="size-4 flex-shrink-0" /> : <ChevronRight className="size-4 flex-shrink-0" />}
                <FileTypeIcon className="size-4 flex-shrink-0" />
                <CardTitle className="text-sm font-mono truncate">{filePath.replace(/^\/.*\/inavord-react-router\//, '')}</CardTitle>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    openInVSCode()
                  }}
                  className="h-6 px-1 sm:px-2 text-xs"
                >
                  <ExternalLink className="size-3 mr-1" />
                  <span>VS Code</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    openOnGitHub()
                  }}
                  className="h-6 px-1 sm:px-2 text-xs"
                >
                  <ExternalLink className="size-3 mr-1" />
                  <span>GitHub</span>
                </Button>
                <Badge variant={getBadgeVariant(statementPct)} className="text-xs">
                  {formatPercentage(statementPct)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Statements</span>
                  <span className="text-sm">{coveredStatements}/{totalStatements}</span>
                </div>
                <Progress value={statementPct} className="h-2" />
                <span className="text-xs text-muted-foreground">{formatPercentage(statementPct)}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Functions</span>
                  <span className="text-sm">{coveredFunctions}/{totalFunctions}</span>
                </div>
                <Progress value={functionPct} className="h-2" />
                <span className="text-xs text-muted-foreground">{formatPercentage(functionPct)}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Branches</span>
                  <span className="text-sm">{coveredBranches}/{totalBranches}</span>
                </div>
                <Progress value={branchPct} className="h-2" />
                <span className="text-xs text-muted-foreground">{formatPercentage(branchPct)}</span>
              </div>
            </div>

            {/* Uncovered statements */}
            {totalStatements > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Coverage Details</h4>
                <div className="grid grid-cols-1 gap-2 text-xs max-h-96 overflow-y-auto">
                  {Object.entries(fileData.s).map(([statementId, count]) => {
                    const statementInfo = fileData.statementMap[statementId]
                    const lineNumber = statementInfo?.start?.line

                    return (
                      <div key={statementId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded border gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {count > 0 ? (
                            <CheckCircle className="size-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="size-3 text-red-500 flex-shrink-0" />
                          )}
                          <span className="font-mono text-xs break-all">
                            Statement {statementId}: {count > 0 ? `Hit ${count} times` : 'Not covered'}
                            {lineNumber && <span className="text-muted-foreground ml-2">(Line {lineNumber})</span>}
                          </span>
                        </div>
                        {count === 0 && lineNumber && (
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInVSCode(lineNumber)}
                              className="h-6 px-2 text-xs"
                            >
                              VS Code
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openOnGitHub(lineNumber)}
                              className="h-6 px-2 text-xs"
                            >
                              GitHub
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default function AdminTestCoverage() {
  const data = useLoaderData<typeof loader>()
  const { coverage, lastUpdated } = data as { coverage: CoverageData; lastUpdated: string }

  // Filter state
  const [coverageFilter, setCoverageFilter] = useState<CoverageThreshold>('all')
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType>('all')
  const [issueFilter, setIssueFilter] = useState<CoverageIssue>('all')

  // Separate files from summary data
  const allFiles = Object.entries(coverage).filter(([key]) => !key.includes('total'))
  const summary = (coverage as any).total as CoverageSummary | undefined

  // Filter files based on selected criteria
  const filteredFiles = useMemo(() => {
    return allFiles.filter(([filePath, fileData]) => {
      const file = fileData as CoverageFile
      
      // Calculate statement coverage percentage
      const totalStatements = Object.keys(file.s).length
      const coveredStatements = Object.values(file.s).filter(count => count > 0).length
      const statementPct = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
      
      // Coverage threshold filter
      if (coverageFilter !== 'all') {
        const threshold = getCoverageThreshold(statementPct)
        if (threshold !== coverageFilter) return false
      }
      
      // File type filter
      if (fileTypeFilter !== 'all') {
        const fileType = getFileType(filePath)
        if (fileType !== fileTypeFilter) return false
      }
      
      // Coverage issues filter
      if (issueFilter !== 'all') {
        const issues = getCoverageIssues(file)
        if (!issues.includes(issueFilter)) return false
      }
      
      return true
    })
  }, [allFiles, coverageFilter, fileTypeFilter, issueFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Test Coverage</h1>
          <p className="text-muted-foreground">
            Code coverage analysis from test execution
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-mono">
            {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Overall Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Coverage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatPercentage(summary.statements.pct)}
                </div>
                <div className="text-sm text-muted-foreground">Statements</div>
                <div className="text-xs">
                  {summary.statements.covered}/{summary.statements.total}
                </div>
                <Progress value={summary.statements.pct} className="mt-2 h-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatPercentage(summary.branches.pct)}
                </div>
                <div className="text-sm text-muted-foreground">Branches</div>
                <div className="text-xs">
                  {summary.branches.covered}/{summary.branches.total}
                </div>
                <Progress value={summary.branches.pct} className="mt-2 h-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatPercentage(summary.functions.pct)}
                </div>
                <div className="text-sm text-muted-foreground">Functions</div>
                <div className="text-xs">
                  {summary.functions.covered}/{summary.functions.total}
                </div>
                <Progress value={summary.functions.pct} className="mt-2 h-2" />
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatPercentage(summary.lines.pct)}
                </div>
                <div className="text-sm text-muted-foreground">Lines</div>
                <div className="text-xs">
                  {summary.lines.covered}/{summary.lines.total}
                </div>
                <Progress value={summary.lines.pct} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="size-4" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coverage Threshold</label>
              <Select value={coverageFilter} onValueChange={(value: CoverageThreshold) => setCoverageFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All coverage levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="high">High Coverage (≥80%)</SelectItem>
                  <SelectItem value="medium">Medium Coverage (40-79%)</SelectItem>
                  <SelectItem value="low">Low Coverage (&lt;40%)</SelectItem>
                  <SelectItem value="uncovered">Uncovered (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">File Type</label>
              <Select value={fileTypeFilter} onValueChange={(value: FileType) => setFileTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All file types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="components">
                    <div className="flex items-center gap-2">
                      <Blocks className="size-4" />
                      Components
                    </div>
                  </SelectItem>
                  <SelectItem value="routes">
                    <div className="flex items-center gap-2">
                      <Navigation className="size-4" />
                      Routes
                    </div>
                  </SelectItem>
                  <SelectItem value="hooks">
                    <div className="flex items-center gap-2">
                      <Anchor className="size-4" />
                      Hooks
                    </div>
                  </SelectItem>
                  <SelectItem value="utils">
                    <div className="flex items-center gap-2">
                      <Wrench className="size-4" />
                      Utilities
                    </div>
                  </SelectItem>
                  <SelectItem value="tests">
                    <div className="flex items-center gap-2">
                      <TestTube className="size-4" />
                      Tests
                    </div>
                  </SelectItem>
                  <SelectItem value="config">
                    <div className="flex items-center gap-2">
                      <Cog className="size-4" />
                      Configuration
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Coverage Issues</label>
              <Select value={issueFilter} onValueChange={(value: CoverageIssue) => setIssueFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All issues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="uncovered-functions">Uncovered Functions</SelectItem>
                  <SelectItem value="uncovered-branches">Uncovered Branches</SelectItem>
                  <SelectItem value="uncovered-statements">Uncovered Statements</SelectItem>
                  <SelectItem value="mixed-coverage">Mixed Coverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter results summary */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredFiles.length} of {allFiles.length} files
            </p>
            
            {(coverageFilter !== 'all' || fileTypeFilter !== 'all' || issueFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCoverageFilter('all')
                  setFileTypeFilter('all')
                  setIssueFilter('all')
                }}
                className="h-8 px-3 text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File-by-file breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">File Coverage Details</h2>
        {filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No files match the selected filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map(([filePath, fileData]) => (
              <FileDetails
                key={filePath}
                filePath={filePath}
                fileData={fileData as CoverageFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}