// Native file download helper (replaces file-saver)
const saveAs = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Allowed file extensions for import
const ALLOWED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx',
  '.py', '.pyw',
  '.java',
  '.c', '.cpp', '.h', '.hpp',
  '.go',
  '.rs',
  '.html', '.htm',
  '.css', '.scss', '.sass', '.less',
  '.json', '.xml', '.yaml', '.yml',
  '.md', '.txt',
  '.sql',
  '.php',
  '.rb',
  '.swift',
  '.kt', '.kts',
  '.sh', '.bash', '.zsh',
  '.vue', '.svelte',
]

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Max total size for folder import (20MB)
const MAX_FOLDER_SIZE = 20 * 1024 * 1024

export interface ImportedFile {
  name: string
  path: string
  content: string
  size: number
  type: string
}

export const useFileManager = () => {
  const importedFiles = ref<ImportedFile[]>([])
  const isImporting = ref(false)
  const error = ref<string | null>(null)

  // Check if file extension is allowed
  const isAllowedFile = (filename: string): boolean => {
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    return ALLOWED_EXTENSIONS.includes(ext)
  }

  // Get language from file extension
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'pyw': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'cpp',
      'hpp': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'css',
      'sass': 'css',
      'less': 'css',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'text',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'kts': 'kotlin',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'vue': 'html',
      'svelte': 'html',
    }
    return langMap[ext || ''] || 'text'
  }

  // Import single file
  const importFile = async (file: File): Promise<ImportedFile | null> => {
    if (!isAllowedFile(file.name)) {
      error.value = `File type not allowed: ${file.name}`
      return null
    }

    if (file.size > MAX_FILE_SIZE) {
      error.value = `File too large: ${file.name} (max 5MB)`
      return null
    }

    try {
      const content = await file.text()
      return {
        name: file.name,
        path: file.name,
        content,
        size: file.size,
        type: getLanguageFromExtension(file.name),
      }
    } catch (err: any) {
      error.value = `Failed to read file: ${file.name}`
      return null
    }
  }

  // Import multiple files
  const importFiles = async (files: FileList | File[]): Promise<ImportedFile[]> => {
    isImporting.value = true
    error.value = null
    const results: ImportedFile[] = []

    for (const file of Array.from(files)) {
      const imported = await importFile(file)
      if (imported) {
        results.push(imported)
      }
    }

    importedFiles.value = [...importedFiles.value, ...results]
    isImporting.value = false
    return results
  }

  // Import folder (using File System Access API)
  const importFolder = async (): Promise<ImportedFile[]> => {
    if (!('showDirectoryPicker' in window)) {
      error.value = 'Folder import not supported in this browser'
      return []
    }

    isImporting.value = true
    error.value = null
    const results: ImportedFile[] = []
    let totalSize = 0

    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker()

      const processDirectory = async (handle: any, path: string = '') => {
        for await (const entry of handle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name

          if (entry.kind === 'file') {
            if (!isAllowedFile(entry.name)) continue

            const file = await entry.getFile()
            if (file.size > MAX_FILE_SIZE) continue
            if (totalSize + file.size > MAX_FOLDER_SIZE) {
              error.value = 'Folder size limit exceeded (max 20MB)'
              break
            }

            totalSize += file.size
            const content = await file.text()

            results.push({
              name: entry.name,
              path: entryPath,
              content,
              size: file.size,
              type: getLanguageFromExtension(entry.name),
            })
          } else if (entry.kind === 'directory') {
            // Skip node_modules, .git, etc.
            const skipDirs = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', '.nuxt']
            if (!skipDirs.includes(entry.name)) {
              await processDirectory(entry, entryPath)
            }
          }
        }
      }

      await processDirectory(dirHandle)
      importedFiles.value = [...importedFiles.value, ...results]
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        error.value = `Failed to import folder: ${err.message}`
      }
    }

    isImporting.value = false
    return results
  }

  // Export file
  const exportFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    saveAs(blob, filename)
  }

  // Export multiple files as zip
  // TODO: Re-enable when jszip is installed (bun add jszip)
  const exportFilesAsZip = async (files: { name: string; content: string }[]) => {
    console.warn('Zip export is currently disabled. Exporting files individually...')
    // Fallback: export files individually
    files.forEach(file => {
      exportFile(file.content, file.name)
    })
  }

  // Clear imported files
  const clearImportedFiles = () => {
    importedFiles.value = []
  }

  // Remove specific file
  const removeImportedFile = (path: string) => {
    importedFiles.value = importedFiles.value.filter(f => f.path !== path)
  }

  // Open file picker
  const openFilePicker = async (): Promise<ImportedFile[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = ALLOWED_EXTENSIONS.join(',')

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files) {
          const results = await importFiles(files)
          resolve(results)
        } else {
          resolve([])
        }
      }

      input.click()
    })
  }

  return {
    importedFiles: readonly(importedFiles),
    isImporting: readonly(isImporting),
    error: readonly(error),
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    MAX_FOLDER_SIZE,
    isAllowedFile,
    getLanguageFromExtension,
    importFile,
    importFiles,
    importFolder,
    exportFile,
    exportFilesAsZip,
    clearImportedFiles,
    removeImportedFile,
    openFilePicker,
  }
}
