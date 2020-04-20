const { buildSchema } = require('graphql');
const { gql } = require('apollo-server-express');
const EmployeeService = require('../src/service/EmployeeService')
// GraphQL schema
const typeDefs = gql(`
    type Query {
        getEmployeeById(id:ID!): EmployeeResponse
        getAllEmployeeDetails: [EmployeeResponse]
    }
    type Mutation {
        addEmployee(employee: EmployeeInput): EmployeeResponse
        removeEmployee(id:ID!): RemoveEmployeeResponse
    }
    type RemoveEmployeeResponse {
        message: String
    }
    type Response {
        code: String
        message: String
    }
    type EmployeeResponse {
        id: ID!
        firstName: String
        lastName: String
    }
    input EmployeeInput {
        id: ID!
        firstName: String
        lastName: String
    }
`);
// resolver
const resolvers = {
    Query: {
        getEmployeeById: async (_parent, args) => {
            const employeeService = new EmployeeService();
            const employeeDetails = await employeeService.getEmployeeById(args);
            return employeeDetails;
        },
        getAllEmployeeDetails: async () => {
            const employeeService = new EmployeeService();
            const employeeDetails = await employeeService.getAllEmployeeDetails();
            return employeeDetails;
        }
    },
    Mutation: {        
        addEmployee: async (_parent, args) => {
            const employeeService = new EmployeeService();
            const employeeDetails = await employeeService.addEmployee(JSON.parse(JSON.stringify(args.employee)));
            return employeeDetails;
        },
        removeEmployee: async (_parent, args) => {
            const employeeService = new EmployeeService();
            const response = await employeeService.removeEmployee(args);
            return response;
        }
    }
};

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
