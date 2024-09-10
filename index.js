import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { graphqlHTTP } from 'koa-graphql';
import { buildSchema } from 'graphql';

const app = new Koa();
const router = new Router();

class Todo {
  constructor(id, title, description, isCompleted) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isCompleted = isCompleted;
  }
}

let idCounter = 1;
const todos = [];

const schema = buildSchema(`
  type Todo {
    id: ID!
    title: String!
    description: String
    isCompleted: Boolean!
  }
  
  type Query {
    getTodos: [Todo]
    getTodoById(id: ID!): Todo
  }
  
  type Mutation {
    createTodo(title: String!, description: String, isCompleted: Boolean!): Todo
    updateTodo(
      id: ID!,
      title: String,
      description: String,
      isCompleted: Boolean
    ): Todo
    deleteTodo(id: ID!): Todo
  }
`);

const rootValue = {
  getTodos: () => todos,

  getTodoById: ({ id }) => todos.find((todo) => todo.id === id),

  createTodo: ({ title, description, isCompleted }) => {
    const newTodo = new Todo(
      idCounter.toString(),
      title,
      description,
      isCompleted,
    );

    idCounter++;
    todos.push(newTodo);

    return newTodo;
  },

  updateTodo: ({ id, title, description, isCompleted }) => {
    const todo = todos.find((todo) => todo.id === id);

    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }

    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.isCompleted = isCompleted ?? todo.isCompleted;

    return todo;
  },

  deleteTodo: ({ id }) => {
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }

    const deletedTodo = todos.splice(index, 1);

    return deletedTodo[0];
  },
};

router.all(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  }),
);

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());

app.listen(4000);
