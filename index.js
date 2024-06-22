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
    SELECT e.id, e.first_name, e.last_name, r.title AS role, e.manager_id
    FROM employee e
    JOIN role r ON e.role_id = r.id;
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
// XPert learning assistant helped with this:
function addRole() {
  const departmentQuery = "SELECT * FROM department";
  pool.query(departmentQuery, (err, res) => {
    if (err) {
      console.error(err.message);
      mainMenu();
      return;
    }

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
          choices: res.rows.map((department) => department.name)
        }
      ])
      .then((answers) => {
        const selectedDepartment = res.rows.find(
          (department) => department.name === answers.department
        );

        if (!selectedDepartment) {
          console.log("Department not found.");
          mainMenu();
          return;
        }

        const roleQuery = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
        pool.query(
          roleQuery,
          [answers.title, answers.salary, selectedDepartment.id],
          (err, res) => {
            if (err) {
              console.error(err.message);
            } else {
              console.log('Role added successfully');
            }
            mainMenu();
          }
        );
      })
      .catch((err) => {
        console.error(err.message);
        mainMenu();
      });
  });
}

const addEmployee = async () => {
  // Fetch the list of roles from the database
  const roles = await query("SELECT id, title FROM role");

  // Extract role choices for the prompt
  const roleChoices = roles.map(role => ({
    name: role.title,
    value: role.id
  }));

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
        type: "list",
        message: "Select the Employee's Role:",
        choices: roleChoices
      },
      {
        name: "manager_id",
        type: "number",
        message: "What is the ID for this manager? (if the employee is a manager)"
      }
    ])
    .then((answers) => {
      const pgDb = 
      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
      pool.query(pgDb, [answers.first_name, answers.last_name, answers.role_id, answers.manager_id],
        (err, res) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log('Employee added successfully');
          }
          mainMenu();
        }
      );
    })
    .catch((err) => {
      console.error(err.message);
      mainMenu();
    });
};


const updateEmployeeRole = async () => {
  // Fetch the list of employees from the database
  const employees = await query("SELECT id, first_name, last_name FROM employee");

  // Extract employee choices for the prompt
  const employeeChoices = employees.map(employee => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
  }));

  // Fetch the list of roles from the database
  const roles = await query("SELECT id, title FROM role");

  // Extract role choices for the prompt
  const roleChoices = roles.map(role => ({
    name: role.title,
    value: role.id
  }));

  inquirer
    .prompt([
      {
        name: "employee_id",
        type: "list",
        message: "Select the Employee to Update:",
        choices: employeeChoices
      },
      {
        name: "role_id",
        type: "list",
        message: "Select the Employee's New Role:",
        choices: roleChoices
      }
    ])
    .then(async function (res) {
      const { employee_id, role_id } = res;
      try {
        // Get the employee's name
        const employee = await query("SELECT first_name, last_name FROM employee WHERE id = $1", [employee_id]);
        
        // Update the employee's role
        await query(`UPDATE employee SET role_id = $1 WHERE id = $2`, [role_id, employee_id]);

        console.log(`Successfully updated ${employee[0].first_name} ${employee[0].last_name}'s role.`);
        console.table(res);
        mainMenu();
      } catch (err) {
        handleError(err);
      }
    });
};

mainMenu();
