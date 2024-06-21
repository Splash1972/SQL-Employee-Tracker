const inquirer = require('inquirer');
const { pool, query } = require('./db');

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
          'Quit',
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
        case 'Quit':
          console.log('Goodbye!');
          process.exit();
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
};

const handleError = (err) => {
  console.error(err.message);
  mainMenu();
}

const viewAllDepartments = async () => {
  try {
    const result = await query(`
    SELECT * FROM department;
    `);
    console.table(result);
    mainMenu();
  } catch (err) {
    handleError(err);
  }
};

const viewAllRoles = async () => {
  try {
    const result = await query(`
      SELECT * FROM role;
    `);
    console.table(result);
    mainMenu();
  } catch (err) {
    handleError(err);
  }
};

const viewAllEmployees = async () => {
  try {
    const result = await query(`
      SELECT * FROM employee;
    `);
    console.table(result);
    mainMenu();
  } catch (err) {
    handleError(err);
  }
};

function addDepartment() {
  inquirer.prompt({
    name: "name",
    type: "input",
    message: "What Department would you like to add?"
  })
    .then(async function (res) {
      try {
        await query(`INSERT INTO department (name) VALUES ($1)`, [res.name]);
        console.table(res);
        mainMenu();
      } catch (err) {
        handleError(err);
      }
    });
}

function addRole() {
  const query = "SELECT * FROM department";
  pool.query(query, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the role title?"
        },
        {
          name: "salary",
          type: "number",
          message: "What is the salary for the role?"
        },
        {
          name: "department",
          type: "list",
          message: "Choose which department for the new role:",
          choices: res.rows.map(
            (department) => department.department_name
          ),
        }
      ])
      .then((answers) => {
        const department = res.rows.find(
          (department) => department.department_name === answers.department
        );
        if (!department) {
          console.log("Department not found.");
          mainMenu();
          return;
        }
        const query = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
        pool.query(
          query,
          [answers.title, answers.salary, department.department_id],
          (err, res) => {
            if (err) {
              console.error(err.message);
              mainMenu();
            } else {
              console.table(res);
              mainMenu();
            }
          }
        );
      }) 
      .catch ((err) => {
        console.error(err.message);
        mainMenu();
      });
  });

};

const addEmployee = async () => {
  inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "What is the Employee's First Name?"
      },
      {
        name: "last_name",
        type: "input",
        message: "What is the Employee's Last Name?"
      },
      {
        name: "role_id",
        type: "number",
        message: "What is the ID for this role?"
      },
      {
        name: "manager_id",
        type: "number",
        message: "What is the ID for this manager? (if the employee is a manager)"
      }
    ])
    .then(async function (res) {
      try {
        await query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`, [first_name, last_name, role_id, manager_id]);
        console.table(res);
        mainMenu();
      } catch (err) {
        handleError(err);
      }
    });
};

const updateEmployeeRole = async () => {
  inquirer
    .prompt([
      {
        name: "employee_id",
        type: "number",
        message: "What is the employee's ID number?"
      },
      {
        name: "role_id",
        type: "number",
        message: "What is the ID of the new role?"
      }
    ])
    .then(async function (res) {
      try {
        await query(`UPDATE employee SET role_id = $1 WHERE id = $2`, [role_id, employee_id]);
        console.table(res);
        mainMenu();
      } catch (err) {
        handleError(err);
      }
    });
};

mainMenu();
