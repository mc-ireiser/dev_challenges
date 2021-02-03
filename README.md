# Planning poker

Planning poker, also called Scrum poker, is a consensus-based, gamified technique for estimating, mostly used to estimate effort or relative size of development goals in software development. In planning poker, members of the group make estimates by playing numbered cards face-down to the table, instead of speaking them aloud.

The cards are revealed, and the estimates are then discussed. By hiding the figures in this way, the group can avoid the cognitive bias of anchoring, where the first number spoken aloud sets a precedent for subsequent estimates. [wikipedia](https://en.wikipedia.org/wiki/Planning_poker)

## Guidelines to meet in the challenge

In response to [Workana Hiring challenge](guidelines.md)

### Backend endpoints to implement

Let's build a REST API with the following endpoints. Feel free to change some things these
descriptions are only for guidance.

##### `POST /issue/{:issue}/join` - Used to join `{:issue}`.

- If issue not exists generate a new one.
- Must receive a payload with the intended name. ie: `{"name": "florencia"}`
- Feel free to use a session or token to keep identified the user in subsequent requests.

##### `POST /issue/{:issue}/vote` - Used to vote `{:issue}`. Must receive a payload with the vote value.

- Reject votes when status of `{:issue}` is not `voting`.
- Reject votes if user not joined `{:issue}`.
- Reject votes if user already `voted` or `passed`.

##### `GET /issue/{:issue}` - Returns the status of issue

Because during `voting` status the votes are secret you must hide each vote until all members voted.

- Issue is `voting`:
  ```json
  {
    "status": "voting",
    "members": [
      { "name": "florencia", "status": "voted" },
      { "name": "kut", "status": "waiting" },
      { "name": "lucho", "status": "passed" }
    ]
  }
  ```
- Issue is `reveal` when all users emitted their votes:
  ```json
  {
    "status": "reveal",
    "members": [
      { "name": "florencia", "status": "voted", "value": 20 },
      { "name": "kut", "status": "voted", "value": 20 },
      { "name": "lucho", "status": "passed" }
    ],
    "avg": 20
  }
  ```

#### Persistence

For persistence use the `redis` service provided in docker-compose and choose the best combination of operation/data structures that serves for your solution.

### Frontend

Provide an interface to use the system.

- Create or join an issue by number
- Show board with cards for voting
- Show a list of members and the status of each one
- Allow users to vote, pass or leave the issue
- Bonus points if you handle client side routing (you can use libs)

## My solution to the challenge

- PHP
- Node.js
- Vue.js

### Single user view

![GitHub Logo](/img/board.png)

### Multiple users view

![Multiple users](/img/multipleUsers.png)

## Get up and running

To run this code you need:

- [Docker](https://www.docker.com/get-started) and [docker-compose](https://docs.docker.com/compose/install/) installed

Then:

- Clone this repo: `git clone git@github.com:mc-ireiser/dev_challenges.git`.
- Run `docker-compose up`.

Check if services are up and running:

- Node backend in [localhost:8082](http://localhost:8082)
- Frontend server in [localhost:8080](http://localhost:8080/)

## For DEV

To develop modify the services commands in the `docker-compose.yml` file with the following instructions:

services:
backend_node:
command:

```bash
bash -c "npm i && npm run dev"
```

services:
frontend:
command:

```bash
bash -c "npm i && npm run serve"
```

These changes provide a better development experience by avoiding compiling code for production.
