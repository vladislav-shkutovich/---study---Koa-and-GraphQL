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
    deleteTodoById(id: ID!): Todo
  }
`);

const root = {
  getTodos: () => todos,

  getTodoById: ({ id }) => todos.find((todo) => todo.id === id),

  createTodo: ({ title, description, isCompleted }) => {
    const newTodo = new Todo(
      `todo_${todos.length + 1}`,
      title,
      description,
      isCompleted,
    );

    todos.push(newTodo);

    return newTodo;
  },

  updateTodo: ({ id, title, description, isCompleted }) => {
    const todo = todos.find((todo) => todo.id === id);

    if (!todo) {
      throw new Error('Todo not found');
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (isCompleted !== undefined) todo.isCompleted = isCompleted;

    return todo;
  },

  deleteTodoById: ({ id }) => {
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      throw new Error('Todo not found');
    }

    const removed = todos.splice(index, 1);
    return removed[0];
  },
};

router.all(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
