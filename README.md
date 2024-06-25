# Netflix Clone - Node.js Server

## Description
The backend component of a Netflix clone, built with Node.js, Express.js, and MongoDB. This server provides API endpoints for user and admin functionalities, supporting video management and user authentication.

## Features
- **API Endpoints**: RESTful API endpoints for users and admin functionalities.
- **User Authentication**: Implemented authentication using JWT.
- **Video Management**: Manage video uploads, transcoding statuses, and HLS streaming URLs with AWS-sdk.
- **Database**: MongoDB for data storage and retrieval.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- AWS-sdk

## Installation Instructions

1. **Clone the repository**:
   ```sh
   git clone https://github.com/Althaf-codes/netflix-clone-server.git
   cd netflix-clone-server

2. Install dependencies:
   ```sh
   npm install

3. Configure environment variables:
   Create a .env file in the root directory with the following content:
   ```sh
   MONGO_URI = your_MONGO_URI 
   JWT_SECRET = your_JWT_SECRET 
   ACCESS_TOKEN_SECRET = your_ACCESS_TOKEN_SECRET 
   ACCESS_TOKEN_EXPIRY = your_ACCESS_TOKEN_EXPIRY 
   REFRESH_TOKEN_SECRET = your_REFRESH_TOKEN_SECRET 
   REFRESH_TOKEN_EXPIRY = your_REFRESH_TOKEN_EXPIRY 
   AWS_ACCESS_KEY = your_AWS_ACCESS_KEY 
   AWS_SECRET_KEY = your_AWS_SECRET_KEY 

4. Run the server:
   ```sh
   npm start

