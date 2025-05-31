'use client'

import React, { useState, useRef } from 'react'
import { SettingsStorage } from '../../services/settingsStorage'

interface SettingsImportExportProps {
  onSettingsImported?: () => void
}

export const SettingsImportExport: React.FC<SettingsImportExportProps> = ({
  onSettingsImported
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportSettings = async () => {
    setIsExporting(true)
    try {
      const settingsJson = await SettingsStorage.exportSettings()
      
      // Create and download file
      const blob = new Blob([settingsJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `diagramai-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export settings. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportSettings = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)
    setImportSuccess(false)

    try {
      const text = await file.text()
      await SettingsStorage.importSettings(text)
      
      setImportSuccess(true)
      onSettingsImported?.()
      
      // Reset success message after 3 seconds
      setTimeout(() => setImportSuccess(false), 3000)
    } catch (error) {
      console.error('Import failed:', error)
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Settings Backup & Restore
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Export your settings for backup or import settings from another device. 
        API keys are redacted during export for security.
      </p>

      <div className="space-y-4">
        {/* Export Section */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-blue-900">Export Settings</h4>
            <p className="text-xs text-blue-700 mt-1">
              Download your current settings as a JSON file
            </p>
          </div>
          <button
            onClick={handleExportSettings}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Exporting...
              </>
            ) : (
              <>
                <span className="mr-2">📥</span>
                Export
              </>
            )}
          </button>
        </div>

        {/* Import Section */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-green-900">Import Settings</h4>
            <p className="text-xs text-green-700 mt-1">
              Upload a settings file to restore your configuration
            </p>
          </div>
          <button
            onClick={handleImportSettings}
            disabled={isImporting}
            className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                Importing...
              </>
            ) : (
              <>
                <span className="mr-2">📤</span>
                Import
              </>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Import Success Message */}
        {importSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400 text-lg">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Settings imported successfully! Please validate your API keys.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Import Error Message */}
        {importError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-lg">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{importError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-lg">🔒</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Security Notice:</strong> API keys are automatically redacted during export.
                You&apos;ll need to re-enter your API keys after importing settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
