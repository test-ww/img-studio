'use client'

import { createContext, useState, useEffect, useContext } from 'react'
import { exportStandardFields, ExportMediaFormFieldsI } from '../api/export-utils'
import { fetchJsonFromStorage } from '../api/cloud-storage/action'

export interface appContextDataI {
  gcsURI?: string
  userID?: string
  exportMetaOptions?: ExportMediaFormFieldsI
  isLoading: boolean
  imageToEdit?: string
  imageToVideo?: string
  promptToGenerateImage?: string
  promptToGenerateVideo?: string
}

interface AppContextType {
  appContext: appContextDataI | null
  setAppContext: React.Dispatch<React.SetStateAction<AppContextType['appContext']>>
  error: Error | string | null
  setError: React.Dispatch<React.SetStateAction<Error | string | null>>
}

export const appContextDataDefault = {
  gcsURI: '',
  userID: '',
  exportMetaOptions: undefined,
  isLoading: true,
  imageToEdit: '',
  imageToVideo: '',
  promptToGenerateImage: '',
  promptToGenerateVideo: '',
}

const AppContext = createContext<AppContextType>({
  appContext: appContextDataDefault,
  setAppContext: () => {},
  error: null,
  setError: () => {},
})

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [appContext, setAppContext] = useState<AppContextType['appContext']>(appContextDataDefault)
  const [error, setError] = useState<Error | string | null>(null)

  useEffect(() => {
    async function fetchAndUpdateContext() {
      try {
        // 0. 检查必需环境变量
        if (
          !process.env.NEXT_PUBLIC_PROJECT_ID ||
          !process.env.NEXT_PUBLIC_VERTEX_API_LOCATION ||
          !process.env.NEXT_PUBLIC_GCS_BUCKET_LOCATION ||
          !process.env.NEXT_PUBLIC_GEMINI_MODEL ||
          !process.env.NEXT_PUBLIC_OUTPUT_BUCKET ||
          !process.env.NEXT_PUBLIC_TEAM_BUCKET ||
          !process.env.NEXT_PUBLIC_EXPORT_FIELDS_OPTIONS_URI
        ) {
          throw Error('Missing required environment variables')
        }

        if (process.env.NEXT_PUBLIC_EDIT_ENABLED === 'true' && !process.env.NEXT_PUBLIC_SEG_MODEL) {
          throw Error('Missing required environment variables for editing')
        }

        // 1. 获取用户 ID（支持匿名）
        let fetchedUserID = 'anonymous@public'

        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEST_DEV_USER_ID) {
          fetchedUserID = process.env.NEXT_PUBLIC_TEST_DEV_USER_ID
        } else {
          try {
            const response = await fetch('/api/google-auth')
            const authParams = await response.json()

            if (authParams?.targetPrincipal) {
              let targetPrincipal: string = authParams['targetPrincipal']
              const filters = process.env.NEXT_PUBLIC_PRINCIPAL_TO_USER_FILTERS || ''
              filters.split(',').forEach((f) => (targetPrincipal = targetPrincipal.replace(f, '')))
              fetchedUserID = targetPrincipal
            }
          } catch (err) {
            console.warn('使用匿名身份访问，跳过身份校验')
          }
        }

        // 2. 设置 GCS URI
        const gcsURI = `gs://${process.env.NEXT_PUBLIC_OUTPUT_BUCKET}`

        // 3. 获取导出元数据选项
        let exportMetaOptions: any = {}
        try {
          exportMetaOptions = await fetchJsonFromStorage(process.env.NEXT_PUBLIC_EXPORT_FIELDS_OPTIONS_URI!)
        } catch {
          throw Error('无法获取导出字段配置')
        }

        const ExportImageFormFields: ExportMediaFormFieldsI = {
          ...exportStandardFields,
          ...exportMetaOptions,
        }

        // 4. 设置上下文
        setAppContext({
          userID: fetchedUserID,
          gcsURI,
          exportMetaOptions: ExportImageFormFields,
          isLoading: false,
        })
      } catch (err) {
        console.error('初始化失败:', err)
        setAppContext({
          ...appContextDataDefault,
          userID: 'anonymous@public',
          isLoading: false,
        })
        setError('初始化失败')
      }
    }

    fetchAndUpdateContext()
  }, [])

  return (
    <AppContext.Provider value={{ appContext, setAppContext, error, setError }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
