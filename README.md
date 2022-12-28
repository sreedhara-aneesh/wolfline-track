# Wolfline Track

This project was made to provide a live tracking system for the Wolfline - North Carolina State University's bus system.

## Installation and Usage

### Prerequisites

First, get your RapidAPI key (see: [https://docs.rapidapi.com/docs/keys](https://docs.rapidapi.com/docs/keys)).

Then, copy `.env.example` to `.env` and fill in values as specified below.

```
REACT_APP_TRANSLOC_HOST=transloc-api-1-2.p.rapidapi.com
REACT_APP_TRANSLOC_KEY=<YOUR_RAPID_API_KEY_HERE>
```

> Note: Don't include the `<>`. So, if your key is `abc`, then your `.env` file should have an entry like `REACT_APP_TRANSLOC_KEY=abc`, not `REACT_APP_TRANSLOC_KEY=<abc>`.

### Development

todo

### Production

Run the below command.
```
sudo docker compose up --build
```