\c employee_db;
-- Seed data for the department table
INSERT INTO department (name) VALUES 
('Engineering'),
('Marketing'),
('Sales');

-- Seed data for the role table
INSERT INTO role (title, salary, department_id) VALUES 
('Software Engineer', 80000.00, 1),
('Marketing Specialist', 60000.00, 2),
('Sales Manager', 70000.00, 3);

-- Seed data for the employee table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Mike', 'Johnson', 3, 1);