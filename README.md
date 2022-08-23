# Pets-LostFound


This website is designed as an attempt to help those who have lost a pet, and can submit a post which other users will be able to see, along with staff access to update information. The site, for this part, is made of five html files, a single css files and two js files. 
The html files define the following pages:

Registration: Lets the user “create” an account where the user can determine their data. To register as staff, they would need to have predefined staff ID code. Once all the fields are filled, the registration is successful and the data is input into the database (into a table called users).

> Login: Allows the user to login using their credentials, that are retrieved and checked for validity from the database (from the table called users). The username is then is then saved in local storage, that helps prevent other users from logging in, unless storage is cleared on logout.

> Home: Users hey can submit a lost pet post by giving the name and description, which gets saved in the database (into a table called lostpets). This page also shows the currently missing pet posts are shown, if any, along with the user’s data that they belong to. 

> Found: Similar to the home page, but does not take any input from the user. It shows all the pet posts, in the database table, have a boolean value of true, indicating having been found. This and the home page do not show the same pets ever, segregated by the lost or found status.

> Staff: This page is only accessible by those users with staff status of true in the database table. Here the staff users are able to see all the “customers” and their data. They can either search for a username, or click on one of the individual user data reports, to display their data at the top. This means that user’s data is “selected” to be changed accordingly; their username, full name, staff status, update one of their pet reports, or even delete the report/user entirely.

> PostgreSQL: This replaces MySQL for the database server, the benefit in this is, while the syntax is similar, the postgres database server can connect to pgAdmin4.

> pgAdmin4: Earlier, the only method of looking at the database was through the terminal, this allows the database to be viewed and updated on a server online with a more interactive GUI.
 [However, this is only used if the postgres database is hosted locally, can be replaced with simply 'pg' when using a online hosting service]


> React: This simply replaces a few lines in the main javascript file that writes to the html pages, allowing for a slightly easier method of rendering and creating new element tags.

> React-dom: This allows easier rendering of react in the project.

> @Bable: This allows writing react with html syntax instead of react methods.

> Bootstrap: While a little css was used for part A, it was not much compared to the options and scope offered by bootstrap for frontend customizability.

> Helmet module: Makes server more secure by updating http headers to hide sensitive content.

> Express-xss-sanitizer module: Prevents Cross Site Scripting from user input by “sanitizing” it before use, to avoid sql injection. Also done through parameterized queries in postgres code.



