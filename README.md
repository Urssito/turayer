# luccagram

Luccagram is a social network (currently under development) built with Express.js, React and MongoDB. developed by Lucca Urso, a 20 year old Argentine programmer as a personal project.

### freatures
- Coded on MERN Stack
- Real time notifications with sockets
- Use React Hooks
- working with AJAX
- Intelligent data management in real time
- optimal middleware integration

## How to launch  
 
1. Install dependencies on root directory
    ```shell
    npm install
    ```
2. Install React dependencies
    ```shell
    cd src/app
    npm install
    ```

3. Set enviroment variables
    - Make .env file on root directory
    - Set values of the following variables:
        ```env
        CLIENT_HOST=  // server host url
        MONGO_DB=     // mongo database uri
        ```
    - Add this variable:
        ```env
        DEFAULT_PROFILE_PHOTO=src/app/public/img/main/profilePhoto.jpg
        ```

4. Set React enviroment variables
    - make .env file on ```/app```
    - set this values
        ```env
        REACT_APP_HOST=   // react development server url
        REACT_APP_SERVER= // server host url
        REACT_APP_SOCKET= // socket server url

5. On root directory run:
    ```shell
    npm run dev
    ```

6. On ```src/app``` run:
    ```shell
    npm run start
    ```

7. Enjoy your own social network!