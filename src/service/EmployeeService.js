const dynamodbClient = require('../../src/utils/DynamoDBClient');
const EmployeeRepository = require('../repository/EmployeeRepository');

class EmployeeService {
    constructor() {
        this.employeeRepository = new EmployeeRepository(dynamodbClient);
    }
    async getEmployeeById(id) {
        const employee = await this.employeeRepository.get(id);
        return employee;
    }
    async getAllEmployeeDetails() {
        const employees = await this.employeeRepository.scan();
        return employees.Items;
    }
    async addEmployee(employee) {
        await this.employeeRepository.put(employee);
        return employee;
    }
    async removeEmployee(id) {
        await this.employeeRepository.delete(id);
        return { message: 'Employee deleted successfully' };
    }
}

module.exports = EmployeeService;