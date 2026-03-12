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

## MongoDB Atlas Setup

Follow these steps to create a MongoDB Atlas cluster and connect it to this project:

### 1. Create a MongoDB Atlas Cluster

1. Sign up or log in at [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **"Build a Database"** and choose the **Free (M0)** tier
3. Select your preferred cloud provider and region, then click **"Create"**

### 2. Configure Network Access

1. In the left sidebar, click **"Network Access"** under **Security**
2. Click **"Add IP Address"**
3. To allow connections from Vercel (and anywhere during testing), enter `0.0.0.0/0` and click **"Confirm"**
   > ⚠️ After testing, tighten access by replacing `0.0.0.0/0` with Vercel's static IP ranges (available on Vercel Pro/Enterprise) or another network restriction strategy

### 3. Create a Database User

1. In the left sidebar, click **"Database Access"** under **Security**
2. Click **"Add New Database User"**
3. Choose **Password** authentication and enter a username and a strong password
4. Set the role to **"Read and write to any database"**
5. Click **"Add User"**

### 4. Get Your Connection String (`DATABASE_URL`)

1. On the **Database** overview page, click **"Connect"** on your cluster
2. Select **"Drivers"**
3. Copy the connection string — it will look like:
   ```
   mongodb+srv://<db_username>:<db_password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority&appName=<AppName>
   ```
4. Replace `<db_username>` and `<db_password>` with your database user's credentials, and `<database-name>` with your database name (e.g. `scaling-garbanzo`):

   ```
   mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/scaling-garbanzo?retryWrites=true&w=majority&appName=scaling-garbanzo
   ```

## Vercel Deployment

### 1. Set Environment Variables in Vercel

In the [Vercel Dashboard](https://vercel.com/dashboard), navigate to your project → **Settings** → **Environment Variables** and add the following (at minimum for the **Production** environment, and optionally **Preview** for preview deployments):

| Variable | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/scaling-garbanzo?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `5000` | Server port |
| `SALT_ROUNDS` | `12` | Bcrypt salt rounds |
| `APP_NAME` | `scaling-garbanzo` | Application name |
| `JWT_SECRET` | `<random-secret>` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry duration |

> **Tip:** Generate a strong `JWT_SECRET` with: `openssl rand -base64 32`

### 2. Redeploy

After adding or updating environment variables in Vercel, you must redeploy for the changes to take effect:

1. Go to your project in the Vercel Dashboard
2. Click the **Deployments** tab
3. Click the three-dot menu on the latest deployment and select **"Redeploy"**

Alternatively, push a new commit to trigger an automatic redeployment.

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
