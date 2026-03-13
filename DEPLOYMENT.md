# Rakta Deployment Guide

This guide explains how to deploy the Rakta application to production using Vercel and MongoDB Atlas.

## 1. MongoDB Atlas Setup (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account or sign in.
2. Build a new Database cluster (the free shared cluster is sufficient).
3. Under **Database Access**, create a new database user. Set a strong username and password.
4. Under **Network Access**, click "Add IP Address" and select "Allow Access from Anywhere" (`0.0.0.0/0`).
5. Go to your **Databases** view, click **Connect** on your cluster, and choose **Connect your application**.
6. Copy the connection string. Replace `<username>` and `<password>` with the credentials you created in step 3. 
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rakta?retryWrites=true&w=majority`

## 2. Vercel Deployment (Frontend & Backend APIs)

1. Push your Rakta code to a GitHub, GitLab, or Bitbucket repository.
2. Go to [Vercel](https://vercel.com/) and create an account or sign in.
3. Click **Add New** -> **Project** and import your Rakta repository.
4. In the "Configure Project" section, expand the **Environment Variables** tab.
5. Add the following environment variables:
   - `MONGODB_URI`: The connection string you copied from Atlas.
   - `JWT_SECRET`: A long, random string (e.g., `generate_this_securely_using_openssl`) used to sign the authentication cookies.
6. Click **Deploy**.

Vercel will automatically detect that this is a Next.js application, build it, and deploy it to a live edge network.

## 3. Post-Deployment (Optional)

Once the application is live:
1. You can go to `https://your-vercel-domain.vercel.app/register` to create the first admin account manually, OR
2. If you briefly leave the `api/seed/route.js` file (NOT recommended for production), you can hit `/api/seed` in your browser to pre-populate dummy data. **Be sure to delete `app/api/seed/route.js` and push the changes to Vercel immediately after if you use this live.**
