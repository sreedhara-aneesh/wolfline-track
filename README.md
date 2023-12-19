# NCSU Live Transit Tracker

An interactive real-time map of the NC State University transit system featuring live tracking of buses, stops, routes, and arrival estimates.

## Gallery

![Wolfline Track Preview](https://user-images.githubusercontent.com/66135494/219526767-2009706f-f140-4ad2-91fd-7e7116b88f28.png)
*Images framed with [MockUPhone](https://mockuphone.com/).*

## Documentation

> Instructions and paths are given relative to this (`frontend`) folder unless stated otherwise.

### System

Your system should have `Docker` installed and running.

The following steps were tested on `Ubuntu 22.04.3 LTS`.

### Installation

Copy `.env.example` to `.env` and modify the below settings in `.env` as needed.
- `FRONTEND_PORT_EXTERNAL`: the port that the frontend will bind to (default is `3000`)
- `BACKEND_PORT_EXTERNAL`: the port that the backend will bind to (default is `5000`)

Follow "Installation" section in [`frontend/README.md`](./frontend/README.md).

Follow "Installation" section in [`backend/README.md`](./backend/README.md).

### Usage

> Make sure you have completed "Initial Configuration" steps.

> Please note that there is no need to follow the "Usage" steps in the `frontend` and `backend` `README.md` files as the compose file handles the spinning up of these services for us.

Run the command below.

```bash
sudo docker compose up --build
```