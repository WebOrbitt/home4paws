import { apiAssetPath, apiAssetUrl, apiRequest } from './api.js'

const normalizePet = (pet) => pet ? ({
  ...pet,
  image: apiAssetUrl(pet.image),
  images: (pet.images || []).map(apiAssetUrl),
  location: pet.location || pet.city || pet.state || pet.address || '',
  goodWithPets: pet.goodWithPets || { dogs: pet.goodWithDogs ?? null, cats: pet.goodWithCats ?? null },
}) : pet

export const listPets = async (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
  const data = await apiRequest(`/pets${query.size ? `?${query}` : ''}`)
  return { ...data, pets: (data.pets || []).map(normalizePet) }
}
export const getPet = async (id) => { const data = await apiRequest(`/pets/${encodeURIComponent(id)}`); return { ...data, pet: normalizePet(data.pet) } }
export const listMyPets = async () => { const data = await apiRequest('/pets/mine'); return { ...data, pets: (data.pets || []).map(normalizePet) } }

function mutationBody(pet, imageFilesByPreview = {}) {
  const images = Array.isArray(pet.images) ? pet.images : []
  const files = []
  const order = []
  for (const image of images) {
    const file = imageFilesByPreview[image]
    if (file) {
      order.push(`upload:${files.length}`)
      files.push(file)
    } else if (!String(image).startsWith('data:')) {
      order.push(`url:${apiAssetPath(image)}`)
    }
  }
  const payload = { ...pet, images: [] }
  delete payload.imageFilesByPreview
  if (files.length) {
    const body = new FormData()
    body.append('pet', JSON.stringify(payload))
    body.append('imageOrder', JSON.stringify(order))
    for (const file of files) body.append('images', file)
    return body
  }
  payload.images = order.map((item) => item.slice(4))
  return payload
}

export const createPet = async (pet, imageFilesByPreview) => { const data = await apiRequest('/pets', { method: 'POST', body: mutationBody(pet, imageFilesByPreview) }); return { ...data, pet: normalizePet(data.pet) } }
export const updatePet = async (id, pet, imageFilesByPreview) => { const data = await apiRequest(`/pets/${encodeURIComponent(id)}`, { method: 'PUT', body: mutationBody(pet, imageFilesByPreview) }); return { ...data, pet: normalizePet(data.pet) } }
export const updatePetStatus = (id, adoptionStatus) => apiRequest(`/pets/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { adoptionStatus } })
export const deactivatePet = (id) => apiRequest(`/pets/${encodeURIComponent(id)}`, { method: 'DELETE' })

export async function uploadPetImages(id, files) {
  const body = new FormData()
  for (const file of files) body.append('images', file)
  return apiRequest(`/pets/${encodeURIComponent(id)}/images`, { method: 'POST', body })
}
