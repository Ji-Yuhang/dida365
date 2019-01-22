import request from '@/utils/request';



export async function getTodoList() {
  return request.get('/api/v1/todos', {responseType: 'json'});
}

export async function getTodoById(id) {
  return request.get(`/api/v1/todos/${id}`);
}

export async function updateTodoById(id, todo) {
  return request.put(`/api/v1/todos/${id}`, todo);
}
export async function createTodo(text) {
  return request.post(`/api/v1/todos`, {data: JSON.stringify({text: text}), responseType: 'json', requestType: 'json'});
}

export async function batchSaveTodoList(todos) {
  return request.put('/api/v1/todos', {data: JSON.stringify(todos), responseType: 'json', requestType: 'json'});
}
