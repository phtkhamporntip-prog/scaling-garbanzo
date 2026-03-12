# scaling-garbanzo

## Description

This is a backend for a Scaling Garbanzo Trading App where users can invest their money for trading purposes. It is built with implementing CRUD operations, used `$transaction` for logical groups of processing data in _MongoDB_ that needs to encapsulate several operations, pagination and filtering using _Prisma_, _MongoDB_, _TypeScript_ and _Express_.

## Features

- Implemented CRUD operations
- Implemented Authentication and Authorization
- Implemented Pagination and Filtering
- Implemented `$transaction` for logical groups of processing data in _MongoDB_
- Implemented `Zod` for validation
- Implemented `JWT` for authentication
- Implemented `Bcrypt` for hashing passwords
- Implemented `Prisma` for ORM
- Implemented `TypeScript` for type checking

## Technologies Used

- Express.js
- TypeScript
- Prisma
- MongoDB
- Zod
- JWT
- Bcrypt

## Project Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run in Development

```bash
npm run start-dev
```

### Build

```bash
npm run build
```

### Run Production

```bash
npm start
```

## API Endpoints

### Auth

- Register `POST /api/v1/auth/register`
- Login `POST /api/v1/auth/login`

### User

- Get All Users `GET /api/v1/users` [Authenticated]
- Get User by id `GET /api/v1/users/:id` [Authenticated]
- Update User `PATCH /api/v1/users/:id` [Admin only]
- Delete User `DELETE /api/v1/users/:id` [Admin only]

### Wallet

- Get All Wallets `GET /api/v1/wallets/` [Admin only]
- Get Wallet by id `GET /api/v1/wallets/:id` [user, staker, investor]

### Deposit

- Create Deposit `POST /api/v1/deposits/createDeposit` [user & admin]
- Get All Deposits `GET /api/v1/deposits` [Admin only]
- Get Deposit by id `GET /api/v1/deposits/:id` [Admin, user, investor, staker]

### Referrals

- Create Referral `POST /api/v1/referrals/createReferral` [staker & admin]
- Get All Referrals `GET /api/v1/referrals` [Admin only]
- Get Referral by id `GET /api/v1/referrals/:id` [Admin, staker, investor]

### Referral Income

- Get All Referral Incomes `GET /api/v1/referral-incomes/all` [Admin only]
- Get Referral Income by id `GET /api/v1/referral-incomes/:id` [Admin, staker, investor, user]

### Staking

- Create Staking `POST /api/v1/stakers/startStaking` [staker, investor, admin]
- Get All Stakes `GET /api/v1/stakers` [Admin only]
- Get Stake by id `GET /api/v1/stakers/:id` [Admin, staker, investor]

### Stake Reward

- Trigger Daily Stake Rewards `GET /api/v1/stake-rewards/stakeRewards` [Admin only]
- Get All Stake Rewards `GET /api/v1/stake-rewards/all` [Admin only]
- Get Stake Reward by id `GET /api/v1/stake-rewards/:id` [Admin, staker, investor]

### Income

- Get All Incomes `GET /api/v1/incomes/all` [Admin only]
- Get Income by id `GET /api/v1/incomes/:id` [Admin, staker, investor]
- Update Income `PATCH /api/v1/incomes/:id` [Admin only]

### Withdraw

- Get All Withdrawals `GET /api/v1/withdrawals/all` [Admin only]
- Get Withdrawal by userId `GET /api/v1/withdrawals/:id` [Admin, user, staker, investor]
- Withdraw money `POST /api/v1/withdrawals/withdraw-money` [Admin, staker, investor]