// ABOUTME: Admin page for hero data setup and bulk import operations
// ABOUTME: Allows importing hero data from JSON files and managing hero database operations

import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router'
import { Form, useLoaderData, useActionData, useNavigation } from 'react-router'
import { HeroRepository } from '~/repositories/HeroRepository'
import { transformHeroData, validateMigrationResult, createProgressCallback } from '~/lib/hero-data-migration'
import heroJson from '~/data/heroes.json'
import type { HeroRecord } from '~/data/hero.zod'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Add admin role checking
  
  const heroRepository = new HeroRepository(request)
  
  // Get current hero count from database
  const existingHeroesResult = await heroRepository.findAll()
  const existingHeroCount = existingHeroesResult.data?.length || 0
  
  // Get hero count from JSON
  const jsonHeroCount = (heroJson as HeroRecord[]).length
  
  // Preview migration data
  const migrationPreview = transformHeroData(heroJson as HeroRecord[], { skipInvalidData: true })
  const validationErrors = validateMigrationResult(migrationPreview)
  
  return data({
    existingHeroCount,
    jsonHeroCount,
    migrationPreview: {
      heroCount: migrationPreview.heroes.length,
      artifactCount: migrationPreview.artifacts.length,
      skinCount: migrationPreview.skins.length,
      glyphCount: migrationPreview.glyphs.length,
      equipmentSlotCount: migrationPreview.equipmentSlots.length,
      errorCount: migrationPreview.errors.length,
    },
    validationErrors,
    previewErrors: migrationPreview.errors.slice(0, 5), // Show first 5 errors
  })
}

