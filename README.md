# Matcha - Online Dating Platform

Matcha is a **dating site** where you can **swipe** through various profiles intelligently suggested based on **your search criteria**, **interests,** and **location**. You can **like** profiles, and when there's a **match**, start a **conversation**!
The application covers the entire journey, from registration to the ultimate meeting. You can see who has **viewed** your profile and also protect yourself by **reporting** and/or **blocking** certain users.

*In the digital age, even romance is not immune to industrialization. Matcha harnesses the power of technology to streamline the romantic connection process. Our dating site ensures a sophisticated and secure environment for two potential lovers to meet and connect, from the initial registration to the exciting possibility of a real meeting.*

## Table of Contents
- [Tech Stack](#tech-stack)
- [Installation Instructions](#installation-instructions)
- [Features](#features)
- [Testing & Simulation](#testing-&-simulation)
- [Environment Files](#environment-files)

## Tech Stack

**Client:** ![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)

**Server:**
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

**Containers:**
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

**Database**
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)

## Installation Instructions
To set up and launch this project, follow the detailed steps below:

### Prerequisites
- **npm**: Necessary to install project dependencies.

### Configuration of Environment Files
Before starting the application, you need to configure the necessary environment files for the application to function. Follow the detailed instructions in the [Environment Files Configuration](#link-to-environment-files-configuration-section) section to create these files.

### Launching the Project
Once the prerequisites are installed and the environment files configured, use the `Makefile` to launch the project:
```bash
make
```

## Features
Discover the main features of the application:

### Registration
Registration on Matcha is both simple and secure. To create an account, a user must provide their **email address**, a **username**, their **last name**, their **first name**, and a **password**. The password must meet **robustness criteria**. It is strengthened by **encryption measures**.
After registration, an **email** containing a **unique link** is sent to the user to **verify** their account, thus ensuring that each account is associated with a valid **email address**. Once registered, the user can log in with their username and password.
If a user **forgets** their **password**, they can easily request to **reset** it via an **email link**.
We place particular importance on the **security** of the **one-time tokens** used for email verification and password resetting.
**Logging out** is possible with just one click from any page on the site.

### Users Profiles
Upon first login, the user must **fill in** their information to benefit from the **intelligent suggestion algorithm**.
The user must specify:
- Their **gender**
- Their **gender preferences**
- A **short biography**
- A **list of interests** in the form of **tags** (e.g., #sport, #streetfood, etc.)
- From **1 to 5 profile images**

The user can **modify** this information at any time, as well as their name, first name, and email address.

#### His Profile
On his profile, the user can view the **list of people** who have **visited** their profile and those who have **liked** them.
The user can also see their **public fame rating**, whose criteria are defined to reflect relevance and engagement on the platform.
Regarding **location**, the application uses **GPS positioning** to determine the user's location, thus allowing for nearby profile suggestions. If the user prefers not to share their location, the application can still locate the user via his **IP address**. The user can modify his GPS positioning in his profile, thus controlling their location and visibility on the site.

#### Other Users' Profiles
The application allows users to view other users' profiles, displaying all available information except for the email address and password. Users can see others' **fame ratings**, whether a user is **online**, or the **date and time of their last connection**.
Each profile visit is recorded in the user's visit history and communicated to the visited profile.

Users can **like** other users' profiles. When two users like each other mutually, they are considered "**connected**" and can **chat** via the app's chat feature.
Users also have the option to withdraw a previously given like, which **stops notifications** and the possibility of discussion with that user.
They can also **report** an account and/or **block** users, making them invisible in **search results** and stopping notifications from them.

### Home and Navigation
The application suggests a list of **relevant profiles** to the user, tailored to their preferences and personal characteristics.
The suggestions are intelligent and based on several criteria: **gender** and **sexual preferences**, **geographic proximity**, the presence of **common tags**, and level of "**popularity**." Priority is given to people located in the same **geographic area** as the user.
The list can be sorted and filtered by age, location, fame rating, and common tags, thus allowing users to easily find profiles that precisely match their interests and preferences.

### Search
The application allows users to perform **advanced searches** by selecting one or more specific criteria, such as **age gap**, **fame rating gap**, **location**, and one or more **interest tags**.
The resulting list of suggested profiles can then be sorted and filtered by age, location, fame rating, and tags.
This feature ensures that users can refine their searches to find profiles that exactly meet their selection criteria, thus improving the chances of finding compatible matches.

### Chat
Users can **chat in real-time** from the chat page. The interface is designed to easily switch from one conversation to another through a **conversation history**. The user can see whether the user they are chatting with is **connected** or not, as well as their **date of last connection**.

### Notifications
The application **notifies users in real-time** of various events to enhance the user experience and engagement.
Users are notified when:
- They **receive a like**
- Their **profile is viewed** by another user
- They **receive a message**

Notifications are present in the application's navigation bar. The user can see their **notification history** and which notifications have been read or not.

## Testing & Simulation
For testing the application, **over 500 profiles are integrated** into the database. These profiles cover all available characteristics (gender, gender preferences, age, interest tags, etc.). About thirty **AI-generated photos** are used randomly to illustrate the profiles.

## Environment Files
The application requires environment files to function properly. These files contain essential information that must not be disclosed publicly.

### .env, at the project root
```
MYSQL_HOST=: // Address of the MySQL host, where the database is located.
MYSQL_DATABASE=: // Name of the MySQL database used by the application.
MYSQL_USER=: // Username for accessing the MySQL database.
MYSQL_PASSWORD=: // Password associated with the MySQL user.
MYSQL_ROOT_PASSWORD=: // Root password for administrator access to MySQL.
```
### ./frontend/src/environments/environment.ts

This environment file has been integrated into the frontend to simplify testing, given that this project is intended for local use only.

```typescript
export const environment = 
{
    backendUrl: "", // Base URL for backend requests.
    location_iq_key: "", // API key for the LocationIQ localization service.
    CLIENT_ID_GOOGLE: "", // Client ID for Google OAuth authentication.
    CLIENT_SECRET_GOOGLE: "" // Client secret for Google OAuth authentication.
};
```
### ./backend/.env
```
NODE_PORT=: // Port on which the Node.js server will listen.
HOST=: // Host address for the backend server.
DATABASE=: // Name of the specific database for the backend.
USER=: // Username to access the backend database.
PASSWORD=: // Password for the backend database user.
JWT_SECRET=: // Secret used to sign JWT tokens.
JWT_EXPIRES_IN=: // Duration of validity for JWT tokens.
EMAIL=: // Email address used for automated email sending.
EMAIL_PASSWORD=: // Password for the email address used for sending emails.
FRONTEND_URL=: // Base URL of the frontend of the application.
BACKEND_URL=: // Base URL of the backend of the application.
```

Project made with ❤️ by [**cgangaro**](https://github.com/cgangaro) and [**Kiripiro**](https://github.com/Kiripiro).