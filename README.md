# Wolfline Track

---

The point of this project is to make it easier for NC State students to track campus buses to make more informed decisions for their commutes.

## How it Works

---

This system connects to the TransLoc API to pull information on NC State buses and routes in real time. Using this information, visuals are rendered on a map which is displayed to the user.

Future plans include the addition of a routing feature, leveraging the HERE Transit API to create route suggestions for users on NC State's campus.

## General Usage

---

COMING SOON - This is a web application, but it is not ready for use by the general public as of yet.

## Developer

---

### Quickstart

Installation is easily done via the command line.

```
git clone https://github.com/sreedhara-aneesh/wolfline-track.git

cd wolfline-track

npm install
```

At this point, the application is not yet ready to be run. You must create a `.env` file within the `src` directory, and add the following to it. You can learn how to get a RapidAPI key here - https://docs.rapidapi.com/docs/keys .

```
REACT_APP_TRANSLOC_KEY=<YOUR-RAPIDAPI-KEY-HERE>
REACT_APP_TRANSLOC_HOST="transloc-api-1-2.p.rapidapi.com"
```

Finally, run the following.

```
npm start
```