const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { users } = require('./users');
const { items } = require('./items');
const utils = require('./utils');

const typeDefs = gql`    
    interface User {
        id: Int
        name: String
        age: Int
        createdAt: String
    }
    type SuperUser implements User {
        id: Int
        name: String
        age: Int
        createdAt: String
        admin: Boolean
        role: String
        item: Item
    }
    type NormalUser implements User {
        id: Int
        name: String
        age: Int
        createdAt: String
        normal: Boolean
        role: String
    }
    enum Category {
        Rock
        Jazz
        Pops
    }
    type Item {
        id: Int
        name: String
        price: Int
        category: Category
    }
    enum SortOP {
        ASC
        DESC
    }
    enum Multiple {
        double
        triple
        quattro
    }
    type Query {
        hello: String
        hello2: String    
        users(limit: Int, age_sort: SortOP): [User]
        items(limit: Int, category: Category, multiple: Multiple): [Item]
    }
`;

const resolvers = {
    User: {
        __resolveType(parent, context, info){
            if(parent.admin){
                return 'SuperUser'
            }
            if(parent.normal){
                return 'NormalUser'
            }

            return null
        }
    },
    Query: {
        hello: () => 'Test Hello!',
        hello2: ()=> 'Test Hello2!',
        users: (parent, args)=>{
            
            let result = users;
            let limit = args.limit || null;            
            let age_sort = args.age_sort || null;

            if (age_sort) {
                const ope = age_sort === 'ASC' ? 1 : -1;
                result = users.sort((x, y) => {
                    if (x['age'] > y['age']) return ope;
                    if (x['age'] < y['age']) return -(ope);
                    return 0;
                })
            }
            
            if(limit) return result.slice(0, limit);

            return result;
        },
        items: (parent, args)=>{
            
            let result = items;
            let limit = args.limit || null;
            let category = args.category || null;
            let multiple = args.multiple || null;
            
            if(category){
                result = result.filter((result)=>{
                    return result.category === category});
            }

            if(multiple){
                result = result.map((result)=>{
                    result.price = utils.quattro(result.price)
                    return result
                })
            }

            if(limit) return result.slice(0,limit);

            return result;

        }
    }
};

const server = new ApolloServer({typeDefs, resolvers});

const app = express();
server.applyMiddleware({ app });

app.listen({ port:5000 },()=>{
    console.log(`server start localhost:5000${server.graphqlPath}`)
});