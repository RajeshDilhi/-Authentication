CREATE DATABASE TEST 
GO 
 
USE TEST 
GO 
 CREATE TABLE Roles(RoleId INT IDENTITY(1,1) PRIMARY KEY, RoleType varchar(10) NOT NULL) 
 INSERT INTO Roles (RoleType) VALUES('admin');
 INSERT INTO Roles (RoleType) VALUES('User');

CREATE TABLE Users(Id INT IDENTITY(1,1) PRIMARY KEY, Name varchar(255) NOT NULL, UserName varchar(50), Password varchar(50),RoleId int not null  FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)) 
INSERT INTO Users(Name, UserName, Password,RoleId) VALUES('Mukesh Kumar', 'Mukesh', 'Mukesh@123',1); 
 
CREATE TABLE Employees(Id INT IDENTITY(1,1) PRIMARY KEY, Name varchar(255) NOT NULL, Address varchar(500)) 
INSERT INTO Employees (Name, Address) VALUES('Mukesh Kumar', 'New Delhi') 
INSERT INTO Employees (Name, Address) VALUES('John Right', 'England') 
INSERT INTO Employees (Name, Address) VALUES('Chris Roy', 'France') 
INSERT INTO Employees (Name, Address) VALUES('Anand Mahajan', 'Canada') 
INSERT INTO Employees (Name, Address) VALUES('Prince Singh', 'India')


INSERT INTO Users(Name, UserName, Password,RoleId) VALUES('Rajesh Kumar', 'Rajesh', 'Rajesh@123',2); 



select name,username,RoleType from Users join Roles on Users.RoleId=Roles.RoleId where
Users.UserName='Rajesh' and Users.Password='Rajesh@123'