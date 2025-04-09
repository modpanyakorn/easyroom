<p align="center">
  <img src="https://github.com/NiceVani/internet/blob/main/logo.png?raw=true" alt="EasyRooms Logo" width="300px" height="300px">
</p>
<h3 align="center">
  Booking Rooms. Reservation System
</h3>

## Easy Rooms Reservation.

A final group working web application project in Internet Programming class

### Web Application

#### Start Services (Run services via Docker Container)

##### Start

```bash
docker-compose up -d --build
```

##### Stop

```bash
docker-compose down
```

### To Open Web Page

for Docker Container Service we set directory path frontend deployment to `src/frontend` directory

- Port `5501`: `Apache Web Server` serving the EasyRoom application.
- Port `8000`: `phpMyAdmin` for managing the MySQL database.
- Port `3000`: Running `Express` Backend Server.

Example: "Open Login Page"

```bash
localhost:5501
```

### Architecture

```bash
easyroom-reservation/
├── docker-compose.yml
├── Dockerfile
├── easyroom.sql (Backup DataBase)
├── .gitignore
├── .env (Docker config)
└── src/
    ├── frontend/
    │   └── index.html (Login file)
    │   └── booker/
    │   └── admin/
    │   └── executive/
    │   └── script/
    │       └── auth.js (Sessions checking)
    │       └── config.js (Frontend config, API URL, ...)
    │
    └── backend/
        ├── certificate/
        ├── core/
        │   └── auth/ (Sessions orchestration)
        │   └── db.js (DataBase connection)
        ├── modules/
        │   └── booker/
        │   └── admin/
        │   └── executive/
        ├── storage/
        │   └── equipment_img/
        ├── .env (Backend config, API HOST, API PORT, DB HOST, ...)
        ├── package.json
        └── server.js (Collect All Routing Path API)
```

### Configuration

in `docker-compose.yml`

### Installation

- **Docker:** Make sure Docker is installed on your system. You can download it from [here](https://www.docker.com/get-started).
