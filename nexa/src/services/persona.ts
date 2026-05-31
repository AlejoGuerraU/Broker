export interface PersonaProfile {
  id: number
  nombre: string
  correo: string
  telefono: string | null
}

export interface UpdatePersonaProfilePayload {
  telefono: string
}

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) {
    return 'http://localhost:8080/api'
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const backendApiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL)

const buildBackendUrl = (path: string) => `${backendApiBaseUrl}${path}`

const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export const getPersonaProfile = async (token?: string): Promise<PersonaProfile> => {
  const response = await fetch(buildBackendUrl('/personas/me'), {
    headers: getAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error('No se pudo obtener el perfil de persona')
  }

  return response.json()
}

export const updatePersonaProfile = async (
  profile: UpdatePersonaProfilePayload,
  token?: string,
): Promise<PersonaProfile> => {
  const response = await fetch(buildBackendUrl('/personas/me'), {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    throw new Error('No se pudo actualizar el perfil de persona')
  }

  return response.json()
}