export async function action({ request }: ActionFunctionArgs) {
  // TODO: Add admin role checking
  
  const formData = await request.formData()
  const action = formData.get('action')
  
  const heroRepository = new HeroRepository(request)
  
  try {
    switch (action) {
      case 'import_heroes': {
        // Transform JSON data
        const migrationData = transformHeroData(heroJson as HeroRecord[], { 
          skipInvalidData: true,
          logProgress: false,
        })
        
        // Validate migration data
        const validationErrors = validateMigrationResult(migrationData)
        if (validationErrors.length > 0) {
          return data({
            success: false,
            error: `Validation failed: ${validationErrors.join(', ')}`,
          })
        }
        
        // Import in batches
        const results = {
          heroes: 0,
          artifacts: 0,
          skins: 0,
          glyphs: 0,
          equipmentSlots: 0,
          errors: [] as string[],
        }
        
        // Import main heroes first
        if (migrationData.heroes.length > 0) {
          const heroResult = await heroRepository.bulkCreate(migrationData.heroes, {
            skipExisting: true,
            batchSize: 50,
          })
          
          if (heroResult.data) {
            results.heroes = heroResult.data.length
          }
          if (heroResult.error && heroResult.error.code !== 'BULK_PARTIAL_SUCCESS') {
            results.errors.push(`Heroes: ${heroResult.error.message}`)
          }
        }
        
        // Import artifacts
        if (migrationData.artifacts.length > 0) {
          const artifactResult = await heroRepository.bulkCreateArtifacts(migrationData.artifacts, {
            batchSize: 100,
          })
          
          if (artifactResult.data) {
            results.artifacts = artifactResult.data.length
          }
          if (artifactResult.error && artifactResult.error.code !== 'BULK_PARTIAL_SUCCESS') {
            results.errors.push(`Artifacts: ${artifactResult.error.message}`)
          }
        }
        
        // Import skins
        if (migrationData.skins.length > 0) {
          const skinResult = await heroRepository.bulkCreateSkins(migrationData.skins, {
            batchSize: 100,
          })
          
          if (skinResult.data) {
            results.skins = skinResult.data.length
          }
          if (skinResult.error && skinResult.error.code !== 'BULK_PARTIAL_SUCCESS') {
            results.errors.push(`Skins: ${skinResult.error.message}`)
          }
        }
        
        // Import glyphs
        if (migrationData.glyphs.length > 0) {
          const glyphResult = await heroRepository.bulkCreateGlyphs(migrationData.glyphs, {
            batchSize: 100,
          })
          
          if (glyphResult.data) {
            results.glyphs = glyphResult.data.length
          }
          if (glyphResult.error && glyphResult.error.code !== 'BULK_PARTIAL_SUCCESS') {
            results.errors.push(`Glyphs: ${glyphResult.error.message}`)
          }
        }
        
        // Import equipment slots
        if (migrationData.equipmentSlots.length > 0) {
          const equipmentResult = await heroRepository.bulkCreateEquipmentSlots(migrationData.equipmentSlots, {
            batchSize: 100,
          })
          
          if (equipmentResult.data) {
            results.equipmentSlots = equipmentResult.data.length
          }
          if (equipmentResult.error && equipmentResult.error.code !== 'BULK_PARTIAL_SUCCESS') {
            results.errors.push(`Equipment Slots: ${equipmentResult.error.message}`)
          }
        }
        
        return data({
          success: true,
          results,
        })
      }
      
      case 'clear_heroes': {
        // This would be a dangerous operation - for now just return not implemented
        return data({
          success: false,
          error: 'Clear heroes operation not implemented for safety',
        })
      }
      
      default:
        return data({
          success: false,
          error: 'Unknown action',
        })
    }
  } catch (error) {
    return data({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}

export default function AdminHeroSetup() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  
  if (!loaderData) {
    return <div>Loading...</div>
  }
  
  const isImporting = navigation.formData?.get('action') === 'import_heroes'
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hero Data Setup</h1>
        <p className="text-muted-foreground">
          Manage hero data import and database operations
        </p>
      </div>
      
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>
            Hero data currently in the database vs JSON source
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{loaderData.existingHeroCount}</div>
              <div className="text-sm text-muted-foreground">Heroes in Database</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{loaderData.jsonHeroCount}</div>
              <div className="text-sm text-muted-foreground">Heroes in JSON Source</div>
            </div>
          </div>
          
          {loaderData.existingHeroCount === 0 && (
            <Alert>
              <AlertDescription>
                No heroes found in database. Import JSON data to get started.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Migration Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Import Preview</CardTitle>
          <CardDescription>
            Data that will be imported from heroes.json
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-semibold">{loaderData.migrationPreview.heroCount}</div>
              <div className="text-sm text-muted-foreground">Heroes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{loaderData.migrationPreview.artifactCount}</div>
              <div className="text-sm text-muted-foreground">Artifacts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{loaderData.migrationPreview.skinCount}</div>
              <div className="text-sm text-muted-foreground">Skins</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{loaderData.migrationPreview.glyphCount}</div>
              <div className="text-sm text-muted-foreground">Glyphs</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{loaderData.migrationPreview.equipmentSlotCount}</div>
              <div className="text-sm text-muted-foreground">Equipment Slots</div>
            </div>
          </div>
          
          {loaderData.migrationPreview.errorCount > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Found {loaderData.migrationPreview.errorCount} errors in source data:
                <ul className="mt-2 list-disc list-inside">
                  {loaderData.previewErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
                {loaderData.migrationPreview.errorCount > 5 && (
                  <p className="text-sm mt-1">...and {loaderData.migrationPreview.errorCount - 5} more</p>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {loaderData.validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Validation errors found:
                <ul className="mt-2 list-disc list-inside">
                  {loaderData.validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Import Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Actions</CardTitle>
          <CardDescription>
            Bulk operations for hero data management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form method="post">
            <input type="hidden" name="action" value="import_heroes" />
            <Button 
              type="submit" 
              disabled={isImporting || loaderData.validationErrors.length > 0}
              size="lg"
            >
              {isImporting ? 'Importing Heroes...' : 'Import Heroes from JSON'}
            </Button>
            
            {isImporting && (
              <div className="mt-4">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  Importing hero data to database...
                </p>
              </div>
            )}
          </Form>
          
          <p className="text-sm text-muted-foreground">
            This will import all hero data from the JSON source files into the database.
            Existing heroes will be skipped to avoid duplicates.
          </p>
        </CardContent>
      </Card>
      
      {/* Results */}
      {actionData && 'success' in actionData && (
        <Card>
          <CardHeader>
            <CardTitle>
              Import Results
              <Badge variant={actionData.success ? "default" : "destructive"} className="ml-2">
                {actionData.success ? "Success" : "Error"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionData.success ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Hero data import completed successfully!
                  </AlertDescription>
                </Alert>
                
                {actionData.success && 'results' in actionData && actionData.results && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{actionData.results.heroes}</div>
                      <div className="text-sm text-muted-foreground">Heroes Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{actionData.results.artifacts}</div>
                      <div className="text-sm text-muted-foreground">Artifacts Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{actionData.results.skins}</div>
                      <div className="text-sm text-muted-foreground">Skins Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{actionData.results.glyphs}</div>
                      <div className="text-sm text-muted-foreground">Glyphs Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{actionData.results.equipmentSlots}</div>
                      <div className="text-sm text-muted-foreground">Equipment Slots Created</div>
                    </div>
                  </div>
                )}
                
                {actionData.success && 'results' in actionData && actionData.results?.errors && actionData.results.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Some operations had warnings:
                      <ul className="mt-2 list-disc list-inside">
                        {actionData.results.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  Import failed: {'error' in actionData ? actionData.error : 'Unknown error'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}