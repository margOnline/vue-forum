export const findById = (resources, id) => {
  if (!resources) return null
  resources.find(resource => resource.id === id)
}
export const upsert = (resources, resource) => {
  const index = resources.findIndex(res => res.id === resource.id)
  if (resource.id && index !== -1) {
    resources[index] = resource
  } else {
    resources.push(resource)
  }
}
