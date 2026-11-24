import api from './api'

/** GET /api/task/my-tasks — every task owned by the signed-in user. */
export async function getMyTasks(signal) {
  const { data } = await api.get('/task/my-tasks', { signal })
  return Array.isArray(data) ? data : []
}

/** GET /api/task/{id} */
export async function getTaskById(id) {
  const { data } = await api.get(`/task/${id}`)
  return data
}

/** POST /api/task */
export async function createTask(task) {
  const { data } = await api.post('/task', task)
  return data
}

/** PUT /api/task/{id} */
export async function updateTask(id, task) {
  const { data } = await api.put(`/task/${id}`, task)
  return data
}

/** DELETE /api/task/{id} — the backend answers with 204 No Content. */
export async function deleteTask(id) {
  await api.delete(`/task/${id}`)
}
