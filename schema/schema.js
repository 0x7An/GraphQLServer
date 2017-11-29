const graphql = require('graphql');
const axios =require('axios'); 

const{
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString, 
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const HoshinType = new GraphQLObjectType({
    name: 'Hoshin',
    fields: ()=> ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        baseline: { type: GraphQLString },
        objective: { type: GraphQLString },
        goals:{
            type: new GraphQLList(GoalType),
            resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/hoshins/${parentValue.id}/goals`)
               .then(res => res.data);
            }
        }
    })
});

const GoalType = new GraphQLObjectType({
    name: 'Goal',
    fields: ()=> ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        baseline: { type: GraphQLString },
        objective: { type: GraphQLString }
    })
});

const TeamType = new GraphQLObjectType({
    name: 'Team',
    fields: ()=> ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users:{
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/teams/${parentValue.id}/users`)
               .then(res => res.data);
            }
        },
        goals:{
            type: new GraphQLList(GoalType),
            resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/teams/${parentValue.id}/goals`)
               .then(res => res.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {type: GraphQLString },
    firstName: {type: GraphQLString},
    age: {type: GraphQLInt},
    team: {
        type: TeamType,
        resolve(parentValue, args){
          return axios.get(`http://localhost:3000/teams/${parentValue.teamId}`)
            .then(res => res.data);
        }
    }
  })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields:{
        user:{
        type: UserType, 
        args: { id: { type: GraphQLString } },
        resolve(parentValue, args) {
            return axios.get(`http://localhost:3000/users/${args.id}`)
            .then(resp => resp.data);
        }},
        team :{
            type: TeamType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args){
              return axios.get(`http://localhost:3000/teams/${args.id}`)
              .then(res => res.data);
            }
        },
        hoshin :{
            type: HoshinType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args){
              return axios.get(`http://localhost:3000/hoshins/${args.id}`)
              .then(res => res.data);
            }
        },
        goal :{
            type: GoalType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args){
              return axios.get(`http://localhost:3000/goals/${args.id}`)
              .then(res => res.data);
            }
        }
    }
});

const mutation = new GraphQLObjectType ({
    name: 'Mutation',
    fields:{
        addUser: {
            type: UserType,
            args: { 
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, {firstName, age}) {
                return axios.post('http://localhost:3000/users', { firstName, age })
                .then(res => res.data);
            }
        },
        deleteUser: {
            type: UserType,
            args:{
                id: { type:new GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, { id }){
                return axios.delete(`http://localhost:3000/users/${id}`, id)
                .then(res => res.data);
            }
        },
        updateUser:{
            type: UserType,
            args:{
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, args){
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});