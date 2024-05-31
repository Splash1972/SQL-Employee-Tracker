require('dotenv').config();
const inquirer = require('inquirer');
const express = require('express');
const { pool, query } = require('./db');

const app = express();

const PORT = process.env.PORT || 3001;

const mainMenu = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'option',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.option) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
};


const viewAllDepartments = async () => {
  try {
    const result = await query(`
    SELECT * FROM department;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error(err.message);
  }
};

const viewAllRoles = async () => {
  try {
    const { rows } = await query(`
      SELECT * FROM role;
    `);
    console.table(rows);
  } catch (err) {
    console.error(err.message);
  }
};

const viewAllEmployees = async () => {
  const { rows } = await query(`
      SELECT * FROM employee;
    `);
  console.table(rows);
};

const addDepartment = async (name) => {
  await query('INSERT INTO department (name) VALUES ($1)', [name]);
};

const addRole = async (title, salary, department_id) => {
  await query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
};

const addEmployee = async (first_name, last_name, role_id, manager_id) => {
  await query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
};

const updateEmployeeRole = async (employee_id, role_id) => {
  await query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
};


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mainMenu();